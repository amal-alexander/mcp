
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectTrends, clearAnalyticsCache } from '../src/google/tools/analytics';
import { getSearchConsoleClient } from '../src/google/client';

// Mock the client
vi.mock('../src/google/client', () => ({
    getSearchConsoleClient: vi.fn(),
}));

const mockQuery = vi.fn().mockResolvedValue({ data: { rows: [] } });
(getSearchConsoleClient as any).mockResolvedValue({
    searchanalytics: { query: mockQuery }
});

// Mock Date to ensure deterministic tests
const MOCK_DATE = new Date('2025-06-01T12:00:00Z');

describe('detectTrends Date Overlap', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearAnalyticsCache();
        vi.useFakeTimers();
        vi.setSystemTime(MOCK_DATE);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should calculate correct date ranges without overlap', async () => {
        // 28 days total -> 14 days per period
        await detectTrends('https://example.com', { days: 28 });

        expect(mockQuery).toHaveBeenCalledTimes(2);

        const calls = mockQuery.mock.calls;
        if (calls.length < 2) throw new Error('Not enough calls');

        // Extract parameters
        const args1 = calls[0][0].requestBody;
        const args2 = calls[1][0].requestBody;

        console.log('Call 1:', args1.startDate, args1.endDate);
        console.log('Call 2:', args2.startDate, args2.endDate);

        const period1 = { start: args1.startDate, end: args1.endDate };
        const period2 = { start: args2.startDate, end: args2.endDate };

        // Identify which is which (Current vs Previous)
        // Current period should be LATER than Previous period
        const laterPeriod = period1.start > period2.start ? period1 : period2;
        const earlierPeriod = period1.start > period2.start ? period2 : period1;

        // Ensure strictly non-overlapping dates
        // If End Date of Previous == Start Date of Current, that IS an overlap because GSC dates are inclusive.
        // We want Previous.End < Current.Start
        expect(earlierPeriod.end).not.toBe(laterPeriod.start);
        expect(new Date(earlierPeriod.end).getTime()).toBeLessThan(new Date(laterPeriod.start).getTime());
    });
});
