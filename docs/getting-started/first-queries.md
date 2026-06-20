---
title: "First Queries"
description: "Testing your SEO agent for the first time."
---

Once the server is installed and authenticated, it's time to test it. Open your MCP-compatible client (like Claude Desktop) and start a conversation.

## Step 1: Verify Connection

Start by asking the agent what it can see. This verifies that the authentication is working.

**User Prompt:**
> "List the sites I have access to in Search Console."

**Expected Agent Response:**
> "I can see the following **Google Search Console** sites:
> 1. https://example.com
> 2. https://myblog.org
>
> I can see the following **Bing Webmaster Tools** sites:
> 1. https://example.com"

## Step 2: Get a Basic Performance Summary

Now, ask for a high-level overview of a specific site.

**User Prompt:**
> "Give me a summary of how https://example.com performed in the last 28 days on both Google and Bing."

**Expected Agent Steps:**
1.  Call `compare_periods` for Google.
2.  Call `bing_rank_traffic_stats` for Bing.
3.  Synthesize the answer.

## Step 3: Run an Intelligence Tool

This is where the power of the MCP shines. Instead of asking for data, ask for an analysis.

**User Prompt:**
> "Can you find any 'quick wins' for https://example.com? I'm looking for pages ranking just off the first page."

**Expected Agent Steps:**
1.  Call `seo_quick_wins` for Google.
2.  Call `bing_opportunity_finder` for Bing.

## Step 4: Run a Site Health Check

Now try the health check tool to get an instant diagnostic across your properties.

**User Prompt:**
> "Run a health check on all my sites (Google and Bing) and tell me which ones need attention."

The agent will use the `sites_health_check` and `bing_sites_health` tools to check performance trends, sitemap status, and traffic anomalies.

## Step 5: Correlate Search with Behavior (GA4)

If you've connected a GA4 property, you can run cross-platform analysis.

**User Prompt:**
> "Analyze https://example.com using the opportunity matrix. Which keywords are ranking well on Google but have poor engagement on-site?"

**Expected Agent Steps:**
1. Call `opportunity_matrix`.
2. This will internally fetch GSC rankings and correlate them with GA4 metrics (sessions, engagement rate).

## Step 6: IndexNow (Bing Only)

If you have a site verified on Bing, try notifying them of a new URL.

**User Prompt:**
> "I just published a new post at https://example.com/new-post. Notify Bing via IndexNow."

The agent will use `bing_index_now` to instantly submit the URL for indexing.

## Tips for Success

*   **Specify the Site:** Always include the `siteUrl` in your prompt if you have access to multiple sites.
*   **Be Outcome-Oriented:** Instead of "show me my clicks," say "analyze why my clicks dropped."
*   **Context is King:** Tell the agent *what* the site is about to get better qualitative insights.
