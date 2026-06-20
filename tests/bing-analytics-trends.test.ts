
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectTrends } from '../src/bing/tools/analytics';
import { getBingClient } from '../src/bing/client';

// Mock the client
vi.mock('../src/bing/client', () => ({
    getBingClient: vi.fn(),
}));

// Mock Data
const MOCK_DATE = new Date('2025-06-01T12:00:00Z');

const createStat = (query: string, clicks: number, date: string) => ({
    Query: query,
    Clicks: clicks,
    Impressions: clicks * 10,
    CTR: 0.1,
    AvgPosition: 1,
    Date: date
});

describe('Bing detectTrends', () => {
    let mockGetQueryStats;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(MOCK_DATE);

        mockGetQueryStats = vi.fn().mockResolvedValue([]);
        (getBingClient as any).mockResolvedValue({
            getQueryStats: mockGetQueryStats
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should detect rising trends', async () => {
        mockGetQueryStats.mockResolvedValue([
            // Previous Period (May 3 - May 16)
            createStat('rising query', 50, '2025-05-05'),
            createStat('rising query', 50, '2025-05-06'), // Total 100

            // Current Period (May 17 - May 30)
            createStat('rising query', 100, '2025-05-18'),
            createStat('rising query', 100, '2025-05-19'), // Total 200
        ]);

        const trends = await detectTrends('https://example.com', { minClicks: 50 });

        expect(trends.length).toBe(1);
        expect(trends[0].key).toBe('rising query');
        expect(trends[0].changePercent).toBe(100);
        expect(trends[0].trend).toBe('rising');
    });

    it('should detect declining trends', async () => {
        mockGetQueryStats.mockResolvedValue([
            // Previous Period
            createStat('dropping query', 100, '2025-05-05'),

            // Current Period
            createStat('dropping query', 50, '2025-05-18'),
        ]);

        const trends = await detectTrends('https://example.com', { minClicks: 10 });

        expect(trends.length).toBe(1);
        expect(trends[0].key).toBe('dropping query');
        expect(trends[0].changePercent).toBe(-50);
        expect(trends[0].trend).toBe('declining');
    });

    it('should detect zero to hero trends', async () => {
        mockGetQueryStats.mockResolvedValue([
            // Current Period Only
            createStat('new query', 100, '2025-05-18'),
        ]);

        const trends = await detectTrends('https://example.com', { minClicks: 50 });

        expect(trends.length).toBe(1);
        expect(trends[0].key).toBe('new query');
        expect(trends[0].changePercent).toBe(100);
        expect(trends[0].previousValue).toBe(0);
    });

    it('should detect hero to zero trends', async () => {
        mockGetQueryStats.mockResolvedValue([
            // Previous Period Only
            createStat('lost query', 100, '2025-05-05'),
        ]);

        const trends = await detectTrends('https://example.com', { minClicks: 50 });

        expect(trends.length).toBe(1);
        expect(trends[0].key).toBe('lost query');
        expect(trends[0].changePercent).toBe(-100);
        expect(trends[0].currentValue).toBe(0);
    });
});
