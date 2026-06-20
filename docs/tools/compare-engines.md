---
title: "Compare Engines"
description: "Compare your site's performance across Google and Bing side by side."
---

The `compare_engines` and `opportunity_matrix` tools let you see how your site performs across **Google, Bing, and GA4** side by side.

## What It Does

It pulls data from both Google Search Console and Bing Webmaster Tools, normalizes it, and shows you the differences. For each keyword or page, you'll see:

- **Clicks, impressions, CTR, and position** on each engine
- **Deltas** — how much the position and CTR differ between engines
- **Signals** — automatic alerts that highlight opportunities and risks

---

## Signals

The tool automatically flags important patterns:

| Signal | What It Means |
|--------|---------------|
| `bing_opportunity` | You rank well on Google (top 5) but poorly on Bing (10+). Easy win to optimize for Bing. |
| `google_dependency_risk` | Over 85% of your clicks come from Google. You're too dependent on one engine. |
| `ctr_mismatch` | Similar rankings on both engines, but very different click-through rates. Your titles or snippets may display differently. |
| `ranking_divergence` | A 7+ position gap between Google and Bing for the same keyword. Worth investigating. |

---

## Example Prompts

Try these with your AI agent:

> "Compare my top keywords on Google vs. Bing for the last 30 days. Which keywords rank better on Bing?"

> "Show me keywords where I'm in the top 5 on Google but not ranking well on Bing. These are my Bing opportunities."

> "Am I too dependent on Google? Check my click share across both engines."

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `siteUrl` | Yes | Your site URL (e.g., `example.com`) |
| `dimension` | No | What to compare: `query`, `page`, `country`, or `device`. Default: `query` |
| `startDate` | No | Start date (YYYY-MM-DD). Default: 28 days ago |
| `endDate` | No | End date (YYYY-MM-DD). Default: today |
| `minImpressions` | No | Only show results with at least this many impressions |
| `minClicks` | No | Only show results with at least this many clicks |

<Info>
  You need both a Google and a Bing account connected to use this tool. Run `npx search-console-mcp accounts list` to verify.
</Info>
