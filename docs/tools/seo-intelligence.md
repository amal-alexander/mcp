---
title: "SEO Intelligence Tools"
description: "Deterministic analysis for strategic growth."
---

These are not standard API calls. These tools implement complex SEO logic to provide the agent with high-level conclusions.

## Automation Tools

### `seo_opportunities` (Google) & `bing_opportunity_finder` (Bing)
Finds keywords with high impressions but low CTR (or positions 5-20).
*   **Problem:** You have visibility but aren't converting it into traffic.
*   **Resolution:** Optimize Title tags and Meta descriptions.

### `detect_cannibalization` (Google) & `bing_seo_recommendations` (Bing)
Identifies queries where multiple pages from your site are ranking, causing a "split" in traffic. (Note: `bing_seo_recommendations` also returns other insight types).
*   **Problem:** Search engines don't know which page is authoritative, so they rank both lower.
*   **Resolution:** Merge content or distinct the keyword targeting.

### `seo_quick_wins` (Google)
Filters for pages/queries ranking at positions 11-20 (the top of page 2).
*   **Problem:** You are "striking distance" away from massive traffic but aren't pushing enough.
*   **Resolution:** Add internal links or update the content to push to page 1.

### `detect_anomalies` (Google) & `bing_analytics_detect_anomalies` (Bing)
Uses statistical methods (Z-scores or threshold breaches) to find daily spikes or drops that deviate from the historical norm.
*   **Problem:** Manual monitoring misses small but significant shifts.
*   **Resolution:** Proactive alerts about algorithm updates or tracking issues.

### `seo_lost_queries` (Google & Bing)
Identifies queries that have lost significant traffic or visibility (e.g. >80% drop) compared to the previous period.
*   **Problem:** High-value keywords are slipping through the cracks without notice.
*   **Resolution:** Re-optimize content to regain lost rankings.

### `seo_brand_vs_nonbrand` (Google & Bing)
Segments your search performance into "Brand" and "Non-Brand" categories using regex pattern matching.
*   **Problem:** Branded traffic masks the true growth (or decline) of your SEO efforts.
*   **Resolution:** Measure organic growth by focusing on non-branded keywords.

## Example Agent Prompts

#### 1. Strategic Planning
> "Find the top 5 cannibalization issues for https://example.com and suggest which page should be the primary URL based on clicks."

#### 2. Growth Hacking
> "Give me a list of 'quick win' keywords that are on page 2 but have at least 1,000 impressions per month."

#### 3. Content Audit
> "Identify any 'low-hanging fruit' keywords where we rank in the top 10 but have a CTR below 2%."
