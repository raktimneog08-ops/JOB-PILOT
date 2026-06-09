# Implementation Plan: Unified Integration Shell

This document outlines the phase-wise execution strategy to implement the unified integration shell for the three distinct web applications as specified in the [Architecture Document](file:///d:/COMBINE-PROJECT/docs/architecture.md).

---

## Phase 1: Environment & Orchestrator Setup
*Goal: Initialize the monorepo structure, local configuration, and establish repository linking.*

### Tasks:
1. **Initialize Project Repository Structure**:
   - Establish the main workspace directory.
   - Create directories for `/shell` (Next.js application), `/gateway` (Nginx/Proxy configurations), and `/docs` (documentation).
2. **Git Submodule / Dependency Setup**:
   - Link the source repositories (`JD-RESUME`, `Resume Shapeshifter`, and `The Closer`) as git submodules or document clone commands for local execution.
3. **Configure Environment Variables**:
   - Create `.env.example` templates specifying production/local target URLs for the three target sites:
     - `JD_RESUME_URL`
     - `SHAPESHIFTER_URL`
     - `THE_CLOSER_URL`
4. **Local Running Script**:
   - Create a helper CLI command or shell script (`npm run start:all` or docker-compose) to boot all three local mock target applications and the gateway for development.

---

## Phase 2: Reverse Proxy & Gateway Configuration
*Goal: Configure routing rules to route all subpaths under a single domain, bypass CORS, and support WebSockets.*

### Tasks:
1. **Configure local Nginx / Gateway container**:
   - Write a `nginx.conf` matching the architecture specs.
   - Set up routing rules for `/apps/jd-resume`, `/apps/shapeshifter`, and `/apps/closer`.
2. **Configure WebSocket Upgrade Routing**:
   - Implement custom upgrade headers for the `/apps/closer` path to ensure Streamlit's WebSocket connection (`/_stcore/stream`) routes correctly without disconnecting.
3. **Rewrite Framing Headers**:
   - Configure proxy rules to intercept response headers from target sites:
     - Strip `X-Frame-Options` and `Content-Security-Policy` headers that block framing.
     - Inject a modern `Content-Security-Policy: frame-ancestors 'self' https://unified-shell.com` rule.
4. **Verify Gateway Routing**:
   - Confirm target applications can be viewed directly under gateway routes (e.g. `http://localhost:8080/apps/closer`) with no browser errors.

---

## Phase 3: Frontend Shell & UI Framework
*Goal: Build the wrapper layout, navigation bars, responsive frame sizing, and custom loading/fallback states.*

### Tasks:
1. **Initialize Frontend Project**:
   - Scaffold a Next.js (React) application inside the `/shell` directory.
   - Set up global styles and themes (dark/light, glassmorphic styles) using Vanilla CSS.
2. **Design Persistent Shell Layout**:
   - Create `Header` and `Sidebar` components.
   - Implement the `AppSwitcher` tabs (switching target paths).
3. **Create the Iframe Container**:
   - Build a container component that dynamically updates the `iframe` target `src` when switching apps.
   - Implement standard sandboxing properties on the iframe.
4. **Implement Loading States & Fallbacks**:
   - Add a premium CSS loader overlay during the iframe's `onload` event.
   - Set up a **10-second timeout listener**; if the page fails to fire `onload` or returns a gateway error, display a graceful degradation panel (troubleshooting instructions and reload button).

---

## Phase 4: Single Sign-On (SSO) & Session Synchronization
*Goal: Set up unified authentication on the shell and securely pass tokens/sessions to the target sites.*

### Tasks:
1. **Integrate NextAuth.js**:
   - Configure login flows (OAuth2 or simple credentials login) in the Next.js Shell.
2. **Implement postMessage Handshake Bridge**:
   - Write a helper library `auth-sync-bridge.js` to run in the shell. When the iframe loads, send a secure JSON token payload to the target site.
3. **Integrate Handshake Client in Target Apps**:
   - Embed a listener script on the target websites that catches the token, verifies the source origin matches the shell, and populates `localStorage` or browser cookies.
4. **Session Timeout Sync**:
   - Ensure logging out of the shell triggers a broadcast to all target iframes to destroy local session states.

---

## Phase 5: CI/CD Pipeline & Automated Testing
*Goal: Automate build verification, containerize the setup, and write E2E tests to guarantee zero critical errors.*

### Tasks:
1. **Containerize Integration Layer**:
   - Create a multi-stage `Dockerfile` to build the Next.js shell and run Nginx.
   - Set up `docker-compose.yml` for unified deployment.
2. **Write Playwright / Cypress Integration Tests**:
   - Write tests checking that:
     - The shell renders without JavaScript console exceptions.
     - Tab switching loads the correct iframe source.
     - Fallback UI shows up when target apps are shut down.
3. **GitHub Actions Workflow**:
   - Configure a workflow `.github/workflows/deploy.yml` that runs linting, executes Playwright tests, builds the Docker image, and triggers production redeploys.

---

## Phase 6: Production Launch & Verification
*Goal: Go live, adjust production environment configs, and verify functionality.*

### Tasks:
1. **Add Production DNS Rules**:
   - Point the domain name to the integration gateway.
2. **Update Target Site CORS & Security Settings**:
   - Coordinate with target application maintainers to whitelist the integration domain for frame access (e.g. update their CORS origins and CSP settings).
3. **Smoke Tests**:
   - Execute a post-deployment verification script against the production URL to verify all pathways, WebSockets, and authentication loops.

---

## Phase 7: Native Job Agent Dashboard Integration
*Goal: Integrate the Python-based JOB-AGENT as a native dashboard inside the Next.js shell.*

### Tasks:
1. **Create Next.js API endpoints for Job Agent**:
   - `/api/job-agent/listings` (GET) to parse CSV listings.
   - `/api/job-agent/update-status` (POST) to change job application statuses.
   - `/api/job-agent/config` (GET/POST) to read/write search settings.
   - `/api/job-agent/run` (POST) to spawn `python main.py` and stream the execution logs.
2. **Add Header Tab Navigation**:
   - Add a "Job Agent" navigation button in `Header.js` and bypass client-side health checks.
3. **Develop the JobAgentDashboard Component**:
   - Build a dashboard layout featuring stats, real-time log terminal, a searchable jobs table, status dropdowns, and settings configuration editor.
4. **Implement E2E Playwright Tests**:
   - Add tests to `tests/shell.spec.js` asserting that the Job Agent dashboard renders properly and interfaces with the mock APIs.

---

## Phase 8: Redefining & Reworking 'The Closer'
*Goal: Rebuild 'The Closer' as a native AI cover letter and outreach email composer integrated with Resume Shapeshifter and Job Agent.*

### Tasks:
1. **Develop AI Generation Endpoint**:
   - Implement `/api/closer/generate` using Gemini API SDK or structural templates for cover letters, LinkedIn outreach, and follow-ups.
2. **Create CloserDashboard Component**:
   - Build a native side-by-side composer workspace with fields for JD details, resume text, outreach type, and tone selectors.
3. **Establish Data Integration**:
   - Add a shortcut in Job Agent listings table ("Open in Closer") to auto-populate the JD, company, and title.
   - Enable "Mark as Applied" in Closer to automatically update the status back in the Job Agent CSV.
4. **Extend E2E Test Suite**:
   - Add Playwright E2E cases verifying form inputs, mock generation triggers, and state persistence.


