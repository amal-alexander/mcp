---
title: "Overview"
description: "What is search-console-mcp?"
---

**search-console-mcp** is an open-source implementation of the [Model Context Protocol](https://modelcontextprotocol.io) that gives AI agents direct, structured access to **Google Search Console (GSC)**, **Bing Webmaster Tools**, and **Google Analytics 4 (GA4)**.

Unlike simple API wrappers, this project focuses on providing **SEO Intelligence Tools**. Instead of just asking an agent to "look at my data," you can give it tools to "find quick wins," "detect traffic anomalies," or "submit URLs instantly."

## Key Capabilities

*   **Multi-Platform Support:** Manage sites and behavior data for Google, Bing, and GA4 in one place.
*   **Advanced Analytics:** Multi-dimensional analysis, rolling averages, and behavior correlation across all platforms.
*   **SEO Insights:** Deterministic detection of cannibalization, Striking Distance keywords, and "Low-Hanging Fruit."
*   **Site Health Check:** Automated diagnostics across all your properties — performance trends, sitemap status, and anomaly detection in one call.
*   **Instant Indexing:** Use **IndexNow** to instantly notify Bing and other engines of content changes.
*   **Sitemap Control:** List, submit, and delete sitemaps.
*   **URL Inspection:** Check the indexing status of individual pages on Google and Bing.
*   **PageSpeed Integration:** Measure performance and Core Web Vitals directly within your SEO workflow.

## The Problem

Working with SEO data in LLMs usually involves:
1.  Exporting CSVs.
2.  Uploading them to a chat window.
3.  Hoping the model calculates standard deviations or trends correctly.

## The Solution

With this MCP server, the agent has a "toolbox." When you ask "Why did my traffic drop?", the agent doesn't guess. It calls `analytics_time_series` to check for anomalies, `inspect_url` to see if pages were de-indexed, and `traffic_health_check` to correlate with GA4 behavior.

## Supported Clients

This server works with any MCP-compatible client, including:
*   [Claude Desktop](https://claude.ai/download)
*   [Cursor](https://cursor.com)
*   [LibreChat](https://librechat.ai)
*   Custom agent implementations using the MCP SDK.
