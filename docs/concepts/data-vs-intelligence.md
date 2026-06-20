---
title: "Data vs. Intelligence"
description: "Why we don't just return raw API logs."
---

Most API integrations focus on **data delivery**: handing the computer a pile of numbers. This MCP focuses on **intelligence delivery**: handing the computer a set of findings.

## The Raw Data Problem

If you ask a model for keywords with "Striking Distance" (ranking 8-15) using raw data:
1.  The agent calls the API.
2.  It gets 5,000 keyword rows.
3.  It tries to scan them.
4.  It gets distracted or hits a context window limit.
5.  It misses the keywords ranking at position 16.

## The Intelligence Solution

If you use the `seo_striking_distance` tool:
1.  The MCP server fetches the 5,000 rows.
2.  It applies a strict filter: `position >= 8 && position <= 15`.
3.  It sorts them by `impressions` to find the most valuable ones.
4.  It returns only the top 50 relevant keywords.
5.  The agent receives a curated list of high-value opportunities.

## Deterministic Primitives

We categorize our tools into two types:

### 1. Data Proxies
Standard tools for listing sites, sitemaps, or running basic queries. High flexibility, low intelligence.

### 2. Intelligence Primitives (The "Pro" Tools)
Advanced tools that implement specific SEO logic:
*   **Anomaly Detection:** Uses Z-scores to find statistically significant spikes or drops.
*   **Trend Identification:** Compares two periods to find items with the most momentum.
*   **Attribution Analysis:** Breaking down *where* a drop came from (mobile vs. desktop, specific countries).

By using intelligence primitives, you allow the AI agent to act like a senior SEO strategist rather than a data entry clerk.
