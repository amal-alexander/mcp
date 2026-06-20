import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOpportunityMatrix } from '../../src/common/tools/compare-engines/ga4-gsc-bing-comparator.js';
import * as gscAnalytics from '../../src/google/tools/analytics.js';
import * as bingClient from '../../src/bing/client.js';
import * as ga4Analytics from '../../src/ga4/tools/analytics.js';

vi.mock('../../src/google/tools/analytics.js');
vi.mock('../../src/bing/client.js');
vi.mock('../../src/ga4/tools/analytics.js');

describe('getOpportunityMatrix', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should identify quick wins and prioritize correctly', async () => {
        // GSC: Pos 12, High Impressions
        vi.mocked(gscAnalytics.queryAnalytics).mockResolvedValue([
            { keys: ['https://example.com/page1'], clicks: 10, impressions: 2000, ctr: 0.005, position: 12 }
        ] as any);

        // Bing: Pos 5 (Better than GSC)
        const mockBingClient = {
            getPageStats: vi.fn().mockResolvedValue([
                { Query: 'https://example.com/page1', Clicks: 50, Impressions: 1000, CTR: 0.05, AvgPosition: 5 }
            ])
        };
        vi.mocked(bingClient.getBingClient).mockResolvedValue(mockBingClient as any);

        // GA4: High Engagement
        vi.mocked(ga4Analytics.getOrganicLandingPages).mockResolvedValue([
            { landingPagePlusQueryString: '/page1', sessions: 100, engagementRate: 0.8, bounceRate: 0.1 }
        ] as any);

        const results = await getOpportunityMatrix('https://example.com', 'https://example.com', '123', 'start', 'end');

        expect(results).toHaveLength(1);
        expect(results[0].category).toBe('Quick Win');
        expect(results[0].priorityScore).toBeGreaterThan(80);
    });

    it('should handle missing platform data', async () => {
        vi.mocked(gscAnalytics.queryAnalytics).mockResolvedValue([
            { keys: ['https://example.com/page1'], clicks: 10, impressions: 100 }
        ] as any);
        vi.mocked(bingClient.getBingClient).mockRejectedValue(new Error('Bing down'));
        vi.mocked(ga4Analytics.getOrganicLandingPages).mockResolvedValue([] as any);

        const results = await getOpportunityMatrix('https://example.com', 'https://example.com', '123', 'start', 'end');

        expect(results).toHaveLength(1);
        expect(results[0].priorityScore).toBe(1); // 10 / 10
    });
});
