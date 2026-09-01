/**
 * PhishGuard AI Extension Popup Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('backend-status');
  const statTotal = document.getElementById('stat-total');
  const statSafe = document.getElementById('stat-safe');
  const statSuspicious = document.getElementById('stat-suspicious');
  const statPhishing = document.getElementById('stat-phishing');
  const btnDash = document.getElementById('btn-open-dash');

  // Check backend connection health
  chrome.runtime.sendMessage({ type: 'CHECK_BACKEND_HEALTH' }, (res) => {
    if (res && res.online) {
      statusEl.textContent = 'CONNECTED 🟢';
      statusEl.className = 'status-pill status-online';
    } else {
      statusEl.textContent = 'OFFLINE 🔴';
      statusEl.className = 'status-pill status-offline';
    }
  });

  // Fetch current session statistics
  chrome.runtime.sendMessage({ type: 'GET_SESSION_STATS' }, (stats) => {
    if (stats) {
      statTotal.textContent = stats.total || 0;
      statSafe.textContent = stats.safe || 0;
      statSuspicious.textContent = stats.suspicious || 0;
      statPhishing.textContent = stats.phishing || 0;
    }
  });

  // Open PhishGuard Dashboard
  btnDash.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
});
