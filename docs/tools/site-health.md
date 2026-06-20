---
title: "Site Health Check"
description: "Automated health diagnostics for one or all Search Console properties."
---

The `sites_health_check` (Google), `bing_sites_health` (Bing), and `traffic_health_check` (GA4 Cross-Platform) tools give your AI agent the ability to perform a comprehensive, automated health check across your properties.

## How It Works

When invoked, the tool runs the following checks **in parallel** for each site:

1.  **Week-over-Week Performance** — Compares clicks, impressions, CTR, and average position for the current 7-day period against the previous 7 days (with a 3-day data delay to account for GSC reporting lag).
2.  **Sitemap Status** — Lists all submitted sitemaps and flags any with errors or warnings.
3.  **Traffic Anomalies** — Uses statistical anomaly detection (Z-score, 14-day window) to surface unexpected traffic drops.

The results are aggregated into a per-site report with an overall status:

| Status | Meaning |
|--------|---------|
| `healthy` | No issues detected. |
| `warning` | Minor issues found (e.g., moderate traffic decline, sitemap warnings, anomaly drops). |
| `critical` | Severe problems (e.g., traffic down >30%, no traffic data, no sitemaps). |

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `siteUrl` | No | The URL of a specific site to check. If omitted, **all verified sites** are checked. |

When checking all sites, results are sorted with **critical sites first**.

## Report Structure

Each site report contains:

```json
{
  "siteUrl": "https://example.com",
  "status": "warning",
  "permissionLevel": "siteOwner",
  "performance": {
    "current": { "clicks": 400, "impressions": 8000, "ctr": 0.05, "position": 9 },
    "previous": { "clicks": 500, "impressions": 10000, "ctr": 0.05, "position": 8 },
    "changes": {
      "clicks": -100, "clicksPercent": -20,
      "impressions": -2000, "impressionsPercent": -20,
      "ctr": 0, "ctrPercent": 0,
      "position": 1, "positionPercent": 12.5
    }
  },
  "sitemaps": {
    "total": 1,
    "withErrors": 0,
    "withWarnings": 0,
    "details": [
      { "path": "https://example.com/sitemap.xml", "type": "sitemap", "isPending": false, "hasErrors": false }
    ]
  },
  "anomalies": [],
  "issues": [
    "Traffic declining: clicks down 20.0% week-over-week",
    "Visibility declining: impressions down 20.0% week-over-week"
  ]
}
```

## Issue Detection Rules

The tool automatically flags the following:

| Condition | Severity | Issue Message |
|-----------|----------|---------------|
| Clicks down ≥ 30% WoW | Critical | "Critical traffic drop: clicks down X% week-over-week" |
| Clicks down ≥ 15% WoW | Warning | "Traffic declining: clicks down X% week-over-week" |
| Impressions down ≥ 30% WoW | Critical | "Critical visibility drop: impressions down X% week-over-week" |
| Impressions down ≥ 15% WoW | Warning | "Visibility declining: impressions down X% week-over-week" |
| Position worsened by > 3 | Warning | "Average position worsened by X positions" |
| Zero clicks & impressions | Critical | "No traffic data for the current period" |
| No sitemaps submitted | Warning | "No sitemaps submitted" |
| Sitemaps with errors | Warning | "N sitemap(s) have errors" |
| Sitemaps with warnings | Warning | "N sitemap(s) have warnings" |
| Anomaly drops in 14 days | Warning | "N traffic anomaly drop(s) detected" |

## Example Agent Prompts

#### Quick Health Check (Single Site)
> "Run a health check on https://example.com. Summarize any issues and recommend next steps."

#### Portfolio Health Overview
> "Check the health of all my sites and give me a dashboard-style summary. Which sites need attention right now?"

#### Weekly Monitoring Workflow
> "Run a health check on all my sites. For any site with 'critical' status, investigate the cause using the drop attribution and URL inspection tools."

## Integration with Other Tools

The health check is designed to be a **starting point** for deeper analysis:

*   **Critical traffic drops →** Follow up with `analytics_drop_attribution` to correlate with algorithm updates.
*   **Sitemap errors →** Use `sitemaps_list` to get detailed error info and `sitemaps_submit` to resubmit.
*   **Anomaly drops →** Use `analytics_time_series` for trend analysis and `inspection_inspect` for de-indexing checks.
*   **Overall decline →** Use `seo_recommendations` for actionable improvement suggestions.
