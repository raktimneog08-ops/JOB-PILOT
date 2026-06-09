# Render.com Deployment Guide

This guide describes how to deploy the **Unified Integration Shell** and its gateway proxy to **Render.com** using **Render Blueprints**.

---

## 1. How Render Handles the Architecture

Unlike raw VPS servers, **Render automatically manages SSL (Let's Encrypt) certificates and handles SSL termination** at their load balancer level. This means:
1. **Nginx** inside our gateway container only needs to listen on port 80. Render's load balancer terminates incoming HTTPS (port 443) and forwards it to the container as HTTP.
2. We do **not** need to set up Certbot or manage Let's Encrypt certificate renewal loops ourselves.
3. The **Next.js Shell** is run as a **Private Service (`pserv`)**, meaning it is invisible to the public internet and accessible only to Nginx internally. This prevents access to `/` without passing through the gateway.

---

## 2. Deploying via Blueprints (Recommended)

Render Blueprints let you deploy all components (Shell + Gateway) in a single step using the configured [render.yaml](file:///d:/COMBINE-PROJECT/render.yaml) file.

### Step 1: Create a GitHub Repository
1. Initialize git in your project root and push the entire workspace code to a new **GitHub repository** (e.g. `your-github/combine-project`).

### Step 2: Set Up Blueprint on Render
1. Log in to your account at [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub account and choose the `combine-project` repository.
4. Render will read the `render.yaml` configuration file automatically.

### Step 3: Configure Environment Variables
Before launching, you will be prompted to verify parameters:
- `NEXTAUTH_SECRET`: Render will automatically generate a secure 256-bit string.
- `NEXTAUTH_URL`: Enter your public gateway URL once it is created (e.g. `https://gateway-xxx.onrender.com`).
- `GEMINI_API_KEY`: Enter your Google Gemini API key to enable AI outreach writing in The Closer.
- Adjust target site URLs if they ever change (`JD_RESUME_URL`, `SHAPESHIFTER_URL`).

### Step 4: Click Deploy
1. Click **Apply** to spin up the blueprint.
2. Render will build:
   - The private **shell** service.
   - The public **gateway** service.
3. Once completed, your public URL will be active.

---

## 3. Post-Deployment whitelisting

Once your gateway is active (e.g., `https://gateway-xxx.onrender.com`), make sure to whitelists this domain in the target apps:
1. Add `frame-ancestors https://gateway-xxx.onrender.com;` to the CSP header on **JD-Resume** and **Resume Shapeshifter** servers.
2. In the Next.js shell environment variables, make sure the `NEXTAUTH_URL` points to this public gateway address.
