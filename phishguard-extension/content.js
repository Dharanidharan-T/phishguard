/**
 * PhishGuard AI - Gmail Real-Time Threat Indicator Content Script
 * Robust Gmail DOM integration with layered selectors, caching, debouncing, and rate limiting.
 */

(function () {
  'use strict';

  console.log('[PhishGuard AI] Content script loaded into Gmail.');

  // Global state
  const processedRows = new Set();
  const memoryCache = new Map(); // Key: fingerprint, Value: { data, timestamp }
  const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  const MAX_CONCURRENT_REQUESTS = 4;
  let activeRequestCount = 0;
  const pendingQueue = [];
  let scanDebounceTimer = null;

  // Layered Gmail Selectors Strategy
  const SELECTORS = {
    rows: [
      'tr.zA',
      'tr[role="tr"]',
      'table.F.cf tr',
      '[role="main"] tbody tr',
      'tr.y6',
      'tr.x7'
    ],
    sender: [
      '.yW span',
      '.zF',
      'span[email]',
      '[data-hovercard-id]',
      'td.yX .yW',
      'span.bA4',
      '.yW'
    ],
    subject: [
      '.y6 span',
      '.bog',
      'span.bqq',
      'td.xY span',
      '.a4W span',
      '.y6'
    ],
    snippet: [
      '.y2',
      '.y6 .y2',
      'span.y2',
      '.a4W .y2'
    ],
    starArea: [
      'td.ap3',
      'td.oZ-x3',
      'div.T-KT',
      'td.yX',
      'td:first-child'
    ],
    emailViewHeader: [
      'div.ha',
      'div.gE',
      'div.iH',
      'div[role="main"] .h7'
    ]
  };

  /**
   * Helper: Generate stable hash fingerprint for an email message
   */
  function generateFingerprint(sender, subject, snippet) {
    const raw = `${sender.trim().toLowerCase()}||${subject.trim().toLowerCase()}||${snippet.trim().toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return 'pg_' + Math.abs(hash).toString(36);
  }

  /**
   * Layered Helper: Find Email Rows
   */
  function findEmailRows() {
    for (const sel of SELECTORS.rows) {
      const rows = document.querySelectorAll(sel);
      if (rows && rows.length > 0) {
        return Array.from(rows);
      }
    }
    return [];
  }

  /**
   * Layered Helper: Extract Sender
   */
  function extractSender(row) {
    for (const sel of SELECTORS.sender) {
      const el = row.querySelector(sel);
      if (el) {
        const emailAttr = el.getAttribute('email') || el.getAttribute('data-hovercard-id');
        const text = el.innerText || el.textContent || '';
        if (emailAttr) return `${text.trim()} <${emailAttr}>`;
        if (text.trim()) return text.trim();
      }
    }
    // Fallback: search text in first cell
    const firstTd = row.querySelector('td.yX') || row.querySelector('td');
    return firstTd ? (firstTd.innerText || '').trim() : '';
  }

  /**
   * Layered Helper: Extract Subject
   */
  function extractSubject(row) {
    for (const sel of SELECTORS.subject) {
      const el = row.querySelector(sel);
      if (el && el.innerText && el.innerText.trim()) {
        return el.innerText.trim();
      }
    }
    return '';
  }

  /**
   * Layered Helper: Extract Snippet
   */
  function extractSnippet(row) {
    for (const sel of SELECTORS.snippet) {
      const el = row.querySelector(sel);
      if (el && el.innerText) {
        let text = el.innerText.trim();
        // Remove leading dash/hyphen if present
        if (text.startsWith('-') || text.startsWith('–') || text.startsWith('—')) {
          text = text.substring(1).trim();
        }
        if (text) return text;
      }
    }
    return '';
  }

  /**
   * Layered Helper: Find Badge Insertion Point
   */
  function findBadgeInsertionPoint(row) {
    // Prefer star cell or checkbox cell specifically
    const starCell = row.querySelector('td.ap3') || row.querySelector('div.T-KT');
    if (starCell) return starCell;

    const checkboxCell = row.querySelector('td.oZ-x3');
    if (checkboxCell) return checkboxCell;

    for (const sel of SELECTORS.starArea) {
      const el = row.querySelector(sel);
      if (el) return el;
    }
    return row.children[0] || row;
  }

  /**
   * Render Badge UI into Gmail Row
   */
  function renderBadge(row, state, data = null) {
    try {
      const insertionPoint = findBadgeInsertionPoint(row);
      if (!insertionPoint) return;

      let badgeContainer = row.querySelector('.phishguard-badge-wrapper');
      if (!badgeContainer) {
        badgeContainer = document.createElement('span');
        badgeContainer.className = 'phishguard-badge-wrapper';
        insertionPoint.appendChild(badgeContainer);
      }

      badgeContainer.innerHTML = ''; // Clear existing content

      const badge = document.createElement('span');
      badge.className = 'phishguard-badge';

      let icon = '⚪';
      let statusClass = 'phishguard-scanning';
      let tooltipText = 'PhishGuard AI analyzing message...';

      if (state === 'SCANNING') {
        icon = '⚪';
        statusClass = 'phishguard-scanning';
        tooltipText = 'PhishGuard AI analyzing message...';
      } else if (state === 'OFFLINE') {
        icon = '⚪';
        statusClass = 'phishguard-offline';
        tooltipText = 'PhishGuard AI backend offline (http://localhost:8000)';
      } else if (data) {
        const score = data.risk_score !== undefined ? data.risk_score : '';

        if (data.status === 'SAFE' || data.risk_level === 'LOW') {
          icon = '🟢';
          statusClass = 'phishguard-safe';
        } else if (data.status === 'SUSPICIOUS' || data.risk_level === 'MEDIUM') {
          icon = '🟡';
          statusClass = 'phishguard-suspicious';
        } else {
          icon = '🔴';
          statusClass = 'phishguard-phishing';
        }
        tooltipText = `PhishGuard AI Risk Score: ${score}/100\nStatus: ${data.status || data.risk_level}\nReason: ${data.primary_reason || 'N/A'}`;
      }

      badge.classList.add(statusClass);
      badge.innerHTML = `<span class="pg-icon">${icon}</span>`;
      badge.setAttribute('title', tooltipText);

      badgeContainer.appendChild(badge);
      row.setAttribute('data-phishguard-status', data ? data.status : state);
    } catch (e) {
      console.warn('[PhishGuard AI] Error rendering badge:', e);
    }
  }

  /**
   * Process single row queue item
   */
  async function processQueueItem(task) {
    const { row, sender, subject, snippet, fingerprint } = task;

    // Check memory cache
    const cached = memoryCache.get(fingerprint);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      renderBadge(row, 'DONE', cached.data);
      return;
    }

    // Check chrome.storage.local cache
    try {
      const storageKey = `pg_c_${fingerprint}`;
      const res = await new Promise((resolve) => chrome.storage.local.get(storageKey, resolve));
      if (res && res[storageKey] && (Date.now() - res[storageKey].timestamp < CACHE_TTL_MS)) {
        const cachedData = res[storageKey].data;
        memoryCache.set(fingerprint, { data: cachedData, timestamp: res[storageKey].timestamp });
        renderBadge(row, 'DONE', cachedData);
        return;
      }
    } catch (e) {
      // storage lookup fallback
    }

    // Render SCANNING badge before request
    renderBadge(row, 'SCANNING');

    activeRequestCount++;
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'PHISHGUARD_QUICK_ANALYZE',
            payload: { sender, subject, snippet }
          },
          resolve
        );
      });

      if (!response || response.status === 'OFFLINE') {
        renderBadge(row, 'OFFLINE');
      } else {
        // Cache result
        memoryCache.set(fingerprint, { data: response, timestamp: Date.now() });
        const storageKey = `pg_c_${fingerprint}`;
        chrome.storage.local.set({ [storageKey]: { data: response, timestamp: Date.now() } });

        renderBadge(row, 'DONE', response);
      }
    } catch (err) {
      console.warn('[PhishGuard AI] Request error:', err);
      renderBadge(row, 'OFFLINE');
    } finally {
      activeRequestCount--;
      processNextInQueue();
    }
  }

  function processNextInQueue() {
    while (activeRequestCount < MAX_CONCURRENT_REQUESTS && pendingQueue.length > 0) {
      const task = pendingQueue.shift();
      processQueueItem(task);
    }
  }

  /**
   * Scan visible inbox rows
   */
  function scanInboxRows() {
    try {
      const rows = findEmailRows();
      if (!rows || rows.length === 0) return;

      for (const row of rows) {
        // If row was marked processed but Gmail DOM update stripped out our badge, restore it!
        if (row.getAttribute('data-phishguard-processed') === 'true') {
          if (!row.querySelector('.phishguard-badge-wrapper')) {
            const fp = row.getAttribute('data-phishguard-fp');
            const cached = fp ? memoryCache.get(fp) : null;
            if (cached) {
              renderBadge(row, 'DONE', cached.data);
            } else {
              row.removeAttribute('data-phishguard-processed');
            }
          } else {
            continue; // Skip if badge is still intact
          }
        }

        const sender = extractSender(row);
        const subject = extractSubject(row);
        const snippet = extractSnippet(row);

        // Require at least sender or subject to proceed
        if (!sender && !subject) continue;

        const fingerprint = generateFingerprint(sender, subject, snippet);
        row.setAttribute('data-phishguard-processed', 'true');
        row.setAttribute('data-phishguard-fp', fingerprint);
        processedRows.add(fingerprint);

        pendingQueue.push({ row, sender, subject, snippet, fingerprint });
      }

      processNextInQueue();
    } catch (e) {
      console.warn('[PhishGuard AI] Error scanning rows:', e);
    }
  }


  /**
   * Debounced scanning wrapper
   */
  function scheduleScan() {
    if (scanDebounceTimer) clearTimeout(scanDebounceTimer);
    scanDebounceTimer = setTimeout(() => {
      scanInboxRows();
      checkOpenedEmailView();
    }, 350);
  }

  /**
   * Full Email View Upgrade Integration
   */
  function checkOpenedEmailView() {
    try {
      // Find open message containers
      const headerContainers = document.querySelectorAll(SELECTORS.emailViewHeader.join(', '));
      if (!headerContainers || headerContainers.length === 0) return;

      for (const container of headerContainers) {
        if (container.getAttribute('data-phishguard-banner-injected') === 'true') continue;

        // Extract opened email details
        const subjectEl = document.querySelector('h2.hP') || document.querySelector('.ha h2');
        const subjectText = subjectEl ? subjectEl.innerText : 'Opened Message';

        const senderEl = container.querySelector('.gD') || container.querySelector('span[email]');
        const senderText = senderEl ? (senderEl.getAttribute('email') || senderEl.innerText) : '';

        const bodyEl = document.querySelector('.a3s.aiL') || document.querySelector('.a3s');
        const bodyText = bodyEl ? bodyEl.innerText.substring(0, 1000) : '';

        container.setAttribute('data-phishguard-banner-injected', 'true');

        // Create PhishGuard Threat Panel Banner
        const banner = document.createElement('div');
        banner.className = 'phishguard-email-banner';
        banner.innerHTML = `
          <div class="pg-banner-header">
            <div class="pg-banner-title">
              <span class="pg-shield-icon">🛡️</span>
              <strong>PhishGuard AI Threat Indicator</strong>
            </div>
            <div class="pg-banner-status pg-banner-loading" id="pg-banner-status-badge">
              ⚪ ANALYZING EMAIL...
            </div>
          </div>
          <div class="pg-banner-body" id="pg-banner-body-content">
            Checking full threat score for message...
          </div>
          <div class="pg-banner-actions">
            <button class="pg-btn-full-analysis" id="pg-btn-open-dashboard">
              📊 View Full Analysis in PhishGuard
            </button>
          </div>
        `;

        container.parentNode.insertBefore(banner, container.nextSibling);

        // Bind button
        const openBtn = banner.querySelector('#pg-btn-open-dashboard');
        if (openBtn) {
          openBtn.addEventListener('click', () => {
            window.open('http://localhost:3000/analyze', '_blank');
          });
        }

        // Trigger analysis request
        chrome.runtime.sendMessage(
          {
            type: 'PHISHGUARD_FULL_ANALYZE',
            payload: {
              sender: senderText,
              receiver: '',
              subject: subjectText,
              body: bodyText
            }
          },
          (res) => {
            const statusBadge = banner.querySelector('#pg-banner-status-badge');
            const bodyContent = banner.querySelector('#pg-banner-body-content');

            if (res && res.success && res.data) {
              const d = res.data;
              let badgeColor = '#10b981';
              let badgeBg = 'rgba(16, 185, 129, 0.15)';
              if (d.risk_level === 'HIGH' || d.risk_level === 'CRITICAL') {
                badgeColor = '#ef4444';
                badgeBg = 'rgba(239, 68, 68, 0.15)';
              } else if (d.risk_level === 'MEDIUM') {
                badgeColor = '#f59e0b';
                badgeBg = 'rgba(245, 158, 11, 0.15)';
              }

              if (statusBadge) {
                statusBadge.style.color = badgeColor;
                statusBadge.style.backgroundColor = badgeBg;
                statusBadge.style.border = `1px solid ${badgeColor}`;
                statusBadge.innerText = `SCORE: ${d.risk_score}/100 [ ${d.risk_level} ]`;
              }

              if (bodyContent) {
                const reasons = d.indicators && d.indicators.length > 0
                  ? d.indicators.map(i => `• ${i.description}`).join('<br/>')
                  : `• ${d.summary}`;
                bodyContent.innerHTML = `
                  <strong>Assessment Summary:</strong> ${d.summary}<br/>
                  <div style="margin-top:6px; font-size:12px; opacity:0.9;">${reasons}</div>
                `;
              }
            } else {
              if (statusBadge) {
                statusBadge.innerText = '⚪ OFFLINE / UNABLE TO REACH BACKEND';
              }
              if (bodyContent) {
                bodyContent.innerText = 'Ensure PhishGuard backend service is running on http://localhost:8000.';
              }
            }
          }
        );
      }
    } catch (e) {
      console.warn('[PhishGuard AI] Error injecting email view banner:', e);
    }
  }

  /**
   * Set up MutationObserver to detect dynamic Gmail inbox updates
   */
  function setupMutationObserver() {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) {
        scheduleScan();
      }
    });

    observer.observe(targetNode, config);
    console.log('[PhishGuard AI] MutationObserver active for Gmail dynamic SPA update detection.');
  }

  // Initial execution when content script loads
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scheduleScan();
    setupMutationObserver();
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      scheduleScan();
      setupMutationObserver();
    });
  }

})();
