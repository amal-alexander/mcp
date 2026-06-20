import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPageSpeedCorrelation } from '../src/ga4/tools/pagespeed.js';
import * as analyticsModule from '../src/ga4/tools/analytics.js';
import * as pagespeedModule from '../src/google/tools/pagespeed.js';

vi.mock('../src/ga4/tools/analytics.js', () => ({
    getOrganicLandingPages: vi.fn(),
}));

vi.mock('../src/google/tools/pagespeed.js', () => ({
    analyzePageSpeed: vi.fn(),
}));

describe('PageSpeed Optimization Benchmark', () => {
    let activeCalls = 0;
    let maxActiveCalls = 0;

    beforeEach(() => {
        vi.clearAllMocks();
        activeCalls = 0;
        maxActiveCalls = 0;
    });

    it('should limit concurrent calls to analyzePageSpeed', async () => {
        const numPages = 20;
        const mockPages = Array.from({ length: numPages }, (_, i) => ({
            pagePath: `/page-${i}`,
        }));

        (analyticsModule.getOrganicLandingPages as any).mockResolvedValue(mockPages);

        (pagespeedModule.analyzePageSpeed as any).mockImplementation(async () => {
            activeCalls++;
            maxActiveCalls = Math.max(maxActiveCalls, activeCalls);
            // Simulate some async work
            await new Promise(resolve => setTimeout(resolve, 10));
            activeCalls--;
            return { score: 0.9 };
        });

        const start = performance.now();
        await getPageSpeedCorrelation('prop1', 'example.com', '2023-01-01', '2023-01-31', numPages);
        const end = performance.now();

        console.log(`Execution time: ${(end - start).toFixed(2)}ms`);
        console.log(`Max active calls: ${maxActiveCalls}`);

        // Before optimization, this will be 20.
        // After optimization, this should be 5.
        expect(maxActiveCalls).toBeLessThanOrEqual(5);
    });
});
