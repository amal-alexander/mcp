import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock regex utility to avoid RE2 dependency issues in test environment
vi.mock('../src/common/utils/regex.js', () => {
    return {
        safeTest: (pattern: string, flags: string, text: string) => new RegExp(pattern, flags).test(text),
        safeTestBatch: (pattern: string, flags: string, texts: string[]) => texts.map(t => new RegExp(pattern, flags).test(t))
    };
});

import {
    getPageStats,
    getPageQueryStats,
    getQueryPageStats,
    getRankAndTrafficStats,
    comparePeriods,
    detectAnomalies
} from '../src/bing/tools/analytics.js';
import { healthCheck } from '../src/bing/tools/sites-health.js';
import {
    findLowHangingFruit,
    findStrikingDistance,
    findLowCTROpportunities,
    generateRecommendations
} from '../src/bing/tools/seo-insights.js';
import * as bingSites from '../src/bing/tools/sites.js';

const fetch = vi.fn();
global.fetch = fetch as any;

describe('Bing Advanced Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.BING_API_KEY = 'test-api-key';
    });

    describe('Analytics Advanced', () => {
        it('should get page stats', async () => {
            const mockPageStats = [{ Page: 'https://example.com/p1', Clicks: 50, Impressions: 500 }];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockPageStats }),
            });

            const result = await getPageStats('https://example.com');
            expect(result).toEqual(mockPageStats);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetPageStats'), expect.any(Object));
        });

        it('should get page query stats', async () => {
            const mockStats = [{ Query: 'q1', Clicks: 5 }];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockStats }),
            });

            const result = await getPageQueryStats('https://example.com', 'https://example.com/p1');
            expect(result).toEqual(mockStats);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetPageQueryStats'), expect.any(Object));
        });

        it('should compare periods', async () => {
            const mockRankStats = [
                { Date: '2023-01-01', Clicks: 10, Impressions: 100, AvgPosition: 5 },
                { Date: '2023-01-02', Clicks: 20, Impressions: 200, AvgPosition: 4 },
                { Date: '2022-12-25', Clicks: 10, Impressions: 100, AvgPosition: 6 },
            ];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockRankStats }),
            });

            const result = await comparePeriods(
                'https://example.com',
                '2023-01-01', '2023-01-02',
                '2022-12-25', '2022-12-25'
            );

            expect(result.changes.clicks).toBe(20); // (10+20) - 10 = 20
            expect(result.changes.clicksPercent).toBe(200);
        });

        it('should detect anomalies', async () => {
            const mockRankStats = [
                { Date: '2023-01-01', Clicks: 100, Impressions: 1000, AvgPosition: 5 },
                { Date: '2023-01-02', Clicks: 10, Impressions: 1000, AvgPosition: 5 }, // Huge drop
                { Date: '2023-01-03', Clicks: 10, Impressions: 1000, AvgPosition: 5 },
                { Date: '2023-01-04', Clicks: 10, Impressions: 1000, AvgPosition: 5 },
                { Date: '2023-01-05', Clicks: 10, Impressions: 1000, AvgPosition: 5 },
            ];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockRankStats }),
            });

            const anomalies = await detectAnomalies('https://example.com');
            expect(anomalies.length).toBeGreaterThan(0);
            expect(anomalies[0].type).toBe('drop');
        });
    });

    describe('SEO Insights', () => {
        it('should find low-hanging fruit', async () => {
            const mockQueryStats = [
                { Query: 'easy win', Clicks: 10, Impressions: 1000, AvgPosition: 8, CTR: 0.01 }
            ];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockQueryStats }),
            });

            const results = await findLowHangingFruit('https://example.com');
            expect(results.length).toBe(1);
            expect(results[0].query).toBe('easy win');
            expect(results[0].potentialClicks).toBeGreaterThan(0);
        });

        it('should generate recommendations', async () => {
            const d = new Date();
            d.setDate(d.getDate() - 5);
            const dateStr = d.toISOString().split('T')[0];
            const mockQueryStats = [
                { Query: 'keyword 1', Clicks: 10, Impressions: 1000, AvgPosition: 12, CTR: 0.01, Date: dateStr },
                { Query: 'keyword 2', Clicks: 10, Impressions: 1000, AvgPosition: 2, CTR: 0.001, Date: dateStr } // Low CTR
            ];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockQueryStats }),
            });

            const recs = await generateRecommendations('https://example.com');
            expect(recs.length).toBeGreaterThan(0);
        });
    });

    describe('Health Check', () => {
        it('should perform a health check for a site and detect issues', async () => {
            (fetch as any).mockImplementation((url: string) => {
                if (url.includes('GetSitemaps')) return Promise.resolve({ ok: true, json: async () => ({ d: [] }) }); // Trigger "No sitemaps" issue
                if (url.includes('GetRankAndTrafficStats')) return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        d: [
                            { Date: '2023-01-01', Clicks: 100, Impressions: 1000, AvgPosition: 5 },
                            { Date: '2022-12-01', Clicks: 200, Impressions: 2000, AvgPosition: 5 } // Trigger "Critical traffic drop"
                        ]
                    })
                });
                if (url.includes('GetCrawlIssues')) return Promise.resolve({ ok: true, json: async () => ({ d: [{ Url: 'err', IssueType: '404' }] }) });
                if (url.includes('GetCrawlStats')) return Promise.resolve({ ok: true, json: async () => ({ d: [{ CrawlErrors: 5 }] }) });
                return Promise.resolve({ ok: true, json: async () => ({ d: [] }) });
            });

            const reports = await healthCheck('https://example.com');
            expect(reports.length).toBe(1);
            expect(reports[0].status).toBe('critical');
            expect(reports[0].issues).toContain('No sitemaps submitted to Bing');
            expect(reports[0].issues).toContain('1 crawl issues detected by Bing');
        });

        it('should health check all sites if none specified', async () => {
            vi.spyOn(bingSites, 'listSites').mockResolvedValue([{ Url: 'https://site1.com', State: 'Verified', Role: 'Owner' }]);

            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: [] }),
            });

            const reports = await healthCheck();
            expect(reports.length).toBe(1);
            expect(reports[0].siteUrl).toBe('https://site1.com');
        });

        it('should return empty array if no sites found', async () => {
            vi.spyOn(bingSites, 'listSites').mockResolvedValue([]);
            const reports = await healthCheck();
            expect(reports).toEqual([]);
        });
    });

    describe('Missing Tools', () => {
        it('should test sitemaps.submitSitemap', async () => {
            const { submitSitemap } = await import('../src/bing/tools/sitemaps.js');
            (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ d: null }) });
            const result = await submitSitemap('https://site.com', 'https://site.com/sitemap.xml');
            expect(result).toContain('Successfully submitted sitemap');
        });

        it('should test inspection.getUrlInfo', async () => {
            const { getUrlInfo } = await import('../src/bing/tools/inspection.js');
            const mockInfo = { Url: 'https://site.com/p1', Status: 'Indexed' };
            (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ d: mockInfo }) });
            const result = await getUrlInfo('https://site.com', 'https://site.com/p1');
            expect(result).toEqual(mockInfo);
        });

        it('should test links.getLinkCounts', async () => {
            const { getLinkCounts } = await import('../src/bing/tools/links.js');
            const mockLinks = [{ Url: 'site.com', Count: 10 }];
            (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ d: mockLinks }) });
            const result = await getLinkCounts('https://site.com');
            expect(result).toEqual(mockLinks);
        });

        it('should test keywords.getRelatedKeywords', async () => {
            const { getRelatedKeywords } = await import('../src/bing/tools/keywords.js');
            const mockKws = [{ Keyword: 'related', Score: 100 }];
            (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ d: mockKws }) });
            const result = await getRelatedKeywords('seed');
            expect(result).toEqual(mockKws);
        });
    });
});
