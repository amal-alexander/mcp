import { getBingClient } from '../client.js';

/**
 * List sitemaps for a Bing site.
 * 
 * @param siteUrl - The URL of the site.
 * @returns A list of sitemaps.
 */
export async function listSitemaps(siteUrl: string): Promise<any[]> {
    const client = await getBingClient(siteUrl);
    return client.getFeeds(siteUrl);
}

/**
 * Submit a sitemap to Bing Webmaster Tools.
 * 
 * @param siteUrl - The URL of the site.
 * @param sitemapUrl - The URL of the sitemap file.
 */
export async function submitSitemap(siteUrl: string, sitemapUrl: string): Promise<string> {
    const client = await getBingClient(siteUrl);
    await client.submitSitemap(siteUrl, sitemapUrl);
    return `Successfully submitted sitemap: ${sitemapUrl} for site ${siteUrl}`;
}

/**
 * Remove a sitemap from Bing Webmaster Tools.
 * 
 * @param siteUrl - The URL of the site.
 * @param sitemapUrl - The URL of the sitemap to remove.
 */
export async function deleteSitemap(siteUrl: string, sitemapUrl: string): Promise<string> {
    const client = await getBingClient(siteUrl);
    await client.deleteSitemap(siteUrl, sitemapUrl);
    return `Successfully removed sitemap: ${sitemapUrl} for site ${siteUrl}`;
}
