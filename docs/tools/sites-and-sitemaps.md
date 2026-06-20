---
title: "Discovery Tools"
description: "Managing sites and discovery paths."
---

Sitemaps are how you tell Google what to crawl. Our sitemap tools give the agent control over how your site is discovered.

## Tool Groups

### Site Management
*   `list_sites` (Google) & `bing_sites_list` (Bing): See everything in your account.
*   `add_site` (Google): Add a new property (Bing relies on imported sites or Verification via other means typically).
*   `delete_site` (Google): Remove a property.

### Sitemap Management
*   `list_sitemaps` (Google) & `bing_sitemaps_list` (Bing): See status and error counts.
*   `submit_sitemap` (Google) & `bing_sitemaps_submit` (Bing): Push a new XML sitemap to the engine.

### Instant Indexing (Bing Only)
*   `bing_index_now`: Instantly notify Bing and other engines of new, updated, or deleted URLs. Prefer this over sitemaps for time-sensitive content.

## Operational Use Cases

### 1. New Site Onboarding
An agent can automatically list all your properties and run an initial "health check" on each one.

### 2. Monitoring Errors
An agent can periodically check `list_sitemaps` to see if Google has reported any "Couldn't fetch" or "Parsing error" statuses.

## Example Agent Prompts

#### 1. Checking Sitemap Health
> "Check the status of all sitemaps for https://example.com. Are there any errors or warnings I should know about?"

#### 2. Discovery Audit
> "When was the last time the sitemap for https://example.com was crawled? Find any pages that are in the sitemap but not getting indexed."

#### 3. New Content Deployment
> "I just added a new sitemap at https://example.com/products-sitemap.xml. Please submit it to Search Console."
