import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzePagesCrossPlatform } from '../src/common/tools/compare-engines/ga4-gsc-comparator.js';
import * as gscAnalytics from '../src/google/tools/analytics.js';
import * as ga4Analytics from '../src/ga4/tools/analytics.js';

// Mock dependencies
vi.mock('../src/google/tools/analytics.js', () => ({
    queryAnalytics: vi.fn()
}));

vi.mock('../src/ga4/tools/analytics.js', () => ({
    getOrganicLandingPages: vi.fn(),
    getTrafficSources: vi.fn()
}));

describe('Cross Platform', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('analyzePagesCrossPlatform should join GSC and GA4 data', async () => {
        (gscAnalytics.queryAnalytics as any).mockResolvedValue([
            { keys: ['https://example.com/page1'], clicks: 100, impressions: 1000, ctr: 0.1, position: 5 }
        ]);

        (ga4Analytics.getOrganicLandingPages as any).mockResolvedValue([
            { landingPagePlusQueryString: '/page1', sessions: 200, conversions: 10, engagementRate: 0.5 }
        ]);

        const results = await analyzePagesCrossPlatform('https://example.com', '123', '2023-01-01', '2023-01-31');

        expect(results.length).toBe(1);
        expect(results[0].url).toBe('https://example.com/page1');
        expect(results[0].gsc?.clicks).toBe(100);
        expect(results[0].ga4?.sessions).toBe(200);
        // Ratio = 200 / 100 = 2
        expect(results[0].clickToSessionRatio).toBe(2);
    });
});
