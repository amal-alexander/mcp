import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPagePerformance } from '../../src/ga4/tools/analytics.js';
import { getRealtimeData } from '../../src/ga4/tools/realtime.js';
import * as clientModule from '../../src/ga4/client.js';

// Mock dependencies
const mockRunReport = vi.fn();
const mockBatchRunReports = vi.fn();
const mockRunRealtimeReport = vi.fn();

vi.mock('../../src/ga4/client.js', () => ({
    getGA4Client: vi.fn(),
    GA4Client: class {}
}));

describe('GA4 Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (clientModule.getGA4Client as any).mockResolvedValue({
            runReport: mockRunReport,
            batchRunReports: mockBatchRunReports,
            runRealtimeReport: mockRunRealtimeReport
        });
    });

    it('getPagePerformance should call runReport and format results', async () => {
        mockRunReport.mockResolvedValue(
            {
                rows: [
                    {
                        dimensionValues: [{ value: '/home' }],
                        metricValues: [{ value: '100' }]
                    }
                ],
                dimensionHeaders: [{ name: 'pagePath' }],
                metricHeaders: [{ name: 'sessions' }]
            }
        );

        const result = await getPagePerformance('123', '2023-01-01', '2023-01-31', undefined, 10, undefined, 20);

        expect(mockRunReport).toHaveBeenCalled();
        expect(mockRunReport.mock.calls[0][0].limit).toBe(10);
        expect(mockRunReport.mock.calls[0][0].offset).toBe(20);
        expect(result).toEqual([{ pagePath: '/home', sessions: 100 }]);
    });

    it('getRealtimeData should call runRealtimeReport', async () => {
        mockRunRealtimeReport.mockResolvedValue([
            {
                rows: [],
                dimensionHeaders: [],
                metricHeaders: []
            }
        ]);

        await getRealtimeData('123');
        expect(mockRunRealtimeReport).toHaveBeenCalled();
    });
});
