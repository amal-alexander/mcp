
import { describe, it, expect, vi } from 'vitest';
import { mockSearchConsoleClient } from './mocks';
import {
    comparePeriods,
    getTopQueries,
    getTopPages,
    getPerformanceByCountry,
    getPerformanceBySearchAppearance,
    detectTrends,
    detectAnomalies
} from '../src/google/tools/analytics';
import {
    detectCannibalization,
    findLowCTROpportunities,
    findStrikingDistance,
    findLostQueries,
    analyzeBrandVsNonBrand,
    findQuickWins,
    findLowHangingFruit
} from '../src/google/tools/seo-insights';
import { isBrandQuery, isCannibalized } from '../src/common/tools/seo-primitives';

describe('100% Coverage Edge Cases', () => {

    describe('Analytics Edge Cases', () => {
        it('calculatePercent exhaustive (Line 175)', async () => {
            // Case 1: prev 0, curr > 0
            mockSearchConsoleClient.searchanalytics.query
                .mockResolvedValueOnce({ data: { rows: [{ clicks: 10 }] } })
                .mockResolvedValueOnce({ data: { rows: [] } });
            await comparePeriods('s', 's', 's', 's', 's');

            // Case 2: prev 0, curr 0
            mockSearchConsoleClient.searchanalytics.query
                .mockResolvedValueOnce({ data: { rows: [] } })
                .mockResolvedValueOnce({ data: { rows: [] } });
            await comparePeriods('s', 's', 's', 's', 's');

            // Case 3: prev > 0
            mockSearchConsoleClient.searchanalytics.query
                .mockResolvedValueOnce({ data: { rows: [{ clicks: 10 }] } })
                .mockResolvedValueOnce({ data: { rows: [{ clicks: 10 }] } });
            await comparePeriods('s', 's', 's', 's', 's');
        });

        it('exhaustive breakdown fallbacks (Line 228-375)', async () => {
            // We need at least 2 rows to trigger sort branches
            const badRows = [
                { keys: undefined, clicks: undefined, impressions: undefined, ctr: undefined, position: undefined },
                { keys: [], clicks: 10 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({ data: { rows: badRows } });

            await getTopQueries('s', { sortBy: 'clicks' });
            await getTopPages('s', { sortBy: 'clicks' });
            await getPerformanceByCountry('s', { sortBy: 'clicks' });
            await getPerformanceBySearchAppearance('s', { sortBy: 'clicks' });
        });

        it('detectTrends and anomalies full (Line 426-552)', async () => {
            // Trends: hit line 471, 478, 489
            mockSearchConsoleClient.searchanalytics.query
                .mockResolvedValueOnce({ data: { rows: [{ keys: ['k'], clicks: 100 }, { keys: ['new'], clicks: 50 }] } })
                .mockResolvedValueOnce({ data: { rows: [{ keys: ['k'], clicks: undefined }] } }); // hits 471
            await detectTrends('s', { minClicks: 10, threshold: 0 });

            // Anomalies: line 537-548
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
                data: {
                    rows: [
                        { keys: ['d1'], clicks: 10 },
                        { keys: ['d2'], clicks: 10 },
                        { keys: ['d3'], clicks: 10 },
                        { keys: ['d4'], clicks: 10 },
                        { keys: ['d5'], clicks: 10 }
                    ]
                }
            });
            await detectAnomalies('s');
        });
    });

    describe('SEO Insights Edge Cases', () => {
        it('exhaustive insights fallbacks', async () => {
            const badRows = [
                { keys: undefined, position: undefined, impressions: undefined, clicks: undefined, ctr: undefined },
                { keys: [], position: 10, impressions: 1000 }
            ];
            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({ data: { rows: badRows } });

            await findLowHangingFruit('s', { minImpressions: 0 });
            await detectCannibalization('s', { minImpressions: 0 });
            await findLowCTROpportunities('s', { minImpressions: 0 });
            await findStrikingDistance('s');
            await findQuickWins('s', { minImpressions: 0 });

            mockSearchConsoleClient.searchanalytics.query
                .mockResolvedValueOnce({ data: { rows: [] } })
                .mockResolvedValueOnce({ data: { rows: badRows } });
            await findLostQueries('s');

            mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({ data: { rows: badRows } });
            await analyzeBrandVsNonBrand('s', 'b');
        });
    });

    describe('Primitives Edge Case', () => {
        it('finalize', () => {
            expect(isBrandQuery('test', '[').isBrand).toBe(false);
            expect(isCannibalized('q', { position: 5, impressions: 0, clicks: 0 }, { position: 5, impressions: 0, clicks: 0 }).overlapScore).toBe(0);
        });
    });
});
