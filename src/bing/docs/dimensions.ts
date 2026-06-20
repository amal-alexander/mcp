/**
 * Bing Webmaster Tools - Dimensions Reference
 * 
 * This documentation is exposed as an MCP resource for AI agents.
 */

export const dimensionsDocs = `# Bing Webmaster Tools - Dimensions Reference

Unlike Google Search Console's single query endpoint, Bing Webmaster Tools API separates data into specific endpoints based on the primary dimension.

## Implicit Dimensions via Tools

| Tool | Primary Dimension | Secondary Dimensions |
|------|-------------------|----------------------|
| \`bing_analytics_query\` | **Query** | Date (implicit in daily options) |
| \`bing_analytics_page\` | **Page** | Date |
| \`bing_rank_traffic_stats\` | **Date** | None (Site level agg) |
| \`bing_keywords_stats\` | **Keyword** | Country, Language, Date |

## Usage

### To Analyze Queries
Use \`bing_analytics_query\` or \`bing_get_top_queries\`. You cannot "group by page" here.

### To Analyze Pages
Use \`bing_analytics_page\` or \`bing_get_top_pages\`.

### To Analyze Date Trends
Use \`bing_rank_traffic_stats\` or the advanced \`bing_analytics_time_series\` tool.

### To Analyze Specific Page's Queries
Use \`bing_analytics_page_query\`:
\`\`\`json
{
  "siteUrl": "https://example.com",
  "pageUrl": "https://example.com/my-page"
}
\`\`\`

## Advanced Time Series Dimensions
The \`bing_analytics_time_series\` tool allows analyzing trends with granular data, primarily focused on **Date** as the dimension, but data is derived from the site-level rank and traffic stats.
`;

export default dimensionsDocs;
