/**
 * Bing Webmaster Tools - Search Types Reference
 * 
 * This documentation is exposed as an MCP resource for AI agents.
 */

export const searchTypesDocs = `# Bing Webmaster Tools - Search Types Reference

Bing Webmaster Tools API primarily provides data for **Web** search.

## Unified Data
Unlike Google Search Console which explicitly separates "Web", "Image", "Video", and "News" into distinct search types for every query, Bing's standard performance APIs (\`GetQueryStats\`, \`GetPageStats\`) return unified performance data.

## Keyword Research Types
When using \`bing_keywords_stats\`, you can filter by:
- **Country**: (e.g., 'us', 'gb', 'in')
- **Language**: (e.g., 'en-US', 'en-GB')

## Future Support
If Bing APIs expose explicit filtering for Image/Video verticals in the future, this documentation will be updated to reflect those capabilities.
`;

export default searchTypesDocs;
