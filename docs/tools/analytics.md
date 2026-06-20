---
title: "Analytics Tools"
description: "Mastering search performance data."
---

The Analytics tools are the foundation of your SEO agent's knowledge. They allow you to pull basic data or perform complex time-series analysis across **Google Search Console, Bing, and Google Analytics 4**.

## Core Tools

### `query_analytics` (Google) & `bing_analytics_query` (Bing)
These are your primary tools for getting raw keyword data. They support filtering and dimension grouping.
*   **When to use:** When you need a specific list of keywords, pages, or country-level data.
*   **Best for:** "List the top 10 keywords for the last 30 days."

### `compare_periods` (Google) & `bing_analytics_compare_periods` (Bing)
Calculates the delta between two time windows.
*   **When to use:** When you need to see if you are growing or shrinking.
*   **Best for:** "Compare this week's performance to last week."

### `analytics_page_performance` (GA4)
Detailed page metrics from Google Analytics 4, including sessions, engagement rates, and unique views.
*   **When to use:** When you need to understand how users behave *after* they click from search results.
*   **Best for:** "Show me the engagement rate for my top landing pages."

## Advanced Analysis

### `analytics_time_series` (Google) & `bing_analytics_time_series` (Bing)
The "brain" of our analytics suite. It calculates rolling averages (to smooth out weekend dips), detects seasonality, and provides simple forecasting.
*   **When to use:** To understand long-term trends or identify the exact day a drop started.
*   **What problem it solves:** Distinguishing between a "bad day" and a "downward trend."

### `analytics_drop_attribution` (Google) & `bing_analytics_drop_attribution` (Bing)
Correlates traffic drops with known algorithm updates or device-specific issues.
*   **When to use:** When you see a sudden decline.
*   **What problem it solves:** Instantly tells you if a drop coincides with a Core Update.

## Example Agent Prompts

#### 1. Checking specific performance
> "Run a performance report for https://example.com comparing January to December. Segment the data by device (mobile vs. desktop)."

#### 2. Visualizing trends
> "Analyze the click trend for my top 5 keywords over the last 90 days. Use a 7-day rolling average to clean up the data."

#### 3. Regional analysis
> "Which country had the highest growth in CTR for keywords containing 'premium' in the last 6 months?"
