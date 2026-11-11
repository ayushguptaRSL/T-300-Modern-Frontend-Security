# Modern Front-End Security – Vulnerable Starter Project

## Overview
A User Security Dashboard created for Modern Front-End Security Concepts training.

## Quick Start
```bash
npm install
npm start
```

---

## Security Audit & Fix Summary

### 1. DOM-Based Cross-Site Scripting (DOM XSS) - [RESOLVED]
- **Location:** `client/app.js`
- **Vulnerability:** Untrusted URL query parameter (`?name=...`) was directly interpolated into `app.innerHTML`, enabling arbitrary client-side script execution.
- **Source & Sink:** Source: `window.location.search` | Sink: `Element.innerHTML`
- **Fix:** Replaced `innerHTML` with safe programmatic DOM creation using `document.createElement()` and `Node.textContent`.
- **Verification:**
  - Normal input (`?name=Alice`): Renders "Welcome, Alice" as expected.
  - XSS payload (`?name=<img src=x onerror=alert(1)>`): Rendered safely as literal text; no DOM elements injected or scripts executed.

### 2. Prototype Pollution - [RESOLVED]
- **Location:** `server/server.js` (`/api/settings` POST route) & `client/app.js` (`prepareSettings`)
- **Vulnerability:** Unvalidated property copying (`for..in`) copied arbitrary incoming keys into target objects without checking against dangerous property names (`__proto__`, `constructor`, `prototype`) or allowlisting expected fields.
- **Source & Boundary:** Source: `req.body` (JSON payload from client) crossing into application object state.
- **Fix:**
  - Enforced a strict property allowlist (`ALLOWED_KEYS = ["theme", "language", "fontSize"]`).
  - Explicitly blocked `__proto__`, `constructor`, and `prototype` keys.
  - Used `Object.prototype.hasOwnProperty.call()` to prevent prototype traversal, backed by safe object dictionaries (`Object.create(null)`).
- **Verification:**
  - Standard update (`{"theme": "dark", "language": "fr"}`): Settings saved successfully.
  - Pollution payload (`{"__proto__": {"isAdmin": true}, "role": "admin"}`): Dangerous and unexpected keys are discarded; `Object.prototype.isAdmin` remains `undefined`.

### 3. Content Security Policy (CSP) - [RESOLVED]
- **Location:** `server/server.js` (Express middleware & page routes)
- **Vulnerability:** Absence of `Content-Security-Policy` header left the browser without defense-in-depth, permitting execution of injected scripts, unauthorized external origins, and plugin objects.
- **Source & Boundary:** Browser security boundary; lack of HTTP response enforcement to restrict script/style execution context.
- **Fix:**
  - Added nonce-based CSP middleware generating per-request cryptographic nonces (`crypto.randomBytes(16)`).
  - Enforced directives: `default-src 'self'`, `script-src 'self' 'nonce-...'`, `style-src 'self' 'nonce-...'`, `img-src 'self' data:`, `object-src 'none'`, `base-uri 'self'`.
  - Added valid `nonce` attributes to authorized inline `<script>` and `<style>` elements on `/` and `/account`.
- **Verification:**
  - Validated that `Content-Security-Policy` header is present on all HTTP responses.
  - Legitimate application scripts (`/app.js`, inline hydration) and styles execute correctly.
  - Injected inline scripts or external scripts without the valid nonce are blocked by the browser.

### 4. Clickjacking - [RESOLVED]
- **Location:** `server/server.js` (Express middleware) & `/account` route
- **Vulnerability:** Missing anti-framing headers allowed sensitive application views (such as `/account` with the "Delete Account" action) to be embedded inside third-party `<iframe>` elements (e.g. `test/iframe-test.html`), exposing users to UI redress attacks.
- **Source & Boundary:** UI framing boundary; absence of browser-level framing policy.
- **Fix:**
  - Added `frame-ancestors 'none'` directive to `Content-Security-Policy`.
  - Added `X-Frame-Options: DENY` header for legacy browser compatibility.
- **Verification:**
  - Tested with `test/iframe-test.html` attempting to embed `http://localhost:3000/account`.
  - Browser successfully blocks framing with a framing policy error, preventing clickjacking.

### 5. SSR Token Leakage - [RESOLVED]
- **Location:** `server/server.js` (`GET /` hydration & `GET /api/profile`)
- **Vulnerability:** The server serialized the entire raw `user` object directly into HTML (`window.initialUser = ...`) and API responses, leaking confidential secrets (`sessionToken`, `refreshToken`) to client scripts and page source.
- **Source & Boundary:** Server-to-client trust boundary; passing server-only authentication secrets into public client context.
- **Fix:**
  - Implemented Data Minimization (DTO pattern) via `getPublicUser()` helper, stripping `sessionToken` and `refreshToken`.
  - Exposed only public display fields (`id`, `name`, `email`, `role`).
  - Added HTML entity escaping (`.replace(/</g, '\\u003c')`) on serialized SSR state to prevent script breakout.
- **Verification:**
  - Visited `http://localhost:3000/`: Dashboard renders user name, email, and role properly.
  - Inspected page source and `window.initialUser`: `sessionToken` and `refreshToken` are completely removed.
  - Queried `/api/profile`: returns only safe user display fields without auth tokens.
