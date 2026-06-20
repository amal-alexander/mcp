import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSearchConsoleClient } from './mocks';
import {
    findLowCTROpportunities,
    findStrikingDistance,
    findLostQueries,
    detectCannibalization,
    analyzeBrandVsNonBrand,
    findQuickWins,
    generateRecommendations,
    findLowHangingFruit
} from '../src/google/tools/seo-insights';
import { clearAnalyticsCache } from '../src/google/tools/analytics';

describe('SEO Insights Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearAnalyticsCache();
    });

    describe('findLowCTROpportunities', () => {
        it('should return queries with high impressions and low CTR', async () => {
            const mockRows = [
                // Good CTR (should be ignored)
                { keys: ['good query', 'page1'], clicks: 50, impressions: 500, ctr: 0.1, position: 3 },
                // Low CTR (should be included) - Pos 3 benchmark is 0.10, actual 0.01 < 0.06
                { keys: ['bad query 1', 'page2'], clicks: 5, impressions: 600, ctr: 0.008, position: 3 },
                { keys: ['bad query 2', 'page3'], clicks: 5, impressions: 800, ctr: 0.006, position: 3 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows: mockRows }
            });

            const result = await findLowCTROpportunities('https://example.com', { minImpressions: 400 });

            expect(result.length).toBe(2);
            expect(result[0].query).toBe('bad query 2'); // Sorted by impressions
        });
    });

    describe('findStrikingDistance', () => {
        it('should return queries in position 8-15', async () => {
            const mockRows = [
                { keys: ['pos 5', 'p1'], position: 5, impressions: 100 },
                { keys: ['pos 10', 'p2'], position: 10, impressions: 100 },
                { keys: ['pos 15', 'p3'], position: 15, impressions: 100 },
                { keys: ['pos 20', 'p4'], position: 20, impressions: 100 },
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows: mockRows }
            });

            const result = await findStrikingDistance('https://example.com');

            expect(result.length).toBe(2);
            expect(result.map(r => r.query)).toContain('pos 10');
            expect(result.map(r => r.query)).toContain('pos 15');
        });
    });

    describe('findLostQueries', () => {
        it('should identify queries that lost significant traffic', async () => {
            // Mock two calls: current period and previous period
            mockSearchConsoleClient.searchanalytics.query
                // Current period (lost query has 0 clicks)
                .mockResolvedValueOnce({
                    data: {
                        rows: [
                            { keys: ['retained query', 'p1'], clicks: 100, impressions: 1000 }
                        ]
                    }
                })
                // Previous period (lost queries had clicks)
                .mockResolvedValueOnce({
                    data: {
                        rows: [
                            { keys: ['retained query', 'p1'], clicks: 100, impressions: 1000 },
                            { keys: ['lost query 1', 'p2'], clicks: 100, impressions: 1000 },
                            { keys: ['lost query 2', 'p3'], clicks: 200, impressions: 1000 }
                        ]
                    }
                });

            const result = await findLostQueries('https://example.com');

            expect(result.length).toBe(2);
            expect(result[0].query).toBe('lost query 2'); // Sorted by lost clicks
        });
    });

    describe('detectCannibalization', () => {
        it('should detect when traffic is split between pages', async () => {
            const mockRows = [
                { keys: ['cannibal 1', 'page1'], clicks: 60, impressions: 1000, position: 5 },
                { keys: ['cannibal 1', 'page2'], clicks: 40, impressions: 1000, position: 6 },
                { keys: ['cannibal 2', 'page3'], clicks: 100, impressions: 1000, position: 5 },
                { keys: ['cannibal 2', 'page4'], clicks: 100, impressions: 1000, position: 6 },
                { keys: ['normal query', 'page5'], clicks: 100, impressions: 1000, position: 1 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows: mockRows }
            });

            const result = await detectCannibalization('https://example.com');

            expect(result.length).toBe(2);
            expect(result[0].query).toBe('cannibal 2'); // Impact: 200*0.5=100 vs 100*0.48=48
        });
    });

    describe('analyzeBrandVsNonBrand', () => {
        it('should segment traffic based on brand regex', async () => {
            const mockRows = [
                { keys: ['acme brand'], clicks: 100, impressions: 1000 },
                { keys: ['buy widget'], clicks: 50, impressions: 500 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows: mockRows }
            });

            const result = await analyzeBrandVsNonBrand('https://example.com', 'acme');

            expect(result.length).toBe(2);
            const brand = result.find(r => r.segment === 'Brand');
            const nonBrand = result.find(r => r.segment === 'Non-Brand');

            expect(brand?.clicks).toBe(100);
            expect(nonBrand?.clicks).toBe(50);
        });
    });

    describe('findQuickWins', () => {
        it('should find pages with ranking potential on page 2', async () => {
            const mockRows = [
                // Page 2, decent impressions (Quick Win)
                { keys: ['page1', 'query1'], clicks: 50, impressions: 500, position: 12 },
                { keys: ['page4', 'query4'], clicks: 50, impressions: 1000, position: 12 },
                // Page 1 (Already won)
                { keys: ['page2', 'query2'], clicks: 100, impressions: 1000, position: 3 },
                // Page 2, low impressions (Ignore)
                { keys: ['page3', 'query3'], clicks: 1, impressions: 10, position: 15 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows: mockRows }
            });

            const result = await findQuickWins('https://example.com', { minImpressions: 400 });

            expect(result.length).toBe(2);
            expect(result[0].query).toBe('query4'); // Higher impressions -> higher potential
        });
    });

    describe('findLowHangingFruit', () => {
        it('should find keywords with potential', async () => {
            const mockRows = [
                { keys: ['fruit 1'], position: 6, impressions: 1000, clicks: 10 },
                { keys: ['fruit 2'], position: 6, impressions: 2000, clicks: 10 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows: mockRows }
            });

            const result = await findLowHangingFruit('https://example.com');
            expect(result.length).toBe(2);
            expect(result[0].query).toBe('fruit 2'); // Sorted by potential clicks
        });
    });

    describe('generateRecommendations', () => {
        it('should generate a list of insights', async () => {
            // Mock response for the single call
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValueOnce({
                data: {
                    rows: [
                        // lowHangingFruit
                        { keys: ['fruit', 'p1'], position: 6, impressions: 2000, clicks: 100 },
                        // quickWins (page2, win) - Note: keys are [query, page] because of generateRecommendations request
                        { keys: ['win', 'page2'], position: 12, impressions: 1000, clicks: 50 }
                    ]
                }
            });

            const result = await generateRecommendations('https://example.com');

            expect(result.length).toBeGreaterThan(0);
            const opportunities = result.filter(i => i.type === 'opportunity');
            expect(opportunities.length).toBeGreaterThan(0);
            expect(result[0].priority).toBeDefined();
        });

        it('should report cannibalization issues', async () => {
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['conflict', 'p1'], position: 5, impressions: 1000, clicks: 50 },
                        { keys: ['conflict', 'p2'], position: 6, impressions: 1000, clicks: 50 }
                    ]
                }
            });

            const result = await generateRecommendations('https://example.com');
            const warning = result.find(i => i.type === 'warning');
            expect(warning).toBeDefined();
            expect(warning?.title).toContain('cannibalization issues');
        });
    });
});


