/**
 * Google Search Console - Search Types Reference
 * 
 * This documentation is exposed as an MCP resource for AI agents.
 */

export const searchTypesDocs = `# Google Search Console - Search Types Reference

Search types specify which Google search property to query data from.

## Available Search Types

| Type | Description |
|------|-------------|
| \`web\` | Standard Google web search results (default) |
| \`image\` | Google Images search results |
| \`video\` | Google video search results |
| \`news\` | Google News search results |
| \`discover\` | Google Discover feed impressions |
| \`googleNews\` | Google News app and news.google.com |

## Usage

Specify the search type in your query:
\`\`\`json
{
  "siteUrl": "https://example.com",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "type": "image"
}
\`\`\`

## Type-Specific Notes

### Web (default)
- Most comprehensive data
- Includes all dimension options
- Query data available

### Image
- For sites with image content
- Query dimension available
- Shows how images rank in Google Images

### Video
- For video content
- Includes YouTube embeds and hosted videos
- Query dimension available

### News
- For news publishers
- Requires being in Google News
- Query dimension available

### Discover
- Shows Discover feed performance
- **Query dimension NOT available** (Discover has no queries)
- Good for understanding content discovery

### Google News
- Similar to News but specifically for news.google.com
- Query dimension available

## Example: Compare Web vs Image Performance

Query web traffic:
\`\`\`json
{
  "type": "web",
  "dimensions": ["page"],
  "limit": 10
}
\`\`\`

Query image traffic:
\`\`\`json
{
  "type": "image",
  "dimensions": ["page"],
  "limit": 10
}
\`\`\`

## Important Notes

1. **Default is web** - If not specified, type defaults to "web".
2. **Discover has no queries** - You cannot use query dimension with Discover.
3. **Different date ranges** - Some types may have different data availability windows.
4. **Separate data** - Each type's data is independent; a page can have web + image impressions.
`;

export default searchTypesDocs;
