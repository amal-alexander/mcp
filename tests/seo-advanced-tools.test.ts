import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSearchConsoleClient } from './mocks';
import { clusterKeywords, classifyKeywordIntent } from '../src/google/tools/seo-insights';
import { clearAnalyticsCache } from '../src/google/tools/analytics';

describe('Advanced SEO Intelligence Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearAnalyticsCache();
    });

    describe('clusterKeywords', () => {
        it('should cluster search console queries based on token overlap', async () => {
            const mockRows = [
                { keys: ['buy running shoes'], clicks: 10, impressions: 100, position: 2 },
                { keys: ['best running shoes'], clicks: 5, impressions: 50, position: 3 },
                { keys: ['blue water bottle'], clicks: 1, impressions: 10, position: 5 },
                { keys: ['red water bottle'], clicks: 2, impressions: 20, position: 4 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows: mockRows }
            });

            const result = await clusterKeywords('https://example.com', { minImpressions: 5 });

            expect(result.length).toBeGreaterThan(0);

            // All shoe queries should be grouped in a cluster sharing a common token
            const shoeQueries = ['buy running shoes', 'best running shoes'];
            const shoeCluster = result.find(c =>
                shoeQueries.every(q => c.queries.includes(q)) ||
                shoeQueries.some(q => c.queries.includes(q))
            );
            expect(shoeCluster).toBeDefined();

            // All bottle queries should appear somewhere in results
            const allQueriesInClusters = result.flatMap(c => c.queries);
            expect(allQueriesInClusters).toContain('buy running shoes');
            expect(allQueriesInClusters).toContain('best running shoes');
            expect(allQueriesInClusters).toContain('blue water bottle');
            expect(allQueriesInClusters).toContain('red water bottle');

            // Totals should add up to source data
            const totalClicks = result.reduce((sum, c) => sum + c.clicks, 0);
            const totalImpressions = result.reduce((sum, c) => sum + c.impressions, 0);
            expect(totalClicks).toBe(18);
            expect(totalImpressions).toBe(180);
        });

        it('should cluster custom queries if provided', async () => {
            const custom = [
                { query: 'react mcp server', clicks: 100, impressions: 1000, position: 1 },
                { query: 'node mcp server', clicks: 50, impressions: 500, position: 2 },
                { query: 'other query', clicks: 1, impressions: 10, position: 5 }
            ];

            const result = await clusterKeywords('https://example.com', {}, custom);

            expect(result.length).toBeGreaterThan(0);
            const mcpCluster = result.find(c => c.name === 'mcp');
            expect(mcpCluster).toBeDefined();
            expect(mcpCluster?.queries).toContain('react mcp server');
            expect(mcpCluster?.queries).toContain('node mcp server');
            expect(mcpCluster?.impressions).toBe(1500);
        });
    });

    describe('classifyKeywordIntent', () => {
        it('should classify queries into intent categories', async () => {
            const mockRows = [
                { keys: ['how to use search console mcp'], clicks: 10, impressions: 100, position: 2 },
                { keys: ['best mcp server alternative'], clicks: 5, impressions: 50, position: 3 },
                { keys: ['buy mcp server setup'], clicks: 2, impressions: 20, position: 4 },
                { keys: ['mybrand login'], clicks: 80, impressions: 800, position: 1 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows: mockRows }
            });

            const result = await classifyKeywordIntent('https://example.com', { brandRegex: 'mybrand' });

            const info = result.find(r => r.intent === 'Informational');
            const comm = result.find(r => r.intent === 'Commercial');
            const trans = result.find(r => r.intent === 'Transactional');
            const nav = result.find(r => r.intent === 'Navigational');

            expect(info).toBeDefined();
            expect(info?.clicks).toBe(10);
            expect(comm?.clicks).toBe(5);
            expect(trans?.clicks).toBe(2);
            expect(nav?.clicks).toBe(80);
        });
    });
});
