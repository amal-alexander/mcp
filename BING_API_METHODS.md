# Bing Webmaster API - Global Methods and Request Data (from WSDL)

This document lists the available methods in the Bing Webmaster API and their corresponding request parameters, as extracted from the official WSDL definition (`https://ssl.bing.com/webmasterapi/api.svc?singleWsdl`).

## Site Management
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **AddSite** | Add a new site to Bing Webmaster Tools. | `siteUrl` (string) |
| **GetUserSites** | ✅ List all sites for the authenticated user. | *(No parameters)* |
| **RemoveSite** | Remove a site from Bing Webmaster Tools. | `siteUrl` (string) |
| **VerifySite** | Verify a site using a specific method. | `siteUrl` (string), `verificationMethod` (string) |
| **CheckSiteVerification** | Check if a site is already verified. | `siteUrl` (string) |

## Analytics & Traffic
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **GetQueryStats** | ✅ Get search query performance. | `siteUrl` (string) |
| **GetPageStats** | ✅ Get page performance stats. | `siteUrl` (string) |
| **GetRankAndTrafficStats** | ✅ Get ranking and traffic overview. | `siteUrl` (string) |
| **GetPageQueryStats** | ✅ Get queries for a specific page. | `siteUrl` (string), `page` (string) |
| **GetQueryPageStats** | ✅ Get pages for a specific query. | `siteUrl` (string), `query` (string) |
| **GetUrlTrafficInfo** | Get traffic details for a specific URL. | `siteUrl` (string), `url` (string) |
| **GetChildrenUrlTrafficInfo**| Child URL traffic for a directory. | `siteUrl` (string), `url` (string), `page` (unsignedShort) |
| **GetQueryTrafficStats** | Traffic stats for a query. | `siteUrl` (string), `query` (string) |

## Keywords
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **GetKeywordStats** | ✅ Get performance for a keyword. | `q` (string), `country` (string), `language` (string) |
| **GetKeyword** | Get keyword data for a date range. | `q` (string), `country` (string), `language` (string), `startDate` (dateTime), `endDate` (dateTime) |
| **GetRelatedKeywords** | ✅ Get related keywords. | `q` (string), `country` (string), `language` (string), ... |

## Crawl & Indexing
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **GetCrawlStats** | ✅ Get overall crawl statistics. | `siteUrl` (string) |
| **GetCrawlIssues** | ✅ Get identified crawl issues. | `siteUrl` (string) |
| **GetUrlInfo** | ✅ Get crawl details for a URL. Returns `HttpStatus`, `LastCrawledDate`, `AnchorCount`, etc. | `siteUrl` (string), `url` (string) |
| **GetChildrenUrlInfo** | Child URL crawl info. | `siteUrl` (string), `url` (string), `page` (unsignedShort), `filterProperties` (Complex) |
| **GetCrawlSettings** | Get site crawl rate settings. | `siteUrl` (string) |
| **SaveCrawlSettings** | Save crawl rate settings. | `siteUrl` (string), `crawlSettings` (Complex Object) |

## URL Submission (IndexNow/Manual)
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **SubmitUrl** | ✅ Submit a single URL for indexing. | `siteUrl` (string), `url` (string) |
| **SubmitUrlBatch** | ✅ Submit multiple URLs. | `siteUrl` (string), `urlList` (string[]) |
| **GetUrlSubmissionQuota** | ✅ Remaining daily/monthly quota (`DailyQuota`, `MonthlyQuota`). | `siteUrl` (string) |
| **SubmitContent** | Submit URL and structured content. | `siteUrl` (string), `url` (string), `httpMessage`, `structuredData`, etc. |
| **GetContentSubmissionQuota**| Quota for content submission. | `siteUrl` (string) |

## Sitemaps & Feeds
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **GetFeeds** | ✅ List sitemaps/feeds for a site. | `siteUrl` (string) |
| **GetFeedDetails** | Details for a specific sitemap. | `siteUrl` (string), `feedUrl` (string) |
| **SubmitFeed** | ✅ Submit a sitemap URL. | `siteUrl` (string), `feedUrl` (string) |
| **RemoveFeed** | Remove a sitemap URL. | `siteUrl` (string), `feedUrl` (string) |

## URL Blocking & Previews
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **AddBlockedUrl** | Block a URL from search results. | `siteUrl` (string), `blockedUrl` (Complex Object) |
| **GetBlockedUrls** | List currently blocked URLs. | `siteUrl` (string) |
| **RemoveBlockedUrl** | Unblock a URL. | `siteUrl` (string), `blockedUrl` (Complex Object) |
| **AddPagePreviewBlock** | Block a page preview/snippet. | `siteUrl` (string), `url` (string), `reason` (Enum) |
| **GetActivePagePreviewBlocks**| List preview blocks. | `siteUrl` (string) |

## Backlinks
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **GetLinkCounts** | ✅ Backlink counts for pages. | `siteUrl` (string), `page` (short) |
| **GetUrlLinks** | Detailed backlinks for a URL. | `siteUrl` (string), `link` (string), `page` (short) |

## Configuration & Roles
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **GetQueryParameters** | List URL parameters handled. | `siteUrl` (string) |
| **AddQueryParameter** | Add a URL parameter. | `siteUrl` (string), `queryParameter` (string) |
| **EnableDisableQueryParameter**| Toggle a URL parameter. | `siteUrl` (string), `queryParameter` (string), `isEnabled` (boolean) |
| **GetCountryRegionSettings** | Geo-targeting settings. | `siteUrl` (string) |
| **GetSiteRoles** | List users and roles for a site. | `siteUrl` (string), `includeAllSubdomains` (boolean) |
| **AddSiteRoles** | Add a user role. | `siteUrl`, `delegatedUrl`, `userEmail`, `authCode`, etc. |

## Advanced & Partner
| Method | Description | Request Data |
| :--- | :--- | :--- |
| **FetchUrl** | Request Bing to fetch a URL. | `siteUrl` (string), `url` (string) |
| **GetFetchedUrlDetails** | Result of a URL fetch. | `siteUrl` (string), `url` (string) |
| **SubmitPartnerUrl** | Partner specific submission. | `siteUrl`, `source`, `change` |
| **SubmitPartnerUrlBatch** | Partner batch submission. | `urlList`, `source`, `change` |

---
*Note: This list is derived from the SOAP WSDL. When using the JSON API, most methods are HTTP GET or POST depending on whether they have body data. Dates should be in ISO 8601 format.*
