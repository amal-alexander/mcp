import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkTrafficHealth } from '../../src/common/tools/compare-engines/ga4-gsc-comparator.js';
import * as gscAnalytics from '../../src/google/tools/analytics.js';
import * as ga4Analytics from '../../src/ga4/tools/analytics.js';

vi.mock('../../src/google/tools/analytics.js');
vi.mock('../../src/ga4/tools/analytics.js');

describe('checkTrafficHealth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should identify healthy traffic tracking', async () => {
        vi.mocked(gscAnalytics.queryAnalytics).mockResolvedValue([
            { clicks: 1000 }
        ] as any);

        vi.mocked(ga4Analytics.getTrafficSources).mockResolvedValue([
            { sessions: 900 }
        ] as any);

        const results = await checkTrafficHealth('https://example.com', '123', '2024-01-01', '2024-01-31');

        expect(results).toHaveLength(1);
        expect(results[0].classification).toBe('Healthy');
        expect(results[0].ratio).toBe(0.9);
    });

    it('should identify a tracking gap', async () => {
        vi.mocked(gscAnalytics.queryAnalytics).mockResolvedValue([
            { clicks: 1000 }
        ] as any);

        vi.mocked(ga4Analytics.getTrafficSources).mockResolvedValue([
            { sessions: 400 }
        ] as any);

        const results = await checkTrafficHealth('https://example.com', '123', '2024-01-01', '2024-01-31');

        expect(results[0].classification).toBe('Tracking Gap');
        expect(results[0].ratio).toBe(0.4);
    });

    it('should identify a filter/domain issue', async () => {
        vi.mocked(gscAnalytics.queryAnalytics).mockResolvedValue([
            { clicks: 1000 }
        ] as any);

        vi.mocked(ga4Analytics.getTrafficSources).mockResolvedValue([
            { sessions: 1500 }
        ] as any);

        const results = await checkTrafficHealth('https://example.com', '123', '2024-01-01', '2024-01-31');

        expect(results[0].classification).toBe('Filter Issue');
        expect(results[0].ratio).toBe(1.5);
    });

    it('should handle zero GSC clicks gracefully', async () => {
        vi.mocked(gscAnalytics.queryAnalytics).mockResolvedValue([] as any);
        vi.mocked(ga4Analytics.getTrafficSources).mockResolvedValue([] as any);

        const results = await checkTrafficHealth('https://example.com', '123', '2024-01-01', '2024-01-31');

        expect(results[0].classification).toBe('Healthy');
        expect(results[0].gscClicks).toBe(0);
    });
});
