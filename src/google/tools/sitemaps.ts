import { getSearchConsoleClient } from '../client.js';
import { searchconsole_v1 } from 'googleapis';

/**
 * List all sitemaps submitted for a specific site.
 *
 * @param siteUrl - The URL of the site to query.
 * @returns A list of sitemap metadata objects.
 */
export async function listSitemaps(siteUrl: string): Promise<searchconsole_v1.Schema$WmxSitemap[]> {
  const client = await getSearchConsoleClient(siteUrl);
  const res = await client.sitemaps.list({ siteUrl });
  return res.data.sitemap || [];
}

/**
 * Submit a new sitemap to Google Search Console.
 *
 * @param siteUrl - The URL of the site.
 * @param feedpath - The full URL path of the sitemap to submit.
 * @returns A success message.
 */
export async function submitSitemap(siteUrl: string, feedpath: string): Promise<string> {
  const client = await getSearchConsoleClient(siteUrl);
  await client.sitemaps.submit({ siteUrl, feedpath });
  return `Successfully submitted sitemap: ${feedpath} for ${siteUrl}`;
}

/**
 * Delete a sitemap from Google Search Console.
 *
 * @param siteUrl - The URL of the site.
 * @param feedpath - The full URL path of the sitemap to delete.
 * @returns A success message.
 */
export async function deleteSitemap(siteUrl: string, feedpath: string): Promise<string> {
  const client = await getSearchConsoleClient(siteUrl);
  await client.sitemaps.delete({ siteUrl, feedpath });
  return `Successfully deleted sitemap: ${feedpath} from ${siteUrl}`;
}

/**
 * Get detailed information about a specific sitemap.
 *
 * @param siteUrl - The URL of the site.
 * @param feedpath - The full URL path of the sitemap.
 * @returns Sitemap details including status and item counts.
 */
export async function getSitemap(siteUrl: string, feedpath: string): Promise<searchconsole_v1.Schema$WmxSitemap> {
  const client = await getSearchConsoleClient(siteUrl);
  const res = await client.sitemaps.get({ siteUrl, feedpath });
  return res.data;
}
