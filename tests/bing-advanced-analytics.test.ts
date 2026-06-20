import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeDropAttribution, getTimeSeriesInsights } from '../src/bing/tools/advanced-analytics.js';
import * as analytics from '../src/bing/tools/analytics.js';

// Mock undici fetch not needed if we mock the analytics functions directly
vi.mock('undici', () => ({
    fetch: vi.fn(),
}));

describe('Bing Advanced Analytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.BING_API_KEY = 'test-api-key';
    });

    describe('analyzeDropAttribution', () => {
        it('should return null if no drop is found', async () => {
            vi.spyOn(analytics, 'detectAnomalies').mockResolvedValue([]);
            const result = await analyzeDropAttribution('https://example.com');
            expect(result).toBeNull();
        });

        it('should attribute a drop given anomalies', async () => {
            // Mock detectAnomalies to return a drop
            vi.spyOn(analytics, 'detectAnomalies').mockResolvedValue([
                {
                    date: '2023-01-10',
                    type: 'drop',
                    metric: 'clicks',
                    value: 50,
                    previousValue: 100,
                    changePercent: -50
                }
            ]);

            const result = await analyzeDropAttribution('https://example.com');

            expect(result).not.toBeNull();
            expect(result?.date).toBe('2023-01-10');
            expect(result?.totalDrop).toBe(-50);
            expect(result?.primaryCause).toContain('Device breakdown unavailable');
        });
    });

    describe('getTimeSeriesInsights', () => {
        it('should get history and report forecast', async () => {
            // Mock getRankAndTrafficStats to return some data
            const mockStats = [
                { Date: '2023-01-01', Clicks: 10, Impressions: 100, AvgPosition: 5 },
                { Date: '2023-01-02', Clicks: 20, Impressions: 200, AvgPosition: 4 },
                { Date: '2023-01-03', Clicks: 30, Impressions: 300, AvgPosition: 3 },
                { Date: '2023-01-04', Clicks: 40, Impressions: 400, AvgPosition: 2 },
                { Date: '2023-01-05', Clicks: 50, Impressions: 500, AvgPosition: 1 }
            ];
            vi.spyOn(analytics, 'getRankAndTrafficStats').mockResolvedValue(mockStats as any);

            const result = await getTimeSeriesInsights('https://example.com', { days: 5, metrics: ['clicks'] });

            expect(result.history).toHaveLength(5);
            expect(result.history[0].metrics.clicks).toBe(10);

            // Check forecast (simple linear trend up)
            expect(result.forecast.currentTrend).toBe('up');
            expect(result.forecast.forecastedValues['clicks'].length).toBeGreaterThan(0);
            // The next value should be roughly 60
            expect(result.forecast.forecastedValues['clicks'][0]).toBeGreaterThan(50);
        });
    });
});
