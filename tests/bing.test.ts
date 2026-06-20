import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listSites, addSite, removeSite } from '../src/bing/tools/sites.js';
import { getQueryStats, getPageStats, getPageQueryStats } from '../src/bing/tools/analytics.js';
import { getKeywordStats } from '../src/bing/tools/keywords.js';
import { getCrawlIssues } from '../src/bing/tools/crawl.js';
import { getUrlSubmissionQuota, submitUrl, submitUrlBatch } from '../src/bing/tools/url-submission.js';
import { submitSitemap, listSitemaps, deleteSitemap } from '../src/bing/tools/sitemaps.js';

const fetch = vi.fn();
global.fetch = fetch as any;

describe('Bing Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.BING_API_KEY = 'test-api-key';
    });

    describe('bing_sites_list', () => {
        it('should list verified sites', async () => {
            const mockSites = [{ Url: 'https://example.com', State: 'Verified', Role: 'Owner' }];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockSites }),
            });

            const result = await listSites();
            expect(result).toEqual(mockSites);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetUserSites'), expect.any(Object));
        });

        it('should add a site', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: null }),
            });

            const result = await addSite('https://new.com');
            expect(result).toContain('Successfully added site');
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('AddSite'), expect.any(Object));
        });

        it('should remove a site', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: null }),
            });

            const result = await removeSite('https://old.com');
            expect(result).toContain('Successfully removed site');
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('RemoveSite'), expect.any(Object));
        });
    });

    describe('bing_analytics', () => {
        it('should get keyword stats (GetKeywordStats)', async () => {
            const mockStats = [{ Keyword: 'test', Impressions: 100, Date: '2023-01-01' }];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockStats }),
            });

            const result = await getKeywordStats('test');
            expect(result).toEqual(mockStats);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetKeywordStats'), expect.any(Object));
        });

        it('should get crawl issues (GetCrawlIssues)', async () => {
            const mockIssues = [{ Url: 'https://example.com/bad', IssueType: '404', FirstSeen: '2023-01-01', LastSeen: '2023-01-02' }];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockIssues }),
            });

            const result = await getCrawlIssues('https://example.com');
            expect(result).toEqual(mockIssues);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetCrawlIssues'), expect.any(Object));
        });
    });

    describe('bing_url_submission', () => {
        it('should get submission quota', async () => {
            const mockQuota = { DailyQuota: 1000, RemainingQuota: 500 };
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockQuota }),
            });

            const result = await getUrlSubmissionQuota('https://example.com');
            expect(result).toEqual(mockQuota);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetUrlSubmissionQuota'), expect.any(Object));
        });

        it('should submit a single URL', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: null }),
            });

            const result = await submitUrl('https://example.com', 'https://example.com/new');
            expect(result).toContain('Successfully submitted URL');
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('SubmitUrl'),
                expect.objectContaining({ method: 'POST' })
            );
        });

        it('should submit a batch of URLs', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: null }),
            });

            const result = await submitUrlBatch('https://example.com', ['https://example.com/1', 'https://example.com/2']);
            expect(result).toContain('Successfully submitted 2 URLs');
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('SubmitUrlBatch'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('urlList')
                })
            );
        });
    });

    describe('bing_legacy_analytics', () => {
        it('should get query stats (GetQueryStats)', async () => {
            const mockStats = [{ Query: 'test', Clicks: 10, Impressions: 100, CTR: 0.1, AvgPosition: 1, Date: '2023-01-01' }];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockStats }),
            });

            const result = await getQueryStats('https://example.com');
            expect(result).toEqual(mockStats);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetQueryStats'), expect.any(Object));
        });
    });

    describe('bing_sitemaps', () => {
        it('should list sitemaps', async () => {
            const mockSitemaps = [{ Url: 'https://example.com/sitemap.xml', Status: 'Success' }];
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: mockSitemaps }),
            });

            const result = await listSitemaps('https://example.com');
            expect(result).toEqual(mockSitemaps);
        });

        it('should delete sitemap', async () => {
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ d: null }),
            });

            const result = await deleteSitemap('https://example.com', 'feedUrl');
            expect(result).toContain('Successfully removed sitemap');
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('RemoveFeed'), expect.any(Object));
        });
    });
});
