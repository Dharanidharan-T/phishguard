# PhishGuard AI – Gmail Real-Time Threat Indicator (Chrome Extension)

Real-time explainable AI phishing attack detection directly inside Gmail inbox.

## Features

- 🟢 **SAFE**, 🟡 **SUSPICIOUS**, 🔴 **PHISHING** dynamic risk badges injected near the Gmail star icon for visible inbox rows.
- ⚡ **Lightweight Quick Analysis**: Calls `POST /api/quick-analyze` using sender, subject, and visible snippet text.
- 🛡️ **Full Email View Banner**: Injects an in-depth PhishGuard AI threat summary panel when viewing opened messages with a single click to open full dashboard analysis.
- 🚀 **Performance Optimized**: Debounced `MutationObserver` SPA dynamic update detection, 30-minute local result caching (`chrome.storage.local`), and queue-based rate limiting (max 4 concurrent requests).
- 🔒 **Privacy-First Cybersecurity**: Never clicks links, never collects passwords, and only communicates with local PhishGuard backend (`http://localhost:8000`).

## Chrome Extension Setup

1. Start your PhishGuard FastAPI backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
2. Open Google Chrome and navigate to: `chrome://extensions/`
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left corner.
5. Select the `phishguard-extension` directory from this project.
6. Open Gmail (`https://mail.google.com`) and observe real-time threat badges appear automatically next to your inbox rows!

## Architecture

- **`manifest.json`**: Manifest V3 compliant specification with minimum required permissions (`storage`, `https://mail.google.com/*`, `http://localhost:8000/*`).
- **`content.js`**: Layered Gmail DOM selectors, `MutationObserver` watcher, badge rendering engine, and full email header banner integration.
- **`background.js`**: Background service worker handling background API calls, timeout control, network error fallbacks (`⚪ OFFLINE`), and session statistics.
- **`popup.html` & `popup.js`**: Extension toolbar popup showing live connection status, session threat stats, and quick shortcut to the React dashboard.
- **`styles.css`**: Non-intrusive badge layout & glassmorphic SOC threat header panel styles.
