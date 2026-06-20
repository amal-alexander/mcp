import { getBingClient, BingUrlSubmissionQuota } from '../client.js';

/**
 * Get remaining URL submission quota.
 */
export async function getUrlSubmissionQuota(siteUrl: string): Promise<BingUrlSubmissionQuota> {
    const client = await getBingClient(siteUrl);
    return client.getUrlSubmissionQuota(siteUrl);
}

/**
 * Submit a single URL for indexing.
 */
export async function submitUrl(siteUrl: string, url: string): Promise<string> {
    const client = await getBingClient(siteUrl);
    await client.submitUrl(siteUrl, url);
    return `Successfully submitted URL: ${url}`;
}

/**
 * Submit a batch of URLs for indexing.
 */
export async function submitUrlBatch(siteUrl: string, urlList: string[]): Promise<string> {
    const client = await getBingClient(siteUrl);
    await client.submitUrlBatch(siteUrl, urlList);
    return `Successfully submitted ${urlList.length} URLs in batch.`;
}
