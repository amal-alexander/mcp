---
title: "Finding Quick Wins"
description: "How to identify and capture low-effort SEO growth."
---

**User Question:** *"I need some easy SEO wins for this project. What should I focus on first?"*

This workflow helps an agent identify keywords that are ranking just off the first page but have significant impression volume.

## Step 1: Identify Striking Distance Keywords
The agent uses the `seo_quick_wins` tool to find queries ranking in positions 11-20.

**Agent Logic:**
*   Call `seo_quick_wins` with `minImpressions: 500`.
*   This returns a list of pages that Google already likes but hasn't fully committed to placing on the first page.

## Step 2: Evaluate Content Quality
For the top 3 opportunities identified, the agent checks the current indexing and performance status.

**Agent Logic:**
*   Call `get_pagespeed` for each URL to ensure there aren't technical blockers (e.g., poor LCP).
*   Call `inspect_url` to verify the page is fully indexed and has no mobile usability errors.

## Step 3: Actionable Strategy
The agent generates a list of "Quick Wins" with specific instructions.

**Example Outcome:**
> "I've found 4 'Quick Win' opportunities for https://example.com.
> 
> 1. **Page:** `/features/ai-search`
>    * **Query:** 'best ai search tools'
>    * **Position:** 12
>    * **Impressions:** 2,400/mo
>    * **Action:** This page has high authority but low internal link counts. I suggest adding 3-5 internal links from your high-traffic blog posts to push this to Page 1."

## Step 4: Measuring Success
The agent sets a reminder (e.g., in your own task list) to run a `compare_periods` report in 14 days to see if the changes moved the needle.
