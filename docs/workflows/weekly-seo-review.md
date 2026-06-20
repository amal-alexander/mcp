---
title: "Weekly SEO Review"
description: "A professional-grade sitewide audit in 60 seconds."
---

**User Question:** *"What's the high-level health of my site this week? Give me my top priorities."*

This is the most common workflow for founders and solo-marketers. It uses the `generate_recommendations` bundle to get a holistic view.

## Step 1: Holistic Analysis
The agent runs the "Intelligence Bundle" to scan for opportunities and warnings across all deterministic tools.

**Agent Logic:**
*   Call `generate_recommendations` for the `siteUrl`.
*   This automatically triggers sub-routines for cannibalization, quick wins, and low-hanging fruit.

## Step 2: Segmented Deep-Dive
The agent checks if the "Brand" traffic is stable compared to the "Non-Brand" growth.

**Agent Logic:**
*   Call `analyze_brand_vs_non_brand` using your project's brand regex.
*   If Brand traffic is dropping, it's a reputation problem. If Non-Brand is dropping, it's an SEO/Algorithm problem.

## Step 3: Performance Check
The agent verifies that no recently updated pages have slowed down significantly.

**Agent Logic:**
*   Check the `get_pagespeed` scores for the top 5 traffic-driving pages.

## Step 4: Executive Summary
The agent provides a prioritized list of tasks for the upcoming week.

**Example Outcome:**
> "### Weekly SEO Report: https://example.com
> 
> **Overall:** Traffic is up 5%, driven by Non-Brand queries.
> 
> **Top 3 Actions:**
> 1. **Optimize CTR:** Your highest impression query 'best ai tools' ranks #3 but has a CTR of only 1.2%. Update your meta title.
> 2. **Push to Page 1:** Found 3 pages at position 12. Adding internal links could double your traffic.
> 3. **Fix Speed:** Your home page mobile score dropped to 52/100. Likely due to the new large image assets."
