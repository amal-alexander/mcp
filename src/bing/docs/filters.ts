/**
 * Bing Webmaster Tools - Filters Reference
 * 
 * This documentation is exposed as an MCP resource for AI agents.
 */

export const filtersDocs = `# Bing Webmaster Tools - Filters Reference

Filtering in Bing Webmaster Tools API is often done by selecting the specific tool or argument rather than a generic filter object.

## Tool-Specific Filtering

### Filter by Page
To get data for a specific page, use \`bing_analytics_page_query\` instead of a generic query tool.
\`\`\`json
{
  "tool": "bing_analytics_page_query",
  "siteUrl": "https://example.com",
  "pageUrl": "https://example.com/specific-page"
}
\`\`\`

### Filter by Keyword/Query
To looks up a specific keyword's history, use \`bing_keywords_stats\`:
\`\`\`json
{
  "tool": "bing_keywords_stats",
  "q": "search term",
  "country": "us",
  "language": "en"
}
\`\`\`

## Advanced Analytics Filtering

The \`bing_analytics_time_series\` tool supports rudimentary client-side filtering on the returned dataset.

| Field | Operator | Description |
|-------|----------|-------------|
| \`dimension\` | \`equals\`, \`contains\` | limited support (mostly for future expansion) |

_Note: The Bing API limits server-side filtering compared to Google. Most specific analysis requires fetching the relevant dataset (Queries or Pages) and processing it._
`;

export default filtersDocs;
