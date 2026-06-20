---
title: "Cursor Prompts"
description: "Using SEO data to drive your development workflow."
---

Cursor allows you to use SEO data directly in your IDE. This is perfect for developers who want to prioritize performance fixes or content updates based on real traffic.

## The "Performance Prioritizer" Prompt
Use this in the Chat window to find which files need optimization.

```markdown
Run a PageSpeed report for my top 5 most visited pages on mobile using the search-console MCP. 
Cross-reference the results with my local file structure. 
Which React components or CSS files are most likely responsible for the 'Largest Contentful Paint' (LCP) issues on these pages?
```

## The "Content Update" Prompt
Use this when you want to update metadata or copy.

```markdown
Find any 'Low CTR Opportunities' for the current site. 
Compare the queries discovered with the current <title> and <meta description> tags in my codebase for those pages. 
Suggest improved, keyword-optimized titles that are likely to increase my CTR.
```

## The "Health Check Dashboard" Prompt
Use this to monitor all your sites from your IDE.

```markdown
Run a health check for https://example.com using the search-console MCP.
Show me the overall status, week-over-week performance changes, and any sitemap errors.
If there are issues, cross-reference with my local code to see if a recent deploy could have caused them.
```

## The "Bing Optimization" Prompt
Use this to find Bing-specific wins from your IDE.

```markdown
Compare my site's performance on Google vs. Bing using the compare_engines tool.
For any keywords flagged as 'bing_opportunity', check my page's meta tags and structured data.
Are there any Bing-specific meta tags (like bingbot directives) missing from my codebase that could improve rankings?
```

## Why these work well
*   **Contextual Awareness:** Cursor knows your code. By using the MCP, it also knows your *results*. This bridge allows it to make code suggestions based on search performance.
*   **Zero-Context Switching:** You don't have to leave your editor to know that your recent deploy slowed down your most important landing page.
*   **Multi-Engine:** Compare Google and Bing data side by side and fix issues directly in your code.
