import 'dotenv/config';
import { getPagePerformance, getTrafficSources, getOrganicLandingPages, getContentPerformance, getEcommerce } from '../src/ga4/tools/analytics.js';
import { getUserBehavior, getAudienceSegments, getConversionFunnel } from '../src/ga4/tools/behavior.js';
import { getRealtimeData } from '../src/ga4/tools/realtime.js';
import { loadConfig } from '../src/common/auth/config.js';

if (process.env.CI) {
    console.log('Skipping live test in CI environment.');
    process.exit(0);
}

async function runLiveTest() {
    console.log('--- Starting Live Google Analytics 4 (GA4) API Test ---\n');

    try {
        // 1. Identify Property ID
        const config = await loadConfig();
        const ga4Accounts = Object.values(config.accounts).filter(a => a.engine === 'ga4');

        let propertyId = process.env.GA4_PROPERTY_ID;
        let accountId: string | undefined;

        if (!propertyId) {
            if (ga4Accounts.length > 0) {
                propertyId = ga4Accounts[0].ga4PropertyId;
                accountId = ga4Accounts[0].id;
                console.log(`ℹ Using Property ID from config: ${propertyId} (Account: ${ga4Accounts[0].alias})`);
            } else {
                console.error('❌ No GA4 property ID found. Please set GA4_PROPERTY_ID environment variable or run setup.');
                process.exit(1);
            }
        }

        console.log(`✅ Testing with Property ID: ${propertyId}\n`);

        const startDate = '2024-01-01'; // Default test range
        const endDate = 'today';

        // 2. Realtime Data
        console.log('Step 1: Fetching Realtime Data...');
        try {
            const realtime = await getRealtimeData(propertyId!, accountId);
            console.log(`✅ Success! Found ${realtime.length} active dimension rows.\n`);
        } catch (e) {
            console.error('❌ Step 1 failed:', (e as Error).message);
        }

        // 3. Page Performance
        console.log('Step 2: Fetching Page Performance...');
        const pagePerf = await getPagePerformance(propertyId!, startDate, endDate, undefined, 5, accountId);
        console.log(`✅ Success! Found ${pagePerf.length} top pages.\n`);

        // 4. Traffic Sources
        console.log('Step 3: Fetching Traffic Sources...');
        const sources = await getTrafficSources(propertyId!, startDate, endDate, undefined, 5, accountId);
        console.log(`✅ Success! Found ${sources.length} traffic source rows.\n`);

        // 5. Organic Landing Pages
        console.log('Step 4: Fetching Organic Landing Pages...');
        const organic = await getOrganicLandingPages(propertyId!, startDate, endDate, 5, accountId);
        console.log(`✅ Success! Found ${organic.length} organic pages.\n`);

        // 6. User Behavior (Batch)
        console.log('Step 5: Fetching User Behavior (Batch Report)...');
        const behavior = await getUserBehavior(propertyId!, startDate, endDate, accountId);
        console.log(`✅ Success! Breakdown: ${behavior.devices.length} devices, ${behavior.countries.length} countries.\n`);

        // 7. Audience Segments (Batch)
        console.log('Step 6: Fetching Audience Segments (Batch Report)...');
        const segments = await getAudienceSegments(propertyId!, startDate, endDate, accountId);
        console.log(`✅ Success! Found ${segments.newVsReturning.length} user types.\n`);

        // 8. Conversion Funnel
        console.log('Step 7: Analyzing Conversion Funnel...');
        const funnel = await getConversionFunnel(propertyId!, startDate, endDate, undefined, accountId);
        console.log(`✅ Success! Top events found: ${funnel.topEvents.length}.\n`);

        // 9. Content Performance
        console.log('Step 8: Fetching Content Performance...');
        const contentPerf = await getContentPerformance(propertyId!, startDate, endDate, 5, accountId);
        if ('warning' in contentPerf) {
            console.log(`⚠️  Warning: ${contentPerf.warning}\n`);
        } else {
            console.log(`✅ Success! Found ${contentPerf.length} content groups.\n`);
        }

        // 10. Ecommerce (Optional)
        console.log('Step 9: Fetching Ecommerce Metrics...');
        try {
            const ecommerce = await getEcommerce(propertyId!, startDate, endDate, 5, accountId);
            if ('warning' in ecommerce) {
                console.log(`ℹ ${ecommerce.warning}\n`);
            } else {
                console.log(`✅ Success! Found ${ecommerce.length} products with revenue.\n`);
            }
        } catch (e) {
            console.log(`ℹ Ecommerce query skipped or failed (common if not enabled).\n`);
        }

        console.log('--- All Live GA4 API Tests Completed! ---');
    } catch (error) {
        console.error('❌ Live Test Failed:', (error as Error).message);
        if ((error as Error).stack) console.error((error as Error).stack);
    }
}

runLiveTest();
