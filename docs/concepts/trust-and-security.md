---
title: "Trust and Security"
description: "Safe automation for your most valuable data."
---

Search Console data is sensitive. It reveals exactly what keywords your business depends on. We designed this MCP server with a "security-first" mindset.

## Secure Token Storage

We treat your Google credentials with the highest level of security available on your operating system.

*   **System Keychain:** Access tokens and refresh tokens are stored primarily in your OS's native credential manager (macOS Keychain, Windows Credential Manager, Linux Secret Service).
*   **Hardware-Bound Encryption:** If keychain storage is unavailable, tokens are encrypted using **AES-256-GCM** with a key derived from your unique hardware machine ID. This means sophisticated malware or attackers cannot simply steal the file and use it elsewhere.
*   **Minimal Footprint:** We only store the `refresh_token` and `expiry_date`. No other personal information is persisted.

## Explainability Over Everything

We believe agents should be able to explain *how* they reached a conclusion.
*   **Tool Proofs:** Advanced tools don't just say "Fix this." They provide the supporting data (clicks, benchmarks, thresholds) so you can verify the logic.
*   **No Black Boxes:** The intelligence tools are open-source. You can see exactly how a "cannibalization conflict" score is calculated in our SEO engine.

## Boundary Defenses

The MCP server is explicitly built **NOT** to do certain things:
*   **No Auto-Writing:** It does not generate content for your site. This prevents low-quality "AI slop" from being pushed to your pages.
*   **No Direct Site Editing:** It cannot change your HTML, CMS, or DNS settings.
*   **No Credential Leakage:** The server is designed to prevent leaking your service account email or project ID to the model unless explicitly required.

## Your Responsibilities

While the server is secure, you are responsible for:
1.  **Protecting your machine access.** Your tokens are encrypted with your machine ID, so physical access or remote execution on your specific machine is required to decrypt them.
2.  **Reviewing Access.** Regularly check [Google Account Permissions](https://myaccount.google.com/permissions) to see which apps have access to your data.
3.  **Prompt Oversight.** Always review the agent's findings before making significant business decisions.
