/**
 * Google Search Console - Common Patterns & Recipes
 * 
 * This documentation is exposed as an MCP resource for AI agents.
 */

export const patternsDocs = `# Google Search Console - Common Patterns & Recipes

This guide shows common use cases and patterns for analyzing Search Console data.

## Quick Reference

### Get Site Performance Overview
Use \`analytics_performance_summary\` for high-level metrics:
\`\`\`
Tool: analytics_performance_summary
Args: { "siteUrl": "https://example.com", "days": 28 }
\`\`\`

### Inspect a URL's Index Status
Use \`inspection_inspect\` to check if a URL is indexed:
\`\`\`
Tool: inspection_inspect
Args: { 
  "siteUrl": "https://example.com",
  "inspectionUrl": "https://example.com/my-page"
}
\`\`\`

| Tool | Description |
|------|-------------|
| \`analytics_drop_attribution\` | Identify if a traffic drop was device-specific or algorithm-linked. |
| \`analytics_time_series\` | Get rolling averages, seasonality strength, and trend forecasts. |

---

## Advanced Analytics Patterns

### Attribute a Traffic Drop
Identify if a recent drop was caused by mobile/desktop devices or correlates with a Google Algorithm Update:
\`\`\`json
{
  "siteUrl": "https://example.com",
  "days": 30
}
\`\`\`

### Time Series Forecasting
Get a 14-day rolling average and forecast the next 14 days of traffic:
\`\`\`json
{
  "siteUrl": "https://example.com",
  "days": 60,
  "window": 14,
  "forecastDays": 14
}
\`\`\`

---

## Analytics Patterns

### Top 10 Queries by Clicks
\`\`\`json
{
  "siteUrl": "https://example.com",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dimensions": ["query"],
  "limit": 10
}
\`\`\`

### Top Pages by Impressions
\`\`\`json
{
  "dimensions": ["page"],
  "limit": 20
}
\`\`\`

### Daily Traffic Trend
\`\`\`json
{
  "dimensions": ["date"],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
\`\`\`

### Mobile vs Desktop Performance
\`\`\`json
{
  "dimensions": ["device"]
}
\`\`\`

### Performance by Country
\`\`\`json
{
  "dimensions": ["country"],
  "limit": 10
}
\`\`\`

---

## Finding Opportunities

### High Impressions, Low CTR (Optimization Opportunities)
Query all data, then look for rows where:
- impressions > 100
- ctr < 0.02 (2%)

These are keywords where you rank but don't get clicks - optimize titles/descriptions.

### Low Position, High Impressions (Ranking Opportunities)
Look for rows where:
- position > 10 (not on page 1)
- impressions > 50

These could move to page 1 with optimization.

### Branded vs Non-Branded Traffic
Use filters to separate:
\`\`\`json
{
  "dimensions": ["query"],
  "filters": [{
    "dimension": "query",
    "operator": "notContains",
    "expression": "your-brand-name"
  }]
}
\`\`\`

---

## Content Analysis

### Find Top Queries for a Specific Page
\`\`\`json
{
  "dimensions": ["query"],
  "filters": [{
    "dimension": "page",
    "operator": "equals",
    "expression": "https://example.com/specific-page"
  }],
  "limit": 20
}
\`\`\`

### Find Pages Ranking for a Query
\`\`\`json
{
  "dimensions": ["page"],
  "filters": [{
    "dimension": "query",
    "operator": "contains",
    "expression": "your target keyword"
  }]
}
\`\`\`

### Blog Performance
\`\`\`json
{
  "dimensions": ["page"],
  "filters": [{
    "dimension": "page",
    "operator": "contains",
    "expression": "/blog/"
  }],
  "limit": 50
}
\`\`\`

---

## Date Range Tips

1. **Data delay**: GSC data is delayed 2-3 days. Don't query today's date.
2. **16 months max**: Historical data goes back ~16 months.
3. **Compare periods**: Query two date ranges separately and compare programmatically.

### Last 7 Days vs Previous 7 Days
Week 1: startDate = 10 days ago, endDate = 4 days ago
Week 2: startDate = 17 days ago, endDate = 11 days ago

---

## Sitemaps Management

### List All Sitemaps
\`\`\`
Tool: sitemaps_list
Args: { "siteUrl": "https://example.com" }
\`\`\`

### Submit New Sitemap
\`\`\`
Tool: sitemaps_submit
Args: { 
  "siteUrl": "https://example.com",
  "feedpath": "https://example.com/sitemap.xml"
}
\`\`\`

### Check Sitemap Status
\`\`\`
Tool: sitemaps_get
Args: {
  "siteUrl": "https://example.com",
  "feedpath": "https://example.com/sitemap.xml"
}
\`\`\`

---

## URL Inspection Patterns

### Check if Page is Indexed
Look at \`inspectionResult.indexStatusResult.verdict\`:
- \`PASS\` = Indexed
- \`NEUTRAL\` = Not indexed but no issues
- \`FAIL\` = Has issues preventing indexing

### Check Mobile Usability
Look at \`inspectionResult.mobileUsabilityResult.verdict\`

### Check Rich Results
Look at \`inspectionResult.richResultsResult\` for structured data issues
`;

export default patternsDocs;
