import { loadConfig } from '../../common/auth/config.js';

/**
 * List configured GA4 properties.
 * Since GA4 properties are configured explicitly during setup, 
 * we return the configured properties.
 */
export async function listProperties(accountId?: string) {
    const config = await loadConfig();
    const accounts = Object.values(config.accounts).filter(a => a.engine === 'ga4');

    if (accountId) {
        const account = accounts.find(a => a.id === accountId);
        if (!account) {
            throw new Error(`GA4 account ${accountId} not found.`);
        }
        return [{
            id: account.id,
            alias: account.alias,
            propertyId: account.ga4PropertyId,
            siteUrl: account.ga4PropertyId // Alias for sites_list consistency
        }];
    }

    return accounts.map(a => ({
        id: a.id,
        alias: a.alias,
        propertyId: a.ga4PropertyId,
        siteUrl: a.ga4PropertyId // Alias for sites_list consistency
    }));
}
