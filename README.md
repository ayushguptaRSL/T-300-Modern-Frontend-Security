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

### 1. DOM-Based Cross-Site Scripting (DOM XSS)
- **Location:** `client/app.js`
- **Vulnerability:** Untrusted URL query parameter (`?name=...`) was directly interpolated into `app.innerHTML`, enabling arbitrary client-side script execution.
- **Source & Sink:** Source: `window.location.search` | Sink: `Element.innerHTML`
- **Fix:** Replaced `innerHTML` with safe programmatic DOM creation using `document.createElement()` and `Node.textContent`.
- **Verification:**
  - Normal input (`?name=Alice`): Renders "Welcome, Alice" as expected.
  - XSS payload (`?name=<img src=x onerror=alert(1)>`): Rendered safely as literal text; no DOM elements injected or scripts executed.
