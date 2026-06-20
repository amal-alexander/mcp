
export const algorithmUpdatesDocs = `
# Bing Algorithm Updates & Volatility Reference

The \`bing_analytics_drop_attribution\` tool correlates traffic drops with major known Bing Algorithm Updates and periods of high ranking volatility. The following updates are currently tracked:

## 2025 (Projected)

| Date | Update Name | Impact Area |
|------|-------------|-------------|
| 2025-01-15 | Projected AI Relevance Update | AI Search / Relevance |

## 2024

| Date | Update Name | Impact Area |
|------|-------------|-------------|
| 2024-07-25 | Bing Generative Search (Beta) | SERP Layout / AI Summaries |
| 2024-05-29 | May 2024 Ranking Volatility | General Ranking |
| 2024-03-01 | Bing Deep Search Rollout | Complex Queries / Relevance |

## 2023

| Date | Update Name | Impact Area |
|------|-------------|-------------|
| 2023-05-04 | Bing Chat Open Preview | Conversational Search |
| 2023-02-07 | New Bing Preview (AI Chat) | AI Integration |
| 2023-01-18 | Bing AI Integration Update | Core Ranking / AI |

## How Attribution Works
When a traffic drop is detected, the system checks if it occurred within **+/- 2 days** of any of these dates. If it matches, the update is flagged as a potential primary cause of the drop.
`;

export default algorithmUpdatesDocs;
