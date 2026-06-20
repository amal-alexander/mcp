import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBrandAnalysis } from '../../src/common/tools/compare-engines/ga4-gsc-bing-comparator.js';
import * as gscAnalytics from '../../src/google/tools/analytics.js';
import * as bingClient from '../../src/bing/client.js';
import * as ga4Analytics from '../../src/ga4/tools/analytics.js';

vi.mock('../../src/google/tools/analytics.js');
vi.mock('../../src/bing/client.js');
vi.mock('../../src/ga4/tools/analytics.js');

describe('getBrandAnalysis', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should split brand and non-brand traffic correctly', async () => {
        // Mock GSC
        vi.mocked(gscAnalytics.queryAnalytics).mockResolvedValue([
            { keys: ['brand query'], clicks: 60, impressions: 600 },
            { keys: ['other query'], clicks: 40, impressions: 400 }
        ] as any);

        // Mock Bing
        const mockBingClient = {
            getQueryStats: vi.fn().mockResolvedValue([
                { Query: 'brand query', Clicks: 30, Impressions: 300 },
                { Query: 'something else', Clicks: 70, Impressions: 700 }
            ])
        };
        vi.mocked(bingClient.getBingClient).mockResolvedValue(mockBingClient as any);

        // Mock GA4
        vi.mocked(ga4Analytics.getOrganicLandingPages).mockResolvedValue([
            { sessions: 1000 }
        ] as any);

        const brandTerms = ['brand'];
        const results = await getBrandAnalysis(brandTerms, 'gsc-url', 'bing-url', 'ga4-id', '2024-01-01', '2024-01-31');

        expect(results).toHaveLength(3);

        const googleRow = results.find(r => r.platform === 'Google');
        expect(googleRow?.brandMetrics.clicks).toBe(60);
        expect(googleRow?.nonBrandMetrics.clicks).toBe(40);
        expect(googleRow?.brandShare).toBe(0.6);

        const bingRow = results.find(r => r.platform === 'Bing');
        expect(bingRow?.brandMetrics.clicks).toBe(30);
        expect(bingRow?.nonBrandMetrics.clicks).toBe(70);
        expect(bingRow?.brandShare).toBe(0.3);

        const ga4Row = results.find(r => r.platform === 'GA4');
        expect(ga4Row?.brandMetrics.sessions).toBe(600); // 1000 * 0.6
        expect(ga4Row?.brandShare).toBe(0.6);
    });

    it('should handle failures in one platform gracefully', async () => {
        vi.mocked(gscAnalytics.queryAnalytics).mockRejectedValue(new Error('GSC Failed'));
        vi.mocked(bingClient.getBingClient).mockRejectedValue(new Error('Bing Failed'));
        vi.mocked(ga4Analytics.getOrganicLandingPages).mockResolvedValue([{ sessions: 500 }] as any);

        const results = await getBrandAnalysis(['test'], 'gsc', 'bing', 'ga4', 'start', 'end');

        expect(results).toHaveLength(3);
        expect(results.find(r => r.platform === 'GA4')?.nonBrandMetrics.sessions).toBe(500);
    });
});
