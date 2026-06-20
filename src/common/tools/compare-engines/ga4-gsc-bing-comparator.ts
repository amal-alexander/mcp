import { queryAnalytics as queryGSC } from '../../../google/tools/analytics.js';
import { getBingClient } from '../../../bing/client.js';
import { getOrganicLandingPages } from '../../../ga4/tools/analytics.js';
import { OpportunityMatrixRow, BrandAnalysisRow } from './types.js';
import { normalizeGA4Row } from './ga4-adapters.js';
import { extractUrlPath } from './utils.js';

export async function getOpportunityMatrix(
    gscSiteUrl: string,
    bingSiteUrl: string,
    ga4PropertyId: string,
    startDate: string,
    endDate: string,
    limit: number = 20,
    ga4AccountId?: string,
    gscAccountId?: string,
    bingAccountId?: string
): Promise<OpportunityMatrixRow[]> {

    const gscPromise = queryGSC({
        siteUrl: gscSiteUrl,
        accountId: gscAccountId,
        startDate,
        endDate,
        dimensions: ['page'],
        limit: limit * 2
    });

    const bingPromise = (async () => {
        try {
            const client = await getBingClient(bingSiteUrl, bingAccountId);
            return await client.getPageStats(bingSiteUrl);
        } catch (e) {
            console.error("Bing fetch failed:", e);
            return [];
        }
    })();

    const ga4Promise = getOrganicLandingPages(ga4PropertyId, startDate, endDate, limit * 2, ga4AccountId);

    const [gscResult, bingResult, ga4Result] = await Promise.allSettled([gscPromise, bingPromise, ga4Promise]);

    const gscRows = gscResult.status === 'fulfilled' ? gscResult.value : [];
    const bingRows = bingResult.status === 'fulfilled' ? bingResult.value : [];
    const ga4Rows = ga4Result.status === 'fulfilled' ? ga4Result.value : [];

    // Normalize and Join
    const map = new Map<string, OpportunityMatrixRow>();

    // Process GSC
    for (const row of gscRows) {
        const url = row.keys?.[0] || '';
        const path = extractUrlPath(url);
        map.set(path, {
            url,
            gsc: {
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0
            },
            priorityScore: 0,
            action: '',
            category: 'Content Fix'
        });
    }

    // Process Bing
    for (const row of bingRows) {
        // Bing API returns the URL in the 'Query' field for GetPageStats results
        const path = extractUrlPath(row.Query);

        const existing = map.get(path);
        const bingStats = {
            clicks: row.Clicks,
            impressions: row.Impressions,
            ctr: row.CTR,
            position: row.AvgPosition
        };

        if (existing) {
            existing.bing = bingStats;
        } else {
            map.set(path, {
                url: row.Query,
                gsc: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
                bing: bingStats,
                priorityScore: 0,
                action: '',
                category: 'Bing Opportunity'
            });
        }
    }

    // Process GA4
    for (const row of ga4Rows) {
        const path = row.landingPagePlusQueryString || row.pagePath;
        if (!path) continue;

        // Try precise match then path match
        const existing = map.get(path) || map.get(path.split('?')[0]);
        const ga4Stats = normalizeGA4Row(row);

        if (existing) {
            existing.ga4 = ga4Stats;
        }
    }

    // Classify and Prioritize
    const results = Array.from(map.values());

    for (const row of results) {
        const gscPos = row.gsc.position;
        const bingPos = row.bing?.position || 100;
        const engagement = row.ga4?.engagementRate || 0;
        const bounce = row.ga4?.bounceRate || 0;
        const impressions = Math.max(row.gsc.impressions, row.bing?.impressions || 0);

        let score = 0;
        let category: OpportunityMatrixRow['category'] = 'Content Fix';
        let action = 'Optimize content';

        if (gscPos > 10 && gscPos < 30 && engagement > 0.5) {
            category = 'Quick Win';
            action = 'Improve title/meta description to boost CTR';
            score = 80 + (engagement * 20);
        } else if (impressions > 1000 && (engagement < 0.3 || bounce > 0.7)) {
            category = 'Content Fix';
            action = 'Improve page content to reduce bounce rate';
            score = 70 + (Math.log10(impressions) * 5);
        } else if (bingPos < 10 && gscPos > 20) {
            category = 'Bing Opportunity';
            action = 'Analyze Bing success factors and apply to Google';
            score = 60 + (100 - bingPos);
        } else {
            score = (row.gsc.clicks + (row.bing?.clicks || 0)) / 10;
        }

        row.category = category;
        row.action = action;
        row.priorityScore = parseFloat(score.toFixed(1));
    }

    return results.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, limit);
}

export async function getBrandAnalysis(
    brandTerms: string[],
    gscSiteUrl: string,
    bingSiteUrl: string,
    ga4PropertyId: string,
    startDate: string,
    endDate: string,
    ga4AccountId?: string,
    gscAccountId?: string,
    bingAccountId?: string
): Promise<BrandAnalysisRow[]> {
    const gscPromise = queryGSC({
        siteUrl: gscSiteUrl,
        accountId: gscAccountId,
        startDate,
        endDate,
        dimensions: ['query'],
        limit: 5000
    });

    const bingPromise = (async () => {
        try {
            const client = await getBingClient(bingSiteUrl, bingAccountId);
            return await client.getQueryStats(bingSiteUrl);
        } catch (e) {
            console.error("Bing fetch failed:", e);
            return [];
        }
    })();

    // GA4 doesn't expose query-level brand data. We fetch total organic sessions
    // as a contextual reference alongside GSC/Bing brand splits.
    const ga4Promise = getOrganicLandingPages(ga4PropertyId, startDate, endDate, 5000, ga4AccountId);

    const [gscResult, bingResult, ga4Result] = await Promise.allSettled([gscPromise, bingPromise, ga4Promise]);

    const gscRows = gscResult.status === 'fulfilled' ? gscResult.value : [];
    const bingRows = bingResult.status === 'fulfilled' ? bingResult.value : [];
    const ga4Rows = ga4Result.status === 'fulfilled' ? ga4Result.value : [];

    const isBrand = (query: string) => {
        const q = query.toLowerCase();
        return brandTerms.some(term => q.includes(term.toLowerCase()));
    };

    // GSC Analysis
    const gscBrand = { clicks: 0, impressions: 0 };
    const gscNonBrand = { clicks: 0, impressions: 0 };

    for (const row of gscRows) {
        const query = row.keys?.[0] || '';
        if (isBrand(query)) {
            gscBrand.clicks += row.clicks || 0;
            gscBrand.impressions += row.impressions || 0;
        } else {
            gscNonBrand.clicks += row.clicks || 0;
            gscNonBrand.impressions += row.impressions || 0;
        }
    }

    // Bing Analysis
    const bingBrand = { clicks: 0, impressions: 0 };
    const bingNonBrand = { clicks: 0, impressions: 0 };

    for (const row of bingRows) {
        if (isBrand(row.Query)) {
            bingBrand.clicks += row.Clicks;
            bingBrand.impressions += row.Impressions;
        } else {
            bingNonBrand.clicks += row.Clicks;
            bingNonBrand.impressions += row.Impressions;
        }
    }

    // GA4: Compute total organic sessions as context.
    // GA4 does not provide keyword-level brand/non-brand splits.
    const totalOrganicSessions = ga4Rows.reduce(
        (sum: number, row: Record<string, any>) => sum + Number(row.sessions || 0), 0
    );

    // Estimate brand session share by applying GSC brand click ratio to GA4 sessions
    const gscTotalClicks = gscBrand.clicks + gscNonBrand.clicks;
    const gscBrandRatio = gscTotalClicks > 0 ? gscBrand.clicks / gscTotalClicks : 0;
    const estimatedBrandSessions = Math.round(totalOrganicSessions * gscBrandRatio);
    const estimatedNonBrandSessions = totalOrganicSessions - estimatedBrandSessions;

    const rows: BrandAnalysisRow[] = [
        {
            platform: 'Google',
            brandMetrics: gscBrand,
            nonBrandMetrics: gscNonBrand,
            brandShare: parseFloat((gscBrand.clicks / ((gscBrand.clicks + gscNonBrand.clicks) || 1)).toFixed(2))
        },
        {
            platform: 'Bing',
            brandMetrics: bingBrand,
            nonBrandMetrics: bingNonBrand,
            brandShare: parseFloat((bingBrand.clicks / ((bingBrand.clicks + bingNonBrand.clicks) || 1)).toFixed(2))
        },
        {
            platform: 'GA4',
            brandMetrics: { sessions: estimatedBrandSessions },
            nonBrandMetrics: { sessions: estimatedNonBrandSessions },
            brandShare: parseFloat(gscBrandRatio.toFixed(2))
        }
    ];

    return rows;
}
