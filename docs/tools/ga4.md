---
title: "Google Analytics 4 (GA4)"
description: "Correlate your search rankings with real user behavior data from GA4."
---

The **Google Analytics 4 (GA4)** integration allows your AI agent to bridge the gap between "visibility" (Google Search Console) and "value" (on-site behavior). 

By connecting GA4, you can identify which ranking keywords actually drive engaged sessions, conversions, and revenue.

## Core Capabilities

Search Console MCP provides a comprehensive suite of GA4 tools:

### Page & Traffic Analysis
*   `analytics_page_performance`: Detailed page metrics including sessions, engagement rate, and views.
*   `analytics_traffic_sources`: Analyze sessions segmented by Channel, Source, and Medium.
*   `analytics_organic_landing_pages`: Focused metrics for organic traffic landing pages.

### Content & Conversion
*   `analytics_content_performance`: Group performance by Content Grouping.
*   `analytics_conversion_funnel`: Identify top converting pages and events.
*   `analytics_ecommerce`: Product-level performance and revenue data.

### Behavioral Insights
*   `analytics_user_behavior`: Device, Country, and Engagement breakdown.
*   `analytics_audience_segments`: New vs. Returning users, Age, and OS analysis.
*   `analytics_realtime`: Live active user data.

---

## Cross-Platform Intelligence (Flagship Tools)

The true power of the GA4 integration is found in the **Cross-Platform** tools that combine GSC and GA4 data:

### `opportunity_matrix`
The ultimate prioritization tool. It combines GSC impressions and rankings with GA4 engagement and conversion data to find high-value, high-intent opportunities.

### `traffic_health_check`
Automatically identifies tracking gaps. If GSC shows 1,000 clicks but GA4 only shows 200 organic sessions, this tool flags a potential tracking or implementation issue.

### `page_analysis`
Provides a side-by-side view of a page's search ranking performance vs. its on-site conversion performance.

---

## Setup & Authentication

GA4 requires a **Google Cloud Service Account** for authentication.

1.  **Run Setup**: `npx search-console-mcp setup --engine=ga4`
2.  **Auth Method**: Provide your Service Account JSON key path.
3.  **Property Selection**: The setup wizard will list your available GA4 properties and help you select the correct one.

<Info>
  **Important:** You must add the Service Account email as a user with at least "Viewer" permissions in your GA4 Property (Admin > Access Management).
</Info>

---

## Example Prompts

> "Generate an `opportunity_matrix` for my site. Which keywords have high rankings but low on-site engagement?"

> "Is my tracking broken? Compare my GSC clicks to GA4 organic sessions for the last 14 days using `traffic_health_check`."

> "Show me my top 5 converting organic landing pages and their current GSC impressions."
