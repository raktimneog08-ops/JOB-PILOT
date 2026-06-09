# Edge Case Management & Troubleshooting Guide

This document identifies potential edge cases, security restrictions, and failure modes when integrating multiple web applications via the Unified Shell, along with their respective mitigation strategies.

---

## 1. Gateway & Connectivity Failure Modes

### 1.1 Target Site Downtime (502 / 504 Gateway Errors)
* **Scenario**: One of the target applications (e.g., `The Closer` Streamlit app) goes offline or experiences a deployment failure.
* **Impact**: The iframe displays a generic browser error page (e.g., "This site can’t be reached"), breaking the unified UX.
* **Mitigation**:
  - **Gateway Interception**: Configure the reverse proxy gateway to intercept 502, 503, and 504 errors and return a customized JSON/HTML status code.
  - **Active Health Monitoring**: The Next.js Shell runs a background cron task that pings a lightweight `/health` check on each target site. If a service is down, the shell replaces the iframe with a beautiful "Service Under Maintenance" page and disables the corresponding switcher tab.

### 1.2 Unstable WebSocket Connections (Streamlit Apps)
* **Scenario**: Streamlit uses persistent WebSockets. If a network blip occurs, the WebSocket disconnects, prompting a native Streamlit warning banner.
* **Impact**: Disrupted user interactions and potential loss of unsaved input data.
* **Mitigation**:
  - **Proxy Configuration**: Set long timeout thresholds for WebSocket proxying in the gateway (e.g., `proxy_read_timeout 86400s;` and `proxy_send_timeout 86400s;` in Nginx).
  - **Heartbeats**: Implement keep-alive ping messages every 30 seconds from the client to prevent proxy servers from closing idle connections.

---

## 2. Browser Security & Privacy Edge Cases

### 2.1 Third-Party Cookie Blocking
* **Scenario**: Modern browsers (Safari, Brave, Chrome Privacy Sandbox) restrict third-party cookies by default.
* **Impact**: If target apps are embedded via external URLs directly, users cannot log in or preserve sessions inside the iframe.
* **Mitigation**:
  - **Same-Origin Proxying**: By routing all sub-apps through the unified domain (e.g., `unified-shell.com/apps/closer`), all cookies are treated as **first-party** to that domain, completely bypassing third-party cookie blocks.

### 2.2 Iframe Frame-Busting Scripts
* **Scenario**: A target app contains logic to prevent clickjacking/framing (e.g., checking `if (window.top !== window.self) { window.top.location = window.self.location; }`).
* **Impact**: Accessing the route redirects the entire browser tab to the standalone app URL, breaking the shell wrapper.
* **Mitigation**:
  - **Sandbox Restriction**: Configure the iframe sandbox *without* the `allow-top-navigation` permission:
    ```html
    <iframe src="/apps/jd-resume" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    ```
    This blocks the iframe from redirecting the parent window, keeping the shell intact.

---

## 3. Session & Authentication Synchronization

### 3.1 Split Session State (Logouts)
* **Scenario**: A user logs out from the primary shell UI, but their session token remains cached in the target application's local/cookie storage.
* **Impact**: Subsequent users on the same machine might access sensitive data from the previous session if they switch tabs.
* **Mitigation**:
  - **Broadcast Logout**: When the logout function is invoked on the shell, it sends a postMessage broadcast to all active target app iframes:
    ```javascript
    iframe.contentWindow.postMessage({ type: 'FORCE_LOGOUT' }, '*');
    ```
  - **Target Listener**: The client script in each target app listens for `FORCE_LOGOUT`, destroys local tokens, and redirects its internal view to the login screen.

### 3.2 Token Expiry Desynchronization
* **Scenario**: The shell session is refreshed/extended, but the token stored in the target iframe's context expires.
* **Impact**: The embedded application suddenly throws auth errors (e.g., 401 Unauthorized) while the shell looks fully authenticated.
* **Mitigation**:
  - **Periodic Token Refresh**: The shell periodically sends a refreshed JWT payload to the iframes every 15 minutes via postMessage.

---

## 4. UI & Layout Responsiveness

### 4.1 Nested Scrollbars (Double Scrolling)
* **Scenario**: The outer shell has a vertical scrollbar, and the inner iframe app also has a vertical scrollbar.
* **Impact**: Hard-to-use, clunky interface with double scrolling regions.
* **Mitigation**:
  - **Viewport Constraint**: Set the iframe's CSS height to exactly `calc(100vh - header_height)` and apply `overflow: hidden` to the shell container. 
  - Let the inner iframe handle all vertical scrolling natively.

### 4.2 Modal Dialog Clipping
* **Scenario**: An embedded application triggers a modal dialogue or dropdown that exceeds the iframe width/height.
* **Impact**: The dropdown or modal gets clipped by the iframe boundaries, making it unusable.
* **Mitigation**:
  - **Responsive Padding**: Ensure target apps are styled with responsive container layouts and avoid fixed pixel offsets that extend past standard viewports.
  - **Shell Portal Bridge**: For critical dialogues, communicate the dialog contents via postMessage to render the modal inside the parent shell container.
