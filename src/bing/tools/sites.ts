import { getBingClient, BingSite } from '../client.js';

/**
 * List all sites verified in the specified Bing account.
 *
 * @param accountId - Optional. The account to list sites for.
 * @returns A list of verified site properties.
 */
export async function listSites(accountId?: string): Promise<BingSite[]> {
    const client = await getBingClient(undefined, accountId);
    return client.getSiteList();
}

/**
 * Add a site to Bing Webmaster Tools.
 *
 * @param siteUrl - The URL of the site to add.
 * @returns A success message.
 */
export async function addSite(siteUrl: string): Promise<string> {
    const client = await getBingClient(siteUrl);
    await client.addSite(siteUrl);
    return `Successfully added site: ${siteUrl}`;
}

/**
 * Remove a site from Bing Webmaster Tools.
 *
 * @param siteUrl - The URL of the site to remove.
 * @returns A success message.
 */
export async function removeSite(siteUrl: string): Promise<string> {
    const client = await getBingClient(siteUrl);
    await client.removeSite(siteUrl);
    return `Successfully removed site: ${siteUrl}`;
}
