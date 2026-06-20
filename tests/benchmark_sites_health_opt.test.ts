
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSearchConsoleClient } from './mocks';
import { healthCheck } from '../src/google/tools/sites-health';
import { clearAnalyticsCache } from '../src/google/tools/analytics';

describe('Sites Health Check Benchmark', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearAnalyticsCache();
    });

    const makePerfRows = (clicks: number, impressions: number, ctr: number, position: number) => ({
        data: { rows: [{ clicks, impressions, ctr, position }] }
    });

    it('should count calls to sites.get', async () => {
        const siteCount = 10;
        const sites = Array.from({ length: siteCount }, (_, i) => ({
            siteUrl: `https://site${i}.com`,
            permissionLevel: 'siteOwner'
        }));

        mockSearchConsoleClient.sites.list.mockResolvedValue({
            data: { siteEntry: sites }
        });

        // Mock getSite for each site
        mockSearchConsoleClient.sites.get.mockImplementation(({ siteUrl }) => {
            return Promise.resolve({
                data: { siteUrl, permissionLevel: 'siteOwner' }
            });
        });

        // Mock other calls to be fast
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [] }
        });
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValue(makePerfRows(100, 1000, 0.1, 5));

        const start = performance.now();
        await healthCheck();
        const end = performance.now();

        console.log(`Execution time: ${(end - start).toFixed(2)}ms`);
        console.log(`sites.get calls: ${mockSearchConsoleClient.sites.get.mock.calls.length}`);

        // In the optimized version, we pass the site info directly, so getSite is not called.
        // So we expect 0 calls.
        expect(mockSearchConsoleClient.sites.get).toHaveBeenCalledTimes(0);
    });
});
