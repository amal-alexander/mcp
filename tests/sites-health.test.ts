import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSearchConsoleClient } from './mocks';
import { healthCheck } from '../src/google/tools/sites-health';
import { clearAnalyticsCache } from '../src/google/tools/analytics';

describe('Sites Health Check', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearAnalyticsCache();
    });

    const makePerfRows = (clicks: number, impressions: number, ctr: number, position: number) => ({
        data: { rows: [{ clicks, impressions, ctr, position }] }
    });

    const emptyRows = { data: { rows: [] } };

    it('should return healthy status for a single site with good metrics', async () => {
        // getSite
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' }
        });
        // listSitemaps
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [{ path: 'https://example.com/sitemap.xml', type: 'sitemap', errors: 0, warnings: 0, isPending: false }] }
        });
        // comparePeriods: two calls to queryAnalytics (current period then previous)
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))   // current week
            .mockResolvedValueOnce(makePerfRows(480, 9800, 0.049, 8.2)) // previous week
            // detectAnomalies: needs daily data (at least 5 days)
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70, impressions: 1000 },
                        { keys: ['2024-01-02'], clicks: 72, impressions: 1020 },
                        { keys: ['2024-01-03'], clicks: 68, impressions: 980 },
                        { keys: ['2024-01-04'], clicks: 71, impressions: 1010 },
                        { keys: ['2024-01-05'], clicks: 69, impressions: 990 },
                    ]
                }
            });

        const result = await healthCheck('https://example.com');

        expect(result).toHaveLength(1);
        expect(result[0].siteUrl).toBe('https://example.com');
        expect(result[0].status).toBe('healthy');
        expect(result[0].permissionLevel).toBe('siteOwner');
        expect(result[0].performance.current.clicks).toBe(500);
        expect(result[0].performance.previous.clicks).toBe(480);
        expect(result[0].sitemaps.total).toBe(1);
        expect(result[0].sitemaps.withErrors).toBe(0);
        expect(result[0].issues).toHaveLength(0);
    });

    it('should return warning for moderate traffic decline', async () => {
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' }
        });
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [{ path: 'https://example.com/sitemap.xml', errors: 0, warnings: 0 }] }
        });
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(400, 8000, 0.05, 9))    // current: clicks dropped ~20%
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))   // previous
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70 },
                        { keys: ['2024-01-02'], clicks: 72 },
                        { keys: ['2024-01-03'], clicks: 68 },
                        { keys: ['2024-01-04'], clicks: 71 },
                        { keys: ['2024-01-05'], clicks: 69 },
                    ]
                }
            });

        const result = await healthCheck('https://example.com');

        expect(result[0].status).toBe('warning');
        expect(result[0].issues.some(i => i.includes('Traffic declining'))).toBe(true);
    });

    it('should return critical for severe traffic drop', async () => {
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' }
        });
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [] }
        });
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(100, 3000, 0.033, 15))   // current: severe drop
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))    // previous
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70 },
                        { keys: ['2024-01-02'], clicks: 72 },
                        { keys: ['2024-01-03'], clicks: 68 },
                        { keys: ['2024-01-04'], clicks: 71 },
                        { keys: ['2024-01-05'], clicks: 69 },
                    ]
                }
            });

        const result = await healthCheck('https://example.com');

        expect(result[0].status).toBe('critical');
        expect(result[0].issues.some(i => i.startsWith('Critical traffic drop'))).toBe(true);
        expect(result[0].issues.some(i => i.startsWith('Critical visibility drop'))).toBe(true);
        expect(result[0].issues.some(i => i.includes('No sitemaps submitted'))).toBe(true);
    });

    it('should flag sitemap errors', async () => {
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' }
        });
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: {
                sitemap: [
                    { path: 'https://example.com/sitemap.xml', errors: 3, warnings: 1 },
                ]
            }
        });
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))
            .mockResolvedValueOnce(makePerfRows(480, 9800, 0.049, 8.2))
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70 },
                        { keys: ['2024-01-02'], clicks: 72 },
                        { keys: ['2024-01-03'], clicks: 68 },
                        { keys: ['2024-01-04'], clicks: 71 },
                        { keys: ['2024-01-05'], clicks: 69 },
                    ]
                }
            });

        const result = await healthCheck('https://example.com');

        expect(result[0].sitemaps.withErrors).toBe(1);
        expect(result[0].sitemaps.withWarnings).toBe(1);
        expect(result[0].issues.some(i => i.includes('sitemap(s) have errors'))).toBe(true);
        expect(result[0].issues.some(i => i.includes('sitemap(s) have warnings'))).toBe(true);
    });

    it('should check all sites when no siteUrl is provided', async () => {
        mockSearchConsoleClient.sites.list.mockResolvedValue({
            data: {
                siteEntry: [
                    { siteUrl: 'https://good.com', permissionLevel: 'siteOwner' },
                    { siteUrl: 'https://bad.com', permissionLevel: 'siteOwner' },
                ]
            }
        });

        // good.com — healthy
        // Note: sites.get is no longer called during iteration because site info is passed directly

        mockSearchConsoleClient.sitemaps.list
            .mockResolvedValueOnce({ data: { sitemap: [{ path: '/sitemap.xml', errors: 0, warnings: 0 }] } })
            .mockResolvedValueOnce({ data: { sitemap: [] } });

        mockSearchConsoleClient.searchanalytics.query
            // good.com: comparePeriods current, previous, anomalies
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))
            .mockResolvedValueOnce(makePerfRows(480, 9800, 0.049, 8.2))
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70 },
                        { keys: ['2024-01-02'], clicks: 72 },
                        { keys: ['2024-01-03'], clicks: 68 },
                        { keys: ['2024-01-04'], clicks: 71 },
                        { keys: ['2024-01-05'], clicks: 69 },
                    ]
                }
            })
            // bad.com: severe drop
            .mockResolvedValueOnce(makePerfRows(50, 1000, 0.05, 20))
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70 },
                        { keys: ['2024-01-02'], clicks: 72 },
                        { keys: ['2024-01-03'], clicks: 68 },
                        { keys: ['2024-01-04'], clicks: 71 },
                        { keys: ['2024-01-05'], clicks: 69 },
                    ]
                }
            });

        const result = await healthCheck();

        expect(result).toHaveLength(2);
        // Critical should be sorted first
        expect(result[0].siteUrl).toBe('https://bad.com');
        expect(result[0].status).toBe('critical');
        expect(result[1].siteUrl).toBe('https://good.com');
        expect(result[1].status).toBe('healthy');
    });

    it('should return empty array when no sites exist', async () => {
        mockSearchConsoleClient.sites.list.mockResolvedValue({
            data: { siteEntry: [] }
        });

        const result = await healthCheck();
        expect(result).toEqual([]);
    });

    it('should handle critical when no traffic data at all', async () => {
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://dead.com', permissionLevel: 'siteOwner' }
        });
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({ data: { sitemap: [] } });
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(emptyRows)  // current
            .mockResolvedValueOnce(emptyRows)  // previous
            .mockResolvedValueOnce({ data: { rows: [] } }); // anomalies

        const result = await healthCheck('https://dead.com');

        expect(result[0].status).toBe('critical');
        expect(result[0].issues.some(i => i.includes('No traffic data'))).toBe(true);
    });

    it('should gracefully handle getSite failure', async () => {
        mockSearchConsoleClient.sites.get.mockRejectedValue(new Error('Forbidden'));
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [{ path: '/sitemap.xml', errors: 0, warnings: 0 }] }
        });
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))
            .mockResolvedValueOnce(makePerfRows(480, 9800, 0.049, 8.2))
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70 },
                        { keys: ['2024-01-02'], clicks: 72 },
                        { keys: ['2024-01-03'], clicks: 68 },
                        { keys: ['2024-01-04'], clicks: 71 },
                        { keys: ['2024-01-05'], clicks: 69 },
                    ]
                }
            });

        const result = await healthCheck('https://example.com');

        expect(result[0].permissionLevel).toBe('unknown');
        expect(result[0].status).toBe('healthy');
    });

    it('should gracefully handle listSitemaps failure', async () => {
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' }
        });
        mockSearchConsoleClient.sitemaps.list.mockRejectedValue(new Error('API error'));
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))
            .mockResolvedValueOnce(makePerfRows(480, 9800, 0.049, 8.2))
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70 },
                        { keys: ['2024-01-02'], clicks: 72 },
                        { keys: ['2024-01-03'], clicks: 68 },
                        { keys: ['2024-01-04'], clicks: 71 },
                        { keys: ['2024-01-05'], clicks: 69 },
                    ]
                }
            });

        const result = await healthCheck('https://example.com');

        // Sitemaps fallback to empty → "No sitemaps submitted" issue
        expect(result[0].sitemaps.total).toBe(0);
        expect(result[0].issues.some(i => i.includes('No sitemaps submitted'))).toBe(true);
    });

    it('should gracefully handle detectAnomalies failure', async () => {
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' }
        });
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [{ path: '/sitemap.xml', errors: 0, warnings: 0 }] }
        });
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))
            .mockResolvedValueOnce(makePerfRows(480, 9800, 0.049, 8.2))
            // detectAnomalies call will fail
            .mockRejectedValueOnce(new Error('Anomaly detection failed'));

        const result = await healthCheck('https://example.com');

        // Anomalies fallback to empty → no anomaly issues
        expect(result[0].anomalies).toEqual([]);
        expect(result[0].status).toBe('healthy');
    });

    it('should flag anomaly drops when detected', async () => {
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' }
        });
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [{ path: '/sitemap.xml', errors: 0, warnings: 0 }] }
        });
        // Create data with a strong anomaly drop on the last day
        const normalDays = Array.from({ length: 13 }, (_, i) => ({
            keys: [`2024-01-${String(i + 1).padStart(2, '0')}`],
            clicks: 100,
            impressions: 1000,
        }));
        const dropDay = {
            keys: ['2024-01-14'],
            clicks: 10,  // massive drop — Z-score will trigger
            impressions: 100,
        };

        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))
            .mockResolvedValueOnce(makePerfRows(480, 9800, 0.049, 8.2))
            .mockResolvedValueOnce({ data: { rows: [...normalDays, dropDay] } });

        const result = await healthCheck('https://example.com');

        expect(result[0].anomalies.length).toBeGreaterThan(0);
        expect(result[0].issues.some(i => i.includes('traffic anomaly drop(s) detected'))).toBe(true);
        expect(result[0].status).toBe('warning');
    });

    it('should flag position worsening', async () => {
        mockSearchConsoleClient.sites.get.mockResolvedValue({
            data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' }
        });
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [{ path: '/sitemap.xml', errors: 0, warnings: 0 }] }
        });
        mockSearchConsoleClient.searchanalytics.query
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 15))  // current: position 15
            .mockResolvedValueOnce(makePerfRows(500, 10000, 0.05, 8))   // previous: position 8 — delta = 7
            .mockResolvedValueOnce({
                data: {
                    rows: [
                        { keys: ['2024-01-01'], clicks: 70 },
                        { keys: ['2024-01-02'], clicks: 72 },
                        { keys: ['2024-01-03'], clicks: 68 },
                        { keys: ['2024-01-04'], clicks: 71 },
                        { keys: ['2024-01-05'], clicks: 69 },
                    ]
                }
            });

        const result = await healthCheck('https://example.com');

        expect(result[0].issues.some(i => i.includes('Average position worsened'))).toBe(true);
        expect(result[0].status).toBe('warning');
    });
});

