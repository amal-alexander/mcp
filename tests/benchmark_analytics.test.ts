import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queryAnalytics } from '../src/google/tools/analytics.js';
import * as googleClient from '../src/google/client.js';

// Mock the googleClient module
vi.mock('../src/google/client.js');

describe('queryAnalytics Performance', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should demonstrate caching benefit', async () => {
    // Mock implementation with delay
    const mockQuery = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate 100ms network latency
      return {
        data: {
          rows: [{ clicks: 100, impressions: 1000, ctr: 0.1, position: 1 }]
        }
      };
    });

    const mockClient = {
      searchanalytics: {
        query: mockQuery
      }
    };

    // Return the mock client
    vi.spyOn(googleClient, 'getSearchConsoleClient').mockResolvedValue(mockClient as any);

    // Use unique parameters to ensure fresh cache
    const options = {
      siteUrl: 'https://example.com/caching-test',
      startDate: '2023-01-01',
      endDate: '2023-01-31',
      dimensions: ['date']
    };

    console.log('Starting caching measurement...');

    // First call
    const start1 = performance.now();
    await queryAnalytics(options);
    const end1 = performance.now();
    const duration1 = end1 - start1;

    // Second call with same options
    const start2 = performance.now();
    await queryAnalytics(options);
    const end2 = performance.now();
    const duration2 = end2 - start2;

    console.log(`First call: ${duration1.toFixed(2)}ms`);
    console.log(`Second call: ${duration2.toFixed(2)}ms`);

    // First call should be slow (>= 100ms)
    expect(duration1).toBeGreaterThanOrEqual(90);

    // Second call should be fast (cached)
    expect(duration2).toBeLessThan(20);

    // API should have been called only once
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent requests (deduplication)', async () => {
     const mockQuery = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { data: { rows: [] } };
    });

    const mockClient = { searchanalytics: { query: mockQuery } };
    vi.spyOn(googleClient, 'getSearchConsoleClient').mockResolvedValue(mockClient as any);

    // Use unique parameters
    const options = {
      siteUrl: 'https://example.com/concurrent-test',
      startDate: '2023-01-01',
      endDate: '2023-01-01'
    };

    // Launch two requests in parallel
    const start = performance.now();
    const [res1, res2] = await Promise.all([
      queryAnalytics(options),
      queryAnalytics(options)
    ]);
    const end = performance.now();

    // API should be called only once due to promise sharing
    expect(mockQuery).toHaveBeenCalledTimes(1);

    // Both should complete around same time (approx 100ms)
    expect(end - start).toBeGreaterThanOrEqual(90);
    expect(res1).toBe(res2); // Should return same result object (or at least same content)
  });

  it('should generate different keys for different options', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ data: { rows: [] } });
      const mockClient = { searchanalytics: { query: mockQuery } };
      vi.spyOn(googleClient, 'getSearchConsoleClient').mockResolvedValue(mockClient as any);

      const options1 = { siteUrl: 'https://site1.com', startDate: '2023-01-01', endDate: '2023-01-01' };
      const options2 = { siteUrl: 'https://site2.com', startDate: '2023-01-01', endDate: '2023-01-01' };

      await queryAnalytics(options1);
      await queryAnalytics(options2);

      expect(mockQuery).toHaveBeenCalledTimes(2);
  });
});
