import { loadConfig } from './auth/config.js';
import { getSearchConsoleClient } from '../google/client.js';
import { getBingClient } from '../bing/client.js';
import { logger } from '../utils/logger.js';

export interface DiagnosticResult {
    engine: string;
    account: string;
    status: 'ok' | 'error';
    message: string;
    details?: any;
}

/**
 * Runs a set of diagnostic checks to verify API connectivity and account health.
 */
export async function runDiagnostics(): Promise<DiagnosticResult[]> {
    const config = await loadConfig();
    const accounts = Object.values(config.accounts);
    const results: DiagnosticResult[] = [];

    logger.info(`Starting diagnostics for ${accounts.length} accounts...`);
    logger.info(`System Time: ${new Date().toISOString()}`);
    logger.info(`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

    for (const account of accounts) {
        logger.debug(`Checking account: ${account.alias} (${account.engine})`);

        try {
            if (account.engine === 'google') {
                const client = await getSearchConsoleClient(undefined, account.id);
                // Test call: list sites (limited to 1 for quick check)
                const res = await client.sites.list();
                results.push({
                    engine: 'google',
                    account: account.alias,
                    status: 'ok',
                    message: `Successfully connected. Account has access to ${res.data.siteEntry?.length || 0} sites.`,
                    details: { sitesCount: res.data.siteEntry?.length || 0 }
                });
            } else if (account.engine === 'bing') {
                const client = await getBingClient(undefined, account.id);
                const res = await client.getSiteList();
                results.push({
                    engine: 'bing',
                    account: account.alias,
                    status: 'ok',
                    message: `Successfully connected. Account has access to ${res.length} sites.`,
                    details: { sitesCount: res.length }
                });
            }
            // Add GA4 diagnostics if needed
        } catch (e) {
            const error = e as Error;
            logger.error(`Diagnostic failed for ${account.alias}: ${error.message}`);
            results.push({
                engine: account.engine,
                account: account.alias,
                status: 'error',
                message: error.message
            });
        }
    }

    if (accounts.length === 0) {
        results.push({
            engine: 'system',
            account: 'none',
            status: 'error',
            message: 'No accounts configured. Run setup first.'
        });
    }

    return results;
}
