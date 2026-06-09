# Architecture Specification: Unified Integration Shell

This document defines the system architecture, component design, and integration strategies for the **Unified Web Interface** combining three distinct web applications into a single, cohesive experience.

---

## 1. System Overview & High-Level Architecture

The solution uses a **Unified Shell Pattern** combined with a **Reverse Proxy Gateway** to integrate the target applications. This approach allows us to display the applications seamlessly, bypass browser security restrictions (CORS, framing protection), synchronize authentication, and manage application state without modifying the core business logic of the target applications.

### Architectural Diagram

```mermaid
graph TD
    User([End User / Browser]) -->|HTTPS| Shell[Unified Integration Shell <br/> Next.js / React]
    
    subgraph Integration Gateway Layer (Reverse Proxy)
        Shell -->|/apps/jd-resume| ProxyJD[Proxy & Header Rewriter]
        Shell -->|/apps/shapeshifter| ProxyShape[Proxy & Header Rewriter]
        Shell -->|/apps/closer| ProxyCloser[WebSocket-Enabled Proxy]
    end

    subgraph Target Applications
        ProxyJD -->|GitHub Pages / Render| App1[JD-RESUME App]
        ProxyShape -->|Render.com| App2[Resume Shapeshifter App]
        ProxyCloser -->|Streamlit Cloud| App3[The Closer App <br/>Streamlit]
    end

    subgraph Auth & Shared State
        ShellAuth[Shell Auth Manager <br/> NextAuth.js / JWT] <-->|postMessage / Cookies| App1
        ShellAuth <-->|postMessage / Cookies| App2
        ShellAuth <-->|postMessage / Cookies| App3
    end
```

---

## 2. Integration & Routing Strategy

To achieve a seamless visual experience and prevent browser security blocks, we implement a hybrid integration model using **Iframes** served through a **Reverse Proxy / Gateway**.

### 2.1 The Reverse Proxy Gateway
By serving the unified shell and proxying the target websites under the same origin (e.g., `https://unified-shell.com/apps/...`), we resolve key browser restrictions:
1. **CORS (Cross-Origin Resource Sharing)**: Prevents browser errors when communicating between the shell and the target apps.
2. **Frame Sandboxing (X-Frame-Options / CSP)**: Strips or overrides restrictive headers (like `X-Frame-Options: DENY` or `frame-ancestors 'none'`) in transit, replacing them with policy rules that permit framing *only* from the unified shell domain.
3. **Cookie Partitioning (CHIPS / SameSite)**: Ensures session cookies for the target applications are sent correctly by aligning them under the shell's origin or setting them with `SameSite=None; Secure`.

### 2.2 Routing Mapping
The gateway routes traffic based on pathname prefixes:

| Path Prefix | Destination URL | App Type / Engine | Notes |
| :--- | :--- | :--- | :--- |
| `/` | *Local* | Next.js Shell UI | Shell Home, Dashboard, and Nav Shell |
| `/apps/jd-resume/*` | `https://github.com/raktimneog08-ops/JD-RESUME` (deploy) | Static/SPAs or React | Standard HTTPS Proxying |
| `/apps/shapeshifter/*` | `https://resume-shapeshifter.onrender.com/` | Web App (Node/Python) | Session Cookie Proxying |
| `/apps/closer/*` | `https://the-closer-m59fkvodcfreb8yjtdqkaw.streamlit.app/` | Streamlit (Python) | **Requires WebSocket Upgrade proxying** |

> [!IMPORTANT]
> **Streamlit WebSocket Proxying**: Streamlit relies heavily on WebSockets (`/_stcore/stream` or `/stream`). The reverse proxy (configured via Next.js custom server or Nginx) must explicitly support and upgrade WebSocket connections.
> For example, in Nginx:
> ```nginx
> location /apps/closer/_stcore/stream {
>     proxy_pass https://the-closer-m59fkvodcfreb8yjtdqkaw.streamlit.app/_stcore/stream;
>     proxy_http_version 1.1;
>     proxy_set_header Upgrade $http_upgrade;
>     proxy_set_header Connection "upgrade";
> }
> ```

---

## 3. Frontend Shell & Design System

The frontend shell is a responsive wrapper that surrounds the embedded applications. It ensures a consistent user experience (UX) and visual harmony.

### 3.1 Layout & Navigation
- **Persistent Shell Header**: Contains logo, global search, unified user profile, app switcher tabs, and a real-time status monitor (pinging target app health).
- **Collapsible Sidebar**: Provides quick access to specific pages within each sub-app (mapped via shell routes).
- **Iframe Container**: A container that expands to fill the viewport minus the shell headers.
- **Glassmorphism Theme**: Curated dark/light modes using smooth CSS gradients, Tailwind CSS, or custom HSL variables to match modern aesthetics.

### 3.2 Loading States & Error Fallbacks
When switching between applications or loading them for the first time:
1. **Micro-Animations**: A premium loader/shimmer effect displays while the iframe finishes loading (`iframe.onload`).
2. **Timeout Check**: If the target application does not trigger the load event within **10 seconds**, the shell intercepts and displays a beautiful fallback component.
3. **Graceful Degradation Panel**: If a target app is down, the container displays a troubleshooting panel ("Offline Mode" status, contact info, and retry button) while allowing the user to continue using the other apps.

```
+-------------------------------------------------------------+
|  [Logo]   [JD-Resume]  [Shapeshifter]  [The Closer]  (User) |  <- Shell Header
+-------------------------------------------------------------+
|                                                             |
|  +-------------------------------------------------------+  |
|  |                                                       |  |
|  |                 [ Embedded Iframe ]                   |  |  <- Interactive
|  |                 (Proxied App View)                    |  |     Target App
|  |                                                       |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
```

---

## 4. Single Sign-On (SSO) & Session Sync

To prevent users from logging in multiple times, we implement an authentication synchronization system.

### 4.1 Shell Auth Provider
The unified shell acts as the Primary Identity Provider (IdP) using **NextAuth.js** (supporting OAuth2, SAML, or simple credentials login).

### 4.2 Token Propagation
Once the user is authenticated in the shell:
1. **Cookie Sharing**: If the target apps are configured under the same primary domain (e.g., `jd.domain.com`, `shape.domain.com` with shell at `domain.com`), the session cookie is configured with `Domain=domain.com`.
2. **PostMessage Handshake**: If cross-domain cookies are blocked, the shell uses a secure postMessage bridge to pass the JSON Web Token (JWT) to the embedded application:
   ```javascript
   // Shell parent window
   const iframe = document.getElementById('app-iframe');
   iframe.contentWindow.postMessage({
     type: 'SYNC_AUTH',
     token: userJwtToken
   }, 'https://unified-shell.com');
   ```
3. **App-Side Handshake**: The target apps include a lightweight script that listens for the `SYNC_AUTH` message, validates the sender origin, and stores the JWT in `localStorage` or local session cookies.

---

## 5. Security & Isolation

Since we are combining codebases and domains, maintaining security is paramount.

1. **Strict Iframe Sandboxing**: Embedded iframes are sandbox-restricted to limit risky capabilities.
   `sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"`
2. **Content Security Policy (CSP)**: The shell implements a CSP that restricts `frame-src` strictly to the proxied endpoints.
3. **Origin Validation**: All `postMessage` listeners check and validate `event.origin` against a whitelist of trusted domains.

---

## 6. GitHub Integration & CI/CD Pipeline

The project codebase is structured to maintain visibility and traceability over all three target repos.

### 6.1 Git Repository Structure
We will manage the codebase as a single orchestrator repository referencing the others:
- **`combine-project` (Mono-Repo/Orchestrator)**:
  - `/docs`: Architecture, APIs, problem statements.
  - `/shell`: Next.js application, proxy rules, common components.
  - `/services`: Proxy and gateway configs (e.g., Nginx, Dockerfiles).
  - `.gitmodules` (Optional): Submodule tracking for `/apps/jd-resume`, `/apps/shapeshifter`, and `/apps/closer` for local development.

### 6.2 Deployment Pipeline
Using **GitHub Actions**, the unified UI is built and deployed automatically:
1. **Linter & Type Checks**: Code standards verification.
2. **Automated Testing**:
   - **Playwright/Cypress E2E Testing**: Spins up the environment, mocks responses, verifies that the shell navigation works, and checks if iframe components render without console errors.
3. **Docker Build**: Packages the Next.js shell and reverse proxy setup.
4. **Deploy Target**: Pushes the compiled image to host registries (Docker Hub, AWS ECR, or Render Registry) and triggers a rolling update on the production environment.
