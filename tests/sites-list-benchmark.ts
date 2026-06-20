import { limitConcurrency } from '../src/common/concurrency.js';
import { performance } from 'perf_hooks';

async function mockAccounts() {
    const numAccounts = 20;
    const accounts = Array.from({ length: numAccounts }, (_, i) => ({
        id: `account${i}`,
        alias: `Account ${i}`,
        engine: i % 2 === 0 ? 'google' : 'bing'
    }));

    const mockListSites = async () => new Promise(r => setTimeout(() => r([{ siteUrl: 'https://example.com' }]), 50));

    return { accounts, mockListSites };
}

async function runSequential(accounts, engine, mockListSites) {
    const start = performance.now();
    const allResults = [];
    for (const account of accounts) {
        if (account.engine !== engine) continue;
        try {
            const results = await mockListSites(account.id);
            allResults.push({
            account: account.alias,
            accountId: account.id,
            sites: results
            });
        } catch (e) {
            allResults.push({
            account: account.alias,
            accountId: account.id,
            error: e.message
            });
        }
    }
    const end = performance.now();
    return end - start;
}

async function runConcurrent(accounts, engine, mockListSites) {
    const start = performance.now();
    const allResults = [];
    const accountsToProcess = accounts.filter(a => a.engine === engine);

    await limitConcurrency(accountsToProcess, 5, async (account) => {
        try {
            const results = await mockListSites(account.id);
            allResults.push({
            account: account.alias,
            accountId: account.id,
            sites: results
            });
        } catch (e) {
            allResults.push({
            account: account.alias,
            accountId: account.id,
            error: e.message
            });
        }
    });
    const end = performance.now();
    return end - start;
}

async function main() {
    const { accounts, mockListSites } = await mockAccounts();
    console.log(`Running benchmark with ${accounts.length} accounts (10 of each engine) taking ~50ms per call...`);

    const seqTime = await runSequential(accounts, 'google', mockListSites);
    console.log(`Sequential Google time: ${seqTime.toFixed(2)}ms`);

    const concTime = await runConcurrent(accounts, 'google', mockListSites);
    console.log(`Concurrent Google time (limit: 5): ${concTime.toFixed(2)}ms`);

    console.log(`Improvement: ${((seqTime - concTime) / seqTime * 100).toFixed(2)}%`);
}

main().catch(console.error);
