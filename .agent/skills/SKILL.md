---
name: search-console-mcp
description: Expert skill for installing, configuring, and troubleshooting the Search Console MCP server.
---

# Search Console MCP Expert Skill

This skill enables agents to manage the Search Console MCP server (Google, Bing, and GA4). Use this to resolve configuration issues, list sites, and run performance queries.

## 🚀 Quick Start (Recommended)

Run the server directly without installation to verify setup:
```bash
npx search-console-mcp setup
```

## 🛠️ Installation

### Global Installation (CLI access)
```bash
npm install -g search-console-mcp
```

### Local Development
```bash
npm install && npm run build
```

## ⚙️ Configuration Patterns

### 1. Google Search Console (OAuth 2.0)
The default and most common way. Initiates a local server at `localhost:3000` for browser authorization.
```bash
search-console-mcp setup --engine=google
```

### 2. Bing Webmaster Tools
Requires an API key from [Bing Webmaster Settings](https://www.bing.com/webmasters/settings/api).
```bash
search-console-mcp setup --engine=bing
```

### 3. Google Analytics 4 (Service Account)
Primary support for Service Accounts. JSON key file path is required.
```bash
search-console-mcp setup --engine=ga4
```

## 🔍 Diagnostic & Debugging Workflows

If the user reports "0 results" or "not connected" errors, follow this diagnostic loop:

### Step 1: Check Connectivity
Run the internal health check to verify API tokens and connectivity.
```bash
search-console-mcp diagnostics
```

### Step 2: Verify Authorized Sites
Verify which sites are actually authorized for use.
```bash
search-console-mcp sites
```

### Step 3: Verbose Debugging
Enable the internal logger to track account resolution and site filtering. Logs are sent to `stderr`.
```bash
DEBUG=true search-console-mcp sites_list
```

## 🧪 Advanced Account Management

### List All Configured Accounts
```bash
search-console-mcp accounts list
```

### Site Boundary Management
Search Console MCP allows restricting an account to specific sites.
```bash
# Add a site to an account's whitelist
search-console-mcp accounts add-site --account=email@example.com --site=https://example.com/

# Remove an account entirely
search-console-mcp accounts remove --account=email@example.com
```

## 💡 Troubleshooting "0 Results" Guide

Common reasons for empty results:
1.  **Protocol Mismatch**: `https://example.com/` (URL prefix) is different from `example.com` (Domain).
2.  **GSC Data Lag**: Data is typically unavailable for the last 2-3 days. Query ranges older than 3 days.
3.  **Account Scoping**: The site might not be in the account's configured boundary. Use `search-console-mcp sites` to confirm.
