import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as advancedAnalytics from '../src/bing/tools/advanced-analytics.js';
import * as analytics from '../src/bing/tools/analytics.js';
import { BingClient } from '../src/bing/client.js';

// Mock getBingClient
vi.mock('../src/bing/client.js', async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        getBingClient: vi.fn(),
    };
});

// Import after mocking
import { getBingClient } from '../src/bing/client.js';

describe('Bing Logic Tests', () => {
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            getRankAndTrafficStats: vi.fn(),
            getQueryStats: vi.fn(),
        };
        (getBingClient as any).mockResolvedValue(mockClient);
    });

    it('advancedAnalytics.getTimeSeriesInsights - weekly aggregation', async () => {
        // Mock data: 2 weeks. Week 1: Mon-Sun. Week 2: Mon-Sun.
        // 2023-01-02 is Monday.
        const rows = [
            // Week 1
            { Date: '2023-01-02', Clicks: 10, Impressions: 100, AvgPosition: 1, CTR: 0.1 },
            { Date: '2023-01-03', Clicks: 20, Impressions: 200, AvgPosition: 2, CTR: 0.1 }, // WAvg Pos: (1*100 + 2*200)/300 = 500/300 = 1.666
            // Week 2
            { Date: '2023-01-09', Clicks: 5, Impressions: 50, AvgPosition: 10, CTR: 0.1 },
            { Date: '2023-01-10', Clicks: 5, Impressions: 50, AvgPosition: 20, CTR: 0.1 }, // WAvg Pos: (10*50 + 20*50)/100 = 1500/100 = 15
        ];

        mockClient.getRankAndTrafficStats.mockResolvedValue(rows);

        const result = await advancedAnalytics.getTimeSeriesInsights('http://example.com', {
            granularity: 'weekly',
            metrics: ['clicks', 'impressions', 'position', 'ctr'],
            days: 14 // enough to cover
        });

        const history = result.history;
        expect(history.length).toBe(2);

        // Week 1 (Starting 2023-01-02)
        const w1 = history[0];
        expect(w1.week).toBe('2023-01-02');
        expect(w1.metrics.clicks).toBe(30);
        expect(w1.metrics.impressions).toBe(300);
        expect(w1.metrics.ctr).toBeCloseTo(30/300, 2);
        expect(w1.metrics.position).toBeCloseTo(1.67, 2);

        // Week 2 (Starting 2023-01-09)
        const w2 = history[1];
        expect(w2.week).toBe('2023-01-09');
        expect(w2.metrics.clicks).toBe(10);
        expect(w2.metrics.impressions).toBe(100);
        expect(w2.metrics.ctr).toBeCloseTo(10/100, 2);
        expect(w2.metrics.position).toBeCloseTo(15.00, 2);
    });

    it('analytics.comparePeriods - weighted average position', async () => {
        // Period 1: 2023-01-01 to 2023-01-02
        // Period 2: 2022-12-25 to 2022-12-26

        const rows = [
            // Period 2
            { Date: '2022-12-25', Clicks: 10, Impressions: 100, AvgPosition: 10 },
            { Date: '2022-12-26', Clicks: 10, Impressions: 100, AvgPosition: 20 }, // Avg: 15
            // Period 1
            { Date: '2023-01-01', Clicks: 20, Impressions: 200, AvgPosition: 5 },
            { Date: '2023-01-02', Clicks: 20, Impressions: 200, AvgPosition: 5 }, // Avg: 5
        ];

        mockClient.getRankAndTrafficStats.mockResolvedValue(rows);

        const result = await analytics.comparePeriods(
            'http://example.com',
            '2023-01-01', '2023-01-02',
            '2022-12-25', '2022-12-26'
        );

        expect(result.period1.position).toBe(5);
        expect(result.period2.position).toBe(15);
        expect(result.changes.position).toBe(-10); // 5 - 15 = -10
        expect(result.changes.positionPercent).toBeCloseTo(((5 - 15)/15)*100, 2); // -66.67%
    });
});
