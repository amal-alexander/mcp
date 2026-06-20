---
title: "Detecting Cannibalization"
description: "Resolving internal conflicts that hurt your rankings."
---

**User Question:** *"Are any of my pages competing with each other for the same terms?"*

Keyword cannibalization occurs when multiple pages on your site target the same query, confusing Google and diluting your ranking power.

## Step 1: Broad Scan
The agent scans the entire site for queries where multiple URLs rank in the top 20.

**Agent Logic:**
*   Call `detect_cannibalization` with a lookback of 30 days.
*   The tool identifies queries where "Page A" and "Page B" both have significant impression share.

## Step 2: Conflict Analysis
The agent evaluates the "Conflict Score" provided by the tool.

**Agent Logic:**
*   High Conflict (Score > 0.7): Both pages get similar clicks/impressions. Google is actively swapping them.
*   Low Conflict: One page dominates, but another "drifts" in occasionally.

## Step 3: Resolution Path
The agent analyzes the intent of both pages to suggest a fix.

**Agent Logic:**
*   If Page A is a blog post and Page B is a product page: "Update Page A to link to Page B as the primary authority."
*   If both are similar blog posts: "Consolidate Page B into Page A and set up a 301 redirect."

## Example Outcome:
> "Query: **'mcp vs rest api'**
> * **Conflict Score:** 0.85
> * **Pages:** `/blog/mcp-overview` and `/documentation/protocol-comparison`
> * **Finding:** Both pages are ranking at positions 4 and 5. This is likely splitting your click-through rate.
> * **Recommendation:** Move the technical comparison from the blog post into the documentation page, and redirect the blog post to the documentation."
