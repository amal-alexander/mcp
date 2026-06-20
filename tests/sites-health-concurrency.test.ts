import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSearchConsoleClient } from './mocks';
import { healthCheck } from '../src/google/tools/sites-health';

describe('Concurrency Benchmark: sites-health', () => {
    let activeRequests = 0;
    let maxActiveRequests = 0;

    beforeEach(() => {
        vi.clearAllMocks();
        activeRequests = 0;
        maxActiveRequests = 0;
    });

    const simulateDelay = async () => {
        activeRequests++;
        if (activeRequests > maxActiveRequests) {
            maxActiveRequests = activeRequests;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
        activeRequests--;
    };

    it('limits concurrent requests when processing 50 sites', async () => {
        const siteCount = 50;
        const sites = Array.from({ length: siteCount }, (_, i) => ({
            siteUrl: `https://site-${i}.com`,
            permissionLevel: 'siteOwner'
        }));

        mockSearchConsoleClient.sites.list.mockResolvedValue({
            data: { siteEntry: sites }
        });

        // Mock getSite
        mockSearchConsoleClient.sites.get.mockImplementation(async (params: any) => {
            await simulateDelay();
            return { data: { siteUrl: params?.siteUrl || 'https://example.com', permissionLevel: 'siteOwner' } };
        });

        // Mock listSitemaps
        mockSearchConsoleClient.sitemaps.list.mockImplementation(async () => {
            await simulateDelay();
            return { data: { sitemap: [] } };
        });

        // Mock searchanalytics.query (called 3 times per site)
        mockSearchConsoleClient.searchanalytics.query.mockImplementation(async () => {
            await simulateDelay();
            return { data: { rows: [] } };
        });

        // Run healthCheck
        const start = Date.now();
        await healthCheck();
        const duration = Date.now() - start;

        console.log(`Processed ${siteCount} sites in ${duration}ms`);
        console.log(`Max concurrent requests: ${maxActiveRequests}`);

        // With 50 sites and concurrency limit of 5, and ~5 requests per site.
        // Max concurrent requests should be around 25.
        // We set a safe upper bound, e.g., 50, to distinguish from unbounded (250).
        expect(maxActiveRequests).toBeLessThanOrEqual(50);
        expect(maxActiveRequests).toBeGreaterThan(0);
    });
});
