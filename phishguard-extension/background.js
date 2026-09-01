/**
 * PhishGuard AI - Extension Background Service Worker (Manifest V3)
 * Handles backend requests, rate limiting, caching, session stats, and health monitoring.
 */

const BACKEND_BASE_URL = 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 7000;

// Initialize session stats on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    phishguard_stats: {
      total: 0,
      safe: 0,
      suspicious: 0,
      phishing: 0
    }
  });
  console.log('[PhishGuard Background] Extension installed and stats initialized.');
});

// Helper to update session statistics in chrome.storage.local
async function updateStats(status) {
  try {
    const data = await chrome.storage.local.get('phishguard_stats');
    const stats = data.phishguard_stats || { total: 0, safe: 0, suspicious: 0, phishing: 0 };
    stats.total += 1;
    if (status === 'SAFE') stats.safe += 1;
    else if (status === 'SUSPICIOUS') stats.suspicious += 1;
    else if (status === 'PHISHING') stats.phishing += 1;

    await chrome.storage.local.set({ phishguard_stats: stats });
  } catch (err) {
    console.error('[PhishGuard Background] Failed to update stats:', err);
  }
}

// Fetch with timeout helper
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Listener for messages from content.js or popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PHISHGUARD_QUICK_ANALYZE') {
    handleQuickAnalyze(message.payload)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ status: 'OFFLINE', error: err.message }));
    return true; // Async response
  }

  if (message.type === 'PHISHGUARD_FULL_ANALYZE') {
    handleFullAnalyze(message.payload)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ error: err.message }));
    return true; // Async response
  }

  if (message.type === 'CHECK_BACKEND_HEALTH') {
    checkHealth()
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ online: false }));
    return true; // Async response
  }

  if (message.type === 'GET_SESSION_STATS') {
    chrome.storage.local.get('phishguard_stats', (res) => {
      sendResponse(res.phishguard_stats || { total: 0, safe: 0, suspicious: 0, phishing: 0 });
    });
    return true;
  }
});

// Quick Analysis Handler
async function handleQuickAnalyze(payload) {
  try {
    const response = await fetchWithTimeout(`${BACKEND_BASE_URL}/api/quick-analyze`, {
      method: 'POST',
      body: JSON.stringify({
        sender: payload.sender || '',
        subject: payload.subject || '',
        snippet: payload.snippet || ''
      })
    });

    if (!response.ok) {
      console.warn(`[PhishGuard Background] HTTP ${response.status} from backend`);
      return {
        status: 'OFFLINE',
        risk_score: null,
        risk_level: 'UNKNOWN',
        primary_reason: `Backend error (HTTP ${response.status})`
      };
    }

    const data = await response.json();
    await updateStats(data.status);
    return data;
  } catch (error) {
    console.warn('[PhishGuard Background] Quick analyze failed or offline:', error.message);
    return {
      status: 'OFFLINE',
      risk_score: null,
      risk_level: 'UNKNOWN',
      primary_reason: 'Backend service offline or unreachable.'
    };
  }
}

// Full Analysis Handler
async function handleFullAnalyze(payload) {
  try {
    const response = await fetchWithTimeout(`${BACKEND_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: JSON.stringify({
        sender: payload.sender || '',
        receiver: payload.receiver || '',
        subject: payload.subject || '',
        body: payload.body || ''
      })
    }, 10000);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();
    // Save to chrome.storage.local so React application can access latest full analysis if opened
    await chrome.storage.local.set({ phishguard_latest_full_analysis: data });
    return { success: true, data };
  } catch (error) {
    console.error('[PhishGuard Background] Full analyze failed:', error);
    return { success: false, error: error.message };
  }
}

// Health Check Handler
async function checkHealth() {
  try {
    const response = await fetchWithTimeout(`${BACKEND_BASE_URL}/health`, { method: 'GET' }, 3000);
    if (response.ok) {
      const data = await response.json();
      return { online: true, data };
    }
  } catch (e) {
    // ignore
  }
  return { online: false };
}
