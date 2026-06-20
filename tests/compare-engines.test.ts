import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compareRows } from '../src/common/tools/compare-engines/comparator.js';
import { generateSignals } from '../src/common/tools/compare-engines/signals.js';
import { compareEngines } from '../src/common/tools/compare-engines/index.js';
import { NormalizedRow, ComparisonRow } from '../src/common/tools/compare-engines/types.js';
import * as adapters from '../src/common/tools/compare-engines/adapters.js';

describe('Comparator', () => {
  it('should merge google and bing rows correctly', () => {
    const googleRows: NormalizedRow[] = [
      { key: 'foo', clicks: 100, impressions: 1000, ctr: 0.1, position: 1, engine: 'google' },
      { key: 'bar', clicks: 50, impressions: 500, ctr: 0.1, position: 5, engine: 'google' }
    ];
    const bingRows: NormalizedRow[] = [
      { key: 'foo', clicks: 80, impressions: 800, ctr: 0.1, position: 2, engine: 'bing' },
      { key: 'baz', clicks: 20, impressions: 200, ctr: 0.1, position: 10, engine: 'bing' }
    ];

    const { rows, summary } = compareRows(googleRows, bingRows);

    expect(rows).toHaveLength(3);
    expect(summary.total_keys).toBe(3);

    // Check foo (merged)
    const foo = rows.find(r => r.key === 'foo');
    expect(foo).toBeDefined();
    expect(foo?.google.clicks).toBe(100);
    expect(foo?.bing.clicks).toBe(80);
    expect(foo?.deltas.position_delta).toBe(-1); // 1 - 2
    expect(foo?.deltas.click_share_google).toBeCloseTo(100 / 180);

    // Check bar (google only)
    const bar = rows.find(r => r.key === 'bar');
    expect(bar?.bing.clicks).toBe(0);
    expect(bar?.deltas.position_delta).toBe(5); // 5 - 0

    // Check baz (bing only)
    const baz = rows.find(r => r.key === 'baz');
    expect(baz?.google.clicks).toBe(0);
    expect(baz?.deltas.position_delta).toBe(-10); // 0 - 10
  });

  it('should handle division by zero in summary', () => {
    const { summary } = compareRows([], []);
    expect(summary.google_dependency_score).toBe(0);
  });
});

describe('Signal Engine', () => {
  it('should detect bing_opportunity', () => {
    const row: ComparisonRow = {
      key: 'test',
      google: { clicks: 60, impressions: 1000, ctr: 0.06, position: 3 },
      bing: { clicks: 0, impressions: 0, ctr: 0, position: 15 },
      deltas: { position_delta: -12, ctr_delta: 0.06, click_share_google: 1 },
      signals: []
    };
    const signals = generateSignals(row);
    expect(signals).toContain('bing_opportunity');
  });

  it('should detect google_dependency_risk', () => {
    const row: ComparisonRow = {
      key: 'test',
      google: { clicks: 100, impressions: 1000, ctr: 0.1, position: 1 },
      bing: { clicks: 10, impressions: 100, ctr: 0.1, position: 10 },
      deltas: { position_delta: -9, ctr_delta: 0, click_share_google: 100 / 110 }, // 0.909
      signals: []
    };
    // Total clicks 110 > 100, share > 0.85
    const signals = generateSignals(row);
    expect(signals).toContain('google_dependency_risk');
  });

  it('should detect ctr_mismatch', () => {
    const row: ComparisonRow = {
      key: 'test',
      google: { clicks: 100, impressions: 1000, ctr: 0.1, position: 5 },
      bing: { clicks: 50, impressions: 1000, ctr: 0.05, position: 6 },
      deltas: { position_delta: -1, ctr_delta: 0.05, click_share_google: 0.66 },
      signals: []
    };
    // abs(ctr_delta) >= 0.05 (0.05) AND abs(pos_delta) <= 2 (1)
    const signals = generateSignals(row);
    expect(signals).toContain('ctr_mismatch');
  });

  it('should detect ranking_divergence', () => {
    const row: ComparisonRow = {
      key: 'test',
      google: { clicks: 100, impressions: 1000, ctr: 0.1, position: 1 },
      bing: { clicks: 50, impressions: 1000, ctr: 0.05, position: 10 },
      deltas: { position_delta: -9, ctr_delta: 0.05, click_share_google: 0.66 },
      signals: []
    };
    // abs(-9) >= 7
    const signals = generateSignals(row);
    expect(signals).toContain('ranking_divergence');
  });
});

describe('Integration: compareEngines', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should orchestrate correct flow', async () => {
    vi.spyOn(adapters, 'fetchGoogleData').mockResolvedValue([
      { keys: ['foo'], clicks: 100, impressions: 1000, ctr: 0.1, position: 1 }
    ]);
    vi.spyOn(adapters, 'fetchBingData').mockResolvedValue([
      { Query: 'foo', Clicks: 50, Impressions: 500, CTR: 0.1, AvgPosition: 5, Date: '2023-01-01' }
    ]);

    const result = await compareEngines({
      siteUrl: 'https://example.com',
      dimension: 'query',
      startDate: '2023-01-01',
      endDate: '2023-01-07'
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].key).toBe('foo');
    expect(result.rows[0].google.clicks).toBe(100);
    expect(result.rows[0].bing.clicks).toBe(50);
  });

  it('should filter results by minImpressions', async () => {
    vi.spyOn(adapters, 'fetchGoogleData').mockResolvedValue([
      { keys: ['low'], clicks: 1, impressions: 10, ctr: 0.1, position: 1 },
      { keys: ['high'], clicks: 100, impressions: 1000, ctr: 0.1, position: 1 }
    ]);
    vi.spyOn(adapters, 'fetchBingData').mockResolvedValue([
      { Query: 'low', Clicks: 1, Impressions: 10, CTR: 0.1, AvgPosition: 1, Date: '2023-01-01' },
      { Query: 'high', Clicks: 100, Impressions: 1000, CTR: 0.1, AvgPosition: 1, Date: '2023-01-01' }
    ]);

    const result = await compareEngines({
      siteUrl: 'https://example.com',
      dimension: 'query',
      startDate: '2023-01-01',
      endDate: '2023-01-07',
      minImpressions: 100
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].key).toBe('high');
  });
});
