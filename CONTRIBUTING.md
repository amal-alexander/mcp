# Contributing to Search Console MCP

Thanks for your interest in contributing.

This project aims to provide a secure, minimal, AI-friendly interface to Google Search Console data. Contributions should align with that philosophy: structured, deterministic, and security-conscious.

---

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies

```bash
npm install
```

4. Run in development mode
```bash
npm run dev
```
---

## Development Principles

Please follow these core principles:

- Keep OAuth scope minimal (read-only by default)
- Avoid unnecessary dependencies
- Prefer deterministic logic over heuristic magic
- Do not introduce server-side data collection
- Maintain secure token storage patterns

If adding new tools:
- Validate input with `zod`
- Keep responses structured and predictable
- Avoid returning massive raw datasets unless explicitly required

---

## Pull Requests

Before submitting a PR:

- Ensure code compiles (`npm run build`)
- Ensure tests pass (`npm test`)
- Keep changes focused and minimal
- Add documentation updates if relevant

PRs that introduce breaking changes should clearly explain:

- Why the change is necessary
- Migration steps (if any)

---

## Security Issues

If you discover a security vulnerability:

- Do not open a public issue
- Email: amalalex95@gmail.com
- Provide detailed reproduction steps

We take security seriously, especially regarding OAuth and token storage.

---

## Code Style

- TypeScript only
- Strict typing enabled
- No unnecessary abstractions
- Keep files small and focused

---

## Philosophy

Search Console MCP is designed to:

- Be local-first
- Be secure by default
- Be AI-friendly
- Avoid unnecessary SaaS complexity

If your contribution aligns with that, it’s welcome.

---

Thanks for helping improve the project.
