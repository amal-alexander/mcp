
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSearchConsoleClient } from './mocks';
import { analyzeDropAttribution, getTimeSeriesInsights } from '../src/google/tools/advanced-analytics';
import { clearAnalyticsCache } from '../src/google/tools/analytics';

describe('Advanced Analytics V2 (Attribution & Time Series)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearAnalyticsCache();
    });

    describe('analyzeDropAttribution', () => {
        it('should identify a drop and attribute it to mobile', async () => {
            // Baseline rows (20 days of 100 clicks)
            const baselineRows = Array(20).fill({ keys: ['2025-01-XX'], clicks: 100 });
            // The drop day
            baselineRows.push({ keys: ['2025-01-21'], clicks: 10 });

            mockSearchConsoleClient.searchanalytics.query
                // 1st call: detectAnomalies (date dimension)
                .mockResolvedValueOnce({ data: { rows: baselineRows } })
                // 2nd call: dropDayStats (device dimension) - Mobile dropped hard
                .mockResolvedValueOnce({
                    data: {
                        rows: [
                            { keys: ['MOBILE'], clicks: 2 },
                            { keys: ['DESKTOP'], clicks: 8 }
                        ]
                    }
                })
                // 3rd call: baselineStats (device dimension)
                .mockResolvedValueOnce({
                    data: {
                        rows: [
                            { keys: ['MOBILE'], clicks: 350 }, // 50/day
                            { keys: ['DESKTOP'], clicks: 350 } // 50/day
                        ]
                    }
                });

            const result = await analyzeDropAttribution('https://example.com');

            expect(result).not.toBeNull();
            expect(result?.primaryCause).toContain('mobile');
            expect(result?.date).toBe('2025-01-21');
        });

        it('should detect a known algorithm update', async () => {
            const rows = Array(20).fill({ keys: ['2025-03-XX'], clicks: 100 });
            rows.push({ keys: ['2025-03-13'], clicks: 20 }); // March 2025 Core Update date

            mockSearchConsoleClient.searchanalytics.query
                .mockResolvedValueOnce({ data: { rows } })
                .mockResolvedValue({ data: { rows: [] } });

            const result = await analyzeDropAttribution('https://example.com');
            expect(result?.possibleAlgorithmUpdate).toBe('March 2025 Core Update');
        });
    });

    describe('getTimeSeriesInsights', () => {
        it('should calculate rolling averages and forecast with multiple metrics', async () => {
            // Mock 30 days of data with clicks and impressions
            const rows = Array.from({ length: 30 }, (_, i) => ({
                keys: [`2025-01-${String(i + 1).padStart(2, '0')}`],
                clicks: 100 + i * 10,
                impressions: 1000 + i * 100
            }));

            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows }
            });

            const result = await getTimeSeriesInsights('https://example.com', {
                days: 30,
                metrics: ['clicks', 'impressions'],
                window: 5,
                forecastDays: 14
            });

            expect(result.history.length).toBe(30);
            expect(result.history[29].metrics.clicks).toBe(390);
            expect(result.history[29].metrics.impressions).toBe(3900);
            expect(result.history[29].rollingAverages?.clicks).toBeGreaterThan(100);
            expect(result.history[29].rollingAverages?.impressions).toBeGreaterThan(1000);

            expect(result.forecast.currentTrend).toBe('up');
            expect(result.forecast.forecastedValues.clicks.length).toBe(14);
            expect(result.forecast.forecastedValues.impressions.length).toBe(14);
        });

        it('should handle weekly granularity', async () => {
            // Mock 28 days (4 weeks) of data
            const rows = Array.from({ length: 28 }, (_, i) => ({
                keys: [`2025-01-${String(i + 1).padStart(2, '0')}`],
                clicks: 10
            }));

            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows }
            });

            const result = await getTimeSeriesInsights('https://example.com', {
                days: 28,
                granularity: 'weekly'
            });

            // 28 days should be grouped into 4 or 5 weeks depending on alignment
            expect(result.history.length).toBeLessThanOrEqual(5);
            expect(result.history[0].week).toBeDefined();
            expect(result.history[0].metrics.clicks).toBeGreaterThanOrEqual(10);
        });

        it('should support additional dimensions', async () => {
            // Mock rows with Date and Device
            const rows = [
                { keys: ['2025-01-01', 'MOBILE'], clicks: 10 },
                { keys: ['2025-01-01', 'DESKTOP'], clicks: 20 },
                { keys: ['2025-01-02', 'MOBILE'], clicks: 15 },
                { keys: ['2025-01-02', 'DESKTOP'], clicks: 25 }
            ];

            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows }
            });

            const result = await getTimeSeriesInsights('https://example.com', {
                dimensions: ['date', 'device']
            });

            expect(result.history.length).toBe(4);
            expect(result.history[0].dimensions?.device).toBeDefined();
        });

        it('should detect seasonality strength on daily data', async () => {
            // Mock data with a strong weekend dip
            const rows = Array.from({ length: 28 }, (_, i) => {
                const day = i % 7;
                const value = (day === 0 || day === 6) ? 10 : 100; // Sat/Sun are low
                return {
                    keys: [`2025-01-${String(i + 1).padStart(2, '0')}`],
                    clicks: value
                };
            });

            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: { rows }
            });

            const result = await getTimeSeriesInsights('https://example.com', { days: 28 });
            expect(result.forecast.seasonalityStrength).toBeGreaterThan(0.5);
        });
    });
});
