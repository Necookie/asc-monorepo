# ASC — Security Specification & Threat Model

## 1. Threat Model & Security Posture

ASC is a community-first public identity platform. The key attack vectors include:
1. **Identity Spoofing & Account Takeover**: An attacker attempting to claim or modify a community member's profile using username similarity or client-side tampering.
2. **Cross-Site Scripting (XSS)**: Malicious payloads injected via user bios, titles, or link labels.
3. **Server-Side Request Forgery (SSRF)**: Abusing external background URLs or link fetchers to hit internal metadata endpoints (`169.254.169.254`, `localhost`).
4. **Dangerous Scheme Hijacking**: Exploiting link fields with `javascript:`, `data:`, or `file:` schemes.
5. **Privilege Escalation**: Non-administrators triggering administrative moderation or tag modifications.
6. **Privacy Leakage**: Exposing hidden roles, join dates, or private profile information in public API payloads.

---

## 2. Core Security Mitigations

### 2.1 Identity Invariant & Zero-Trust Ownership
- **No Client Trust**: Client never sends target `userId` in profile mutations. The target user is derived exclusively from the verified Clerk session.
- **Provider Identity Binding**: Clerk sessions are mapped to `users` strictly by matching `external_user_id` (Discord Snowflake).
- **Reject Spoofing**: Matching by display name, username, or slug is strictly prohibited in authorization code.

### 2.2 XSS Protection & Sanitization
- **No Arbitrary User HTML/JS/CSS**: ASC renders all fields through React JSX, ensuring automatic context-aware escaping.
- **Markdown-Free Plain Text**: Bios and titles are treated as plain text strings. Markdown formatting is not parsed into HTML.
- **Length Limits**: Strict Zod length bounds prevent memory/DOM inflation attacks.

### 2.3 SSRF & External URL Validation
- **No Server Fetching of User Images**: ASC **never** downloads, buffers, or proxies user background image URLs on the server.
- Images are rendered directly by the browser (`<img src={url} />` or CSS background).
- **Scheme Whitelisting**:
  ```typescript
  export const safeUrlSchema = z
    .string()
    .url()
    .refine((url) => /^https:\/\//i.test(url), {
      message: 'Only secure HTTPS URLs are permitted',
    });
  ```
- **Dangerous Scheme Rejection**: Any input matching `^javascript:`, `^data:`, `^file:`, `^vbscript:` is rejected at the Zod layer.

### 2.4 Server-Side Privacy Enforcement
- **Data Stripping at Query / Serialization**: When `is_private` or `show_*` flags are disabled, the corresponding fields are stripped on the server before serialization. Private data is never sent to the client and hidden with CSS.

### 2.5 Server-Side Admin Authorization
- Administrative mutations inspect the authenticated user's assigned `community_roles` in Turso:
  ```typescript
  export async function assertAdmin(userId: string) {
    const isAdmin = await checkUserIsAdmin(userId);
    if (!isAdmin) {
      throw new AuthorizationError('Forbidden: Admin access required');
    }
  }
  ```
- Client-provided role claims or cookies are ignored.

### 2.6 Content Security Policy (CSP)
Next.js security headers in `apps/web/next.config.js`:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.clerk.accounts.dev https://*.turso.io; frame-ancestors 'none';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### 2.7 Audit Logging
- Consequential administrative and moderation events are appended to `audit_logs`:
  - `actor_id`: Immutable ID of admin.
  - `action`: Specific action code (e.g. `'HIDE_PROFILE'`, `'TAG_CREATE'`).
  - `target_type`: `'USER'`, `'TAG'`, `'SETTING'`.
  - `target_id`: ID of affected entity.
  - `metadata`: Sanitized JSON payload (no secrets or sensitive PII).
