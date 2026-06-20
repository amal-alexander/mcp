---
title: "Investigating a Traffic Drop"
description: "How to root-cause a decline in SEO performance."
---

**User Question:** *"My traffic has dropped 20% this week. Why?"*

This workflow shows how an agent uses the MCP to act as a detective and attribute a drop to its root cause.

## Step 1: Confirm the Magnitude
The agent starts by verifying the drop and finding the exact start date using `analytics_time_series`.

**Agent Logic:**
*   Call `analytics_time_series` with `days: 30`.
*   Identify the "inflection point" where clicks started to diverge from the rolling average.

## Step 2: Site-Wide or Specific?
Next, the agent determines if the drop is universal or localized to certain segments.

**Agent Logic:**
*   Use `compare_periods` to check:
    *   **By Device:** Is it a mobile-only drop? (Likely PageSpeed or mobile-usability issue).
    *   **By Country:** Is it geographic? (Likely a local Google algorithm update).
    *   **By Search Appearance:** Is it a loss of Rich Snippets?

## Step 3: Page/Query Attribution
The agent finds the specific pages or keywords that "lost" the most clicks.

**Agent Logic:**
*   Use `seo_lost_queries` to identify top losers.
*   Cross-reference with `inspect_url` for those pages to check for manual actions or indexing issues.

## Step 4: Outcome
The agent concludes the investigation with an actionable report:

> "The 20% drop was concentrated on your **Product pages (mobile only)** starting on Tuesday. URL inspection shows the pages are still indexed, but **PageSpeed** scores dropped from 90 to 45. It appears a recent code update slowed down these pages, leading to a ranking decline."
