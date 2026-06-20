
# Security Policy

## Supported Versions

The latest published version of Search Console MCP is actively maintained and receives security updates.

Older versions may not receive patches. Users are encouraged to upgrade to the latest release.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please do not open a public GitHub issue.

Instead, report it privately:

Email: amalalex95@gmail.com

Please include:

- A clear description of the issue
- Steps to reproduce
- Potential impact
- Any suggested mitigation (if known)

You will receive acknowledgment within a reasonable timeframe.

---

## Security Model

Search Console MCP is designed as a local-first CLI tool with the following security principles:

### 1. OAuth-Based Authentication

- Uses OAuth 2.0 Device Authorization Flow
- Requests minimal scope (`webmasters.readonly`)
- Does not request write access to Google services
- Does not collect Google account passwords

Users authenticate directly with Google.

---

### 2. Local Token Storage

OAuth tokens are stored locally on the user’s device.

Primary storage:
- macOS: Keychain
- Windows: Credential Manager
- Linux: Secret Service / libsecret

Fallback storage (if secure vault unavailable):
- Encrypted using AES-256-GCM
- Machine-bound key derivation
- File permissions restricted to current user (600)

Only minimal data is stored:
- `refresh_token`
- Expiry metadata

Access tokens are short-lived and not permanently stored unless necessary.

---

### 3. No Central Data Collection

Search Console MCP:

- Does not operate a backend server
- Does not transmit user data to the developer
- Does not collect analytics on user Search Console data

All API communication occurs directly between the user’s machine and Google’s APIs.

---

## Security Boundaries

The primary security boundary is the protection of OAuth refresh tokens.

If an attacker gains:

- Full access to the user’s operating system account
- Administrative access to the machine

Then local security protections may be bypassed. This risk is inherent to all CLI-based applications.

---

## Revocation

Users may revoke application access at any time via their Google Account security settings.

Upon revocation:
- Stored refresh tokens become invalid
- Further API access will fail

Users may also run logout commands to remove locally stored credentials.

---

## Responsible Disclosure

We appreciate responsible disclosure and will make reasonable efforts to:

- Investigate reported issues
- Patch confirmed vulnerabilities
- Credit reporters (if desired)

Security is a priority, especially around OAuth and credential handling.
