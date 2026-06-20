import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as seoInsights from '../src/bing/tools/seo-insights.js';
import * as analytics from '../src/bing/tools/analytics.js';

// Mock regex utility to avoid RE2 dependency issues in test environment
vi.mock('../src/common/utils/regex.js', () => {
    return {
        safeTest: (pattern: string, flags: string, text: string) => new RegExp(pattern, flags).test(text),
        safeTestBatch: (pattern: string, flags: string, texts: string[]) => texts.map(t => new RegExp(pattern, flags).test(t))
    };
});

// Mock analytics module directly
vi.mock('../src/bing/tools/analytics.js', () => {
    return {
        getQueryStats: vi.fn(),
        getPageStats: vi.fn(),
        getQueryPageStats: vi.fn(),
        findLowHangingFruit: vi.fn(),
        findStrikingDistance: vi.fn(),
        findLowCTROpportunities: vi.fn()
    };
});

describe('Bing SEO Insights New Features', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('findLostQueries identifies lost queries correctly', async () => {
        const siteUrl = 'http://example.com';

        (analytics.getQueryStats as any).mockImplementation((url: string, start: string, end: string) => {
             const endDate = new Date(end);
             const now = new Date();
             const diff = now.getTime() - endDate.getTime();
             const diffDays = diff / (1000 * 3600 * 24);

             // Current period is recent (endDate ~ 2 days ago)
             if (diffDays < 10) {
                 return Promise.resolve([
                     { Query: 'kept query', Clicks: 100, Impressions: 1000, AvgPosition: 1, CTR: 0.1, Date: '2023-01-01' }
                 ]);
             } else {
                 // Previous period
                 return Promise.resolve([
                     { Query: 'kept query', Clicks: 100, Impressions: 1000, AvgPosition: 1, CTR: 0.1, Date: '2022-12-01' },
                     { Query: 'lost query', Clicks: 50, Impressions: 500, AvgPosition: 2, CTR: 0.1, Date: '2022-12-01' }
                 ]);
             }
        });

        const results = await seoInsights.findLostQueries(siteUrl, { days: 28 });

        expect(results.length).toBe(1);
        expect(results[0].query).toBe('lost query');
        expect(results[0].lostClicks).toBe(50);
    });

    it('analyzeBrandVsNonBrand segments correctly', async () => {
        const rows = [
            { Query: 'brand name', Clicks: 10, Impressions: 100, AvgPosition: 1, CTR: 0.1, Date: '2023-01-01' },
            { Query: 'buy product', Clicks: 20, Impressions: 200, AvgPosition: 5, CTR: 0.1, Date: '2023-01-01' },
            { Query: 'brand support', Clicks: 5, Impressions: 50, AvgPosition: 1, CTR: 0.1, Date: '2023-01-01' }
        ];

        (analytics.getQueryStats as any).mockResolvedValue(rows);

        const results = await seoInsights.analyzeBrandVsNonBrand('http://example.com', 'brand', { days: 28 });

        const brand = results.find(r => r.segment === 'Brand');
        const nonBrand = results.find(r => r.segment === 'Non-Brand');

        expect(brand).toBeDefined();
        expect(brand!.clicks).toBe(15); // 10 + 5
        expect(brand!.queryCount).toBe(2);

        expect(nonBrand).toBeDefined();
        expect(nonBrand!.clicks).toBe(20);
        expect(nonBrand!.queryCount).toBe(1);
    });

    it('generateRecommendations calls APIs once and passes data', async () => {
        (analytics.getQueryStats as any).mockResolvedValue([]);
        (analytics.getQueryPageStats as any).mockResolvedValue([]);

        await seoInsights.generateRecommendations('http://example.com', { days: 28 });

        expect(analytics.getQueryStats).toHaveBeenCalledTimes(1);
        expect(analytics.getQueryPageStats).toHaveBeenCalledTimes(1);

        // Also verify dates are passed
        const statsCall = (analytics.getQueryStats as any).mock.calls[0];
        const pageStatsCall = (analytics.getQueryPageStats as any).mock.calls[0];

        expect(statsCall[1]).toBeDefined(); // startDate
        expect(statsCall[2]).toBeDefined(); // endDate
        expect(pageStatsCall[1]).toBeDefined(); // startDate
        expect(pageStatsCall[2]).toBeDefined(); // endDate
    });

    it('detectCannibalization uses provided rows if available', async () => {
        const rows = [
             { Query: 'cannibal', Page: 'p1', Clicks: 10, Impressions: 100, Date: '2023-01-01' },
             { Query: 'cannibal', Page: 'p2', Clicks: 10, Impressions: 100, Date: '2023-01-01' }
        ];

        // If rows are provided, getQueryPageStats should NOT be called
        await seoInsights.detectCannibalization('http://example.com', { minImpressions: 10 }, rows);

        expect(analytics.getQueryPageStats).not.toHaveBeenCalled();
    });
});
