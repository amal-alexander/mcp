---
title: "Multi-Account Support"
description: "Connect multiple Google and Bing accounts and let the server pick the right one automatically."
---

Search Console MCP lets you connect as many Google and Bing accounts as you need. The server automatically picks the right account when your AI agent makes a request.

## Why Multiple Accounts?

Common setups include:

- A **personal Google account** for your blog
- A **company Google account** for your work sites
- A **Bing account** for Microsoft search data
- A **GA4 Service Account** for behavioral analytics
- Separate accounts for **different clients or teams**

---

## Connecting Accounts

Run the setup wizard for each account you want to add:

```bash
npx search-console-mcp setup
```

Choose Google or Bing, complete the login, and give the account a name. Repeat for each account.

<Tip>
  Running setup again with the same name will update the existing account instead of creating a duplicate.
</Tip>

---

## How the Server Picks the Right Account

When your AI agent asks about a specific site (e.g., `example.com`), the server finds the account that has access to that site. If an account is set to "All Sites," it acts as a catch-all.

You don't need to specify which account to use — it's handled for you.

---

## Upgrading from an Older Version

If you used Search Console MCP before v1.12, your existing credentials will still work. The server automatically detects tokens and API keys from previous versions — no action needed on your part.

If you'd like to manage those older accounts (rename them, restrict sites), simply run the setup wizard again and it will bring them into the new system.
