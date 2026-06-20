import { describe, it, expect, vi } from 'vitest';
import * as advancedAnalytics from '../src/google/tools/advanced-analytics';
import * as analytics from '../src/google/tools/analytics';

vi.mock('../src/google/tools/analytics', () => ({
  queryAnalytics: vi.fn(),
  detectAnomalies: vi.fn()
}));

describe('getTimeSeriesInsights Weekly Aggregation', () => {
  it('correctly aggregates weekly data using weighted averages', async () => {
    // Mock daily data: 2 days in the same week
    const mockData = [
      { keys: ['2023-01-02'], clicks: 10, impressions: 100, ctr: 0.1, position: 10 },
      { keys: ['2023-01-03'], clicks: 10, impressions: 1000, ctr: 0.01, position: 50 },
    ];

    vi.mocked(analytics.queryAnalytics).mockResolvedValue(mockData as any);

    const result = await advancedAnalytics.getTimeSeriesInsights('https://example.com', {
      granularity: 'weekly',
      metrics: ['clicks', 'impressions', 'ctr', 'position'],
      startDate: '2023-01-01',
      endDate: '2023-01-07'
    });

    expect(result.history).toHaveLength(1);
    const week = result.history[0];

    // Clicks should be sum: 10 + 10 = 20
    expect(week.metrics.clicks).toBe(20);

    // Impressions should be sum: 100 + 1000 = 1100
    expect(week.metrics.impressions).toBe(1100);

    // Position should be WEIGHTED average:
    // (10*100 + 50*1000) / 1100 = 51000 / 1100 = 46.3636...
    // Simple average would be (10+50)/2 = 30
    expect(week.metrics.position).toBeCloseTo(46.36, 1);

    // CTR should be WEIGHTED average (Total Clicks / Total Impressions):
    // 20 / 1100 = 0.01818...
    // Simple average would be (0.1 + 0.01) / 2 = 0.055
    expect(week.metrics.ctr).toBeCloseTo(0.018, 3);
  });
});
