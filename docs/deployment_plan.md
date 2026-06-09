# Production Deployment Plan (Phases 6, 7 & 8)

This document outlines the operational plan to deploy the **Unified Integration Shell** (featuring **Resume Shapeshifter**, **Job Agent**, and **The Closer** native workspace) to production.

---

## 1. Pre-Deployment Configuration (Target Sites)

Before deploying the unified shell, target applications must be updated to allow iframe framing from the production shell domain (e.g., `https://unified-shell.com`).

### 1.1 Content Security Policy (CSP) Updates
Coordinate with the administrators of the target apps (e.g. Resume Shapeshifter) to add `frame-ancestors` rules:
- **Nginx configuration (target app server)**:
  ```nginx
  add_header Content-Security-Policy "frame-ancestors 'self' https://unified-shell.com;" always;
  ```

### 1.2 Cookie Whitelisting & Secure Handshakes
Ensure that the target applications are configured to receive the `postMessage` secure handshakes dispatched by the shell when synchronized.

---

## 2. Infrastructure Setup & Containerization

Because **Job Agent** is a Python-based CLI tool, the production container running the Next.js shell must be equipped with Python 3 and its pip dependencies.

### 2.1 Multi-Stage Dockerfile (Next.js Shell + Python 3)
Replace `shell/Dockerfile` with the following configuration to compile next assets, install Alpine Python dependencies (needed for compilation of `lxml`), and copy the job agent repository.

```dockerfile
# Stage 1: Build Node assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install Python 3 and package build requirements
RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    python3-dev \
    libxml2-dev \
    libxslt-dev

# Copy and install Python dependencies
COPY ../JOB-AGENT/requirements.txt /JOB-AGENT/requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r /JOB-AGENT/requirements.txt

# Copy Next.js compilation outputs
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/proxy.js ./src/proxy.js

# Copy JOB-AGENT code
COPY ../JOB-AGENT /JOB-AGENT

EXPOSE 3000
CMD ["npm", "run", "start"]
```

### 2.2 Docker Compose Configuration
Configure the production services in `docker-compose.prod.yml`. Ensure the Docker context is set to the root workspace directory so that the relative pathing (`../JOB-AGENT`) copies correctly.

---

## 3. Environment Variables & Secrets

Configure the following environment variables on your production hosting provider (e.g. Render, AWS, or VPS):

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SHAPESHIFTER_URL` | Yes | Production URL for the Resume Shapeshifter web app. |
| `NEXT_AUTH_SECRET` | Yes | Cryptographic secret for signing HTTP-only auth session cookies. |
| `GEMINI_API_KEY` | Yes | Google Gemini API key used for writing cover letters and email templates natively. |
| `SLACK_WEBHOOK_URL` | No | Slack Incoming Webhook URL used by Job Agent to post run alerts. |
| `FIRECRAWL_API_KEY` | No | Firecrawl API key used as a JS rendering scraper fallback. |

---

## 4. Step-by-Step Deployment Checklist

### Phase 1: SSL & Domain Allocation
1. Purchase/allocate domain (e.g., `unified-shell.com`).
2. Point DNS records (A/AAAA) to the server's public IP address.
3. Configure SSL certificates (e.g. using Let's Encrypt / Certbot on Nginx).

### Phase 2: Building & Pushing Images
Run the build from the project root workspace directory:
```bash
# Compile and build the container from the project root
docker build -t your-registry/unified-shell:latest -f ./shell/Dockerfile .
```

### Phase 3: Launching Services
Run the production services:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 5. Post-Deployment Verification (Smoke Tests)

Execute the following manual smoke tests:

1. **Verify SSL/TLS Configuration**:
   Navigate to `https://unified-shell.com/` and confirm that the certificate is active (HTTPS).
2. **Access Control Check**:
   Confirm that trying to access the root path redirects to `/login`.
3. **Resume Shapeshifter Embedding**:
   Verify the Shapeshifter tab loads the tailored resume editor without styling breaks.
4. **Job Agent Run Test**:
   Go to the "Job Agent" tab and click "Run Scraper Agent". Verify that the terminal logs stream output showing active scrapers.
5. **The Closer AI Generation Test**:
   Go to "The Closer", click "⚡ Load Demo", select "LinkedIn Connection Note" as Outreach Type, click "Generate Outreach", and verify that a custom note is created and copy-to-clipboard works.
6. **Cross-Component Loop**:
   - Go to Job Agent, click **"Tailor ✍️"** next to a job listing. Confirm you are redirected to Closer with job info pre-filled.
   - Click **"Mark Job as Applied"** in Closer, switch back to Job Agent, and verify the job status in the table has changed to `Applied`.

---

## 6. Rollback Strategy

1. **Immediate Fallback**:
   If a deployment fails, revert to the previous container image release tag.
   ```bash
   docker-compose down
   docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
   ```
2. **Verify Restoration**:
   Confirm old workflows (Shapeshifter frame embedding) remain functional.
