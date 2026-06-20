/**
 * Google Search Console - Dimensions Reference
 * 
 * This documentation is exposed as an MCP resource for AI agents.
 */

export const dimensionsDocs = `# Google Search Console - Dimensions Reference

Dimensions are used to group your Search Analytics data. You can specify one or more dimensions in the \`dimensions\` array.

## Available Dimensions

| Dimension | Description |
|-----------|-------------|
| \`query\` | The search query that triggered the impression. Only available for web search. |
| \`page\` | The final URL after any redirects. |
| \`country\` | The country from which the search was made (ISO 3166-1 alpha-3 format, e.g., "USA", "GBR"). |
| \`device\` | The device type: "DESKTOP", "MOBILE", or "TABLET". |
| \`date\` | The date of the search in YYYY-MM-DD format. |
| \`searchAppearance\` | How the result appeared in search (e.g., "RICH_RESULT", "VIDEO", "FAQ_RICH_RESULT"). |

## Using Dimensions

### Single Dimension
Get clicks grouped by query:
\`\`\`json
{
  "siteUrl": "https://example.com",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dimensions": ["query"]
}
\`\`\`

### Multiple Dimensions
Get clicks grouped by query AND page:
\`\`\`json
{
  "dimensions": ["query", "page"]
}
\`\`\`

The results will have a \`keys\` array matching the order of dimensions:
\`\`\`json
{
  "keys": ["best coffee", "https://example.com/coffee-guide"],
  "clicks": 150,
  "impressions": 2000
}
\`\`\`

### Date Dimension
When using the \`date\` dimension, data is returned per day:
\`\`\`json
{
  "dimensions": ["date"],
  "startDate": "2024-01-01",
  "endDate": "2024-01-07"
}
\`\`\`

## Important Notes

1. **Query dimension is limited** - Only available for web search type, not for image/video/news.
2. **Anonymized queries** - Low-volume queries may be hidden for privacy reasons.
3. **searchAppearance values** - Include: INSTANT_APP, AMP_BLUE_LINK, AMP_TOP_STORIES, RICH_RESULT, VIDEO, WEB_STORY, etc.
4. **Country codes** - Use 3-letter ISO codes (USA, GBR, DEU, FRA, JPN, etc.)
`;

export default dimensionsDocs;
