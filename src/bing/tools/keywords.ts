import { getBingClient, BingKeywordStats, BingRelatedKeyword } from '../client.js';

/**
 * Get historical stats for a keyword.
 */
export async function getKeywordStats(q: string, country?: string, language?: string): Promise<BingKeywordStats[]> {
    const client = await getBingClient(); // No siteUrl required for keyword research
    return client.getKeywordStats(q, country, language);
}

/**
 * Get related keywords and search volume.
 */
export async function getRelatedKeywords(q: string, country?: string, language?: string): Promise<BingRelatedKeyword[]> {
    const client = await getBingClient(); // No siteUrl required for keyword research
    return client.getRelatedKeywords(q, country, language);
}
