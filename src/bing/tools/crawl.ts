import { getBingClient, BingCrawlIssue, BingCrawlStats } from '../client.js';

/**
 * Get crawl issues for a site.
 */
export async function getCrawlIssues(siteUrl: string): Promise<BingCrawlIssue[]> {
    const client = await getBingClient(siteUrl);
    return client.getCrawlIssues(siteUrl);
}

/**
 * Get crawl statistics for a site.
 */
export async function getCrawlStats(siteUrl: string): Promise<BingCrawlStats[]> {
    const client = await getBingClient(siteUrl);
    return client.getCrawlStats(siteUrl);
}
