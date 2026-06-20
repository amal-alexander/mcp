import { queryAnalytics as queryGSC } from '../../../google/tools/analytics.js';
import { getOrganicLandingPages, getTrafficSources } from '../../../ga4/tools/analytics.js';
import { PageAnalysisRow, TrafficHealthRow } from './types.js';
import { normalizeGA4Row } from './ga4-adapters.js';
import { extractUrlPath, extractBasePropertyName } from './utils.js';

export async function analyzePagesCrossPlatform(
    gscSiteUrl: string,
    ga4PropertyId: string,
    startDate: string,
    endDate: string,
    limit: number = 50,
    ga4AccountId?: string,
    gscAccountId?: string
): Promise<PageAnalysisRow[]> {
    // Parallel fetch
    const [gscResult, ga4Result] = await Promise.allSettled([
        queryGSC({
            siteUrl: gscSiteUrl,
            accountId: gscAccountId,
            startDate,
            endDate,
            dimensions: ['page'],
            limit: limit * 2 // Fetch more to ensure overlap
        }),
        getOrganicLandingPages(ga4PropertyId, startDate, endDate, limit * 2, ga4AccountId)
    ]);

    const gscRows = gscResult.status === 'fulfilled' ? gscResult.value : [];
    const ga4Rows = ga4Result.status === 'fulfilled' ? ga4Result.value : [];

    // Map GA4 rows by path
    const ga4Map = new Map<string, any>();
    for (const row of ga4Rows) {
        // row.landingPagePlusQueryString is path
        const path = row.landingPagePlusQueryString || row.pagePath;
        if (path) {
            ga4Map.set(path, row);
            // Also normalized path (without query string)
            const basePath = path.split('?')[0];
            if (basePath !== path) {
                ga4Map.set(basePath, row);
            }
        }
    }

    const results: PageAnalysisRow[] = [];

    for (const gscRow of gscRows) {
        const url = gscRow.keys?.[0] || '';
        const path = extractUrlPath(url);

        // Try exact path match first, then path without query string
        let ga4Row = ga4Map.get(path);
        if (!ga4Row) {
            ga4Row = ga4Map.get(extractBasePropertyName(url));
        }

        if (ga4Row || (gscRow.clicks || 0) > 0) { // Only include if relevant
            const ga4Stats = ga4Row ? normalizeGA4Row(ga4Row) : undefined;
            const gscStats = {
                clicks: gscRow.clicks || 0,
                impressions: gscRow.impressions || 0,
                ctr: gscRow.ctr || 0,
                position: gscRow.position || 0
            };

            // Derived metrics
            let clickToSessionRatio = 0;
            if (gscStats.clicks > 0 && ga4Stats) {
                clickToSessionRatio = ga4Stats.sessions / gscStats.clicks;
            }

            // Opportunity Score
            const visibilityScore = Math.log10(gscStats.impressions + 1);
            const engagementScore = ga4Stats ? ga4Stats.engagementRate : 0;
            const conversionScore = ga4Stats ? Math.log10(ga4Stats.conversions + 1) : 0;

            const opportunityScore = (visibilityScore * 10) + (engagementScore * 100) + (conversionScore * 20);

            results.push({
                url,
                gsc: gscStats,
                ga4: ga4Stats,
                clickToSessionRatio: parseFloat(clickToSessionRatio.toFixed(2)),
                opportunityScore: parseFloat(opportunityScore.toFixed(2))
            });
        }
    }

    // Sort by opportunity score
    return results.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
}

export async function checkTrafficHealth(
    gscSiteUrl: string,
    ga4PropertyId: string,
    startDate: string,
    endDate: string,
    ga4AccountId?: string,
    gscAccountId?: string
): Promise<TrafficHealthRow[]> {
    const [gscRows, ga4Rows] = await Promise.all([
        queryGSC({
            siteUrl: gscSiteUrl,
            accountId: gscAccountId,
            startDate,
            endDate,
            limit: 1 // Total
        }),
        getTrafficSources(ga4PropertyId, startDate, endDate, 'Organic Search', 100, ga4AccountId) // Increase limit to capture variants
    ]);

    const gscClicks = gscRows.reduce((sum, row) => sum + (row.clicks || 0), 0);
    const ga4OrganicSessions = ga4Rows.reduce((sum: number, row: any) => sum + Number(row.sessions || 0), 0);

    const ratio = gscClicks > 0 ? ga4OrganicSessions / gscClicks : 0;

    let classification: 'Healthy' | 'Tracking Gap' | 'Filter Issue' = 'Healthy';
    let recommendation = "Traffic tracking looks normal.";

    if (gscClicks > 0) {
        if (ratio < 0.6) {
            classification = 'Tracking Gap';
            recommendation = "GA4 is capturing significantly fewer sessions than GSC clicks. Check for missing tracking codes, cookie consent issues, or aggressive bot filtering.";
        } else if (ratio > 1.3) {
            classification = 'Filter Issue';
            recommendation = "GA4 reports more organic sessions than GSC clicks. This might indicate direct traffic being misclassified as organic, or GSC property not covering all site variants (http/https/www).";
        }
    } else {
        recommendation = "No GSC clicks recorded.";
    }

    return [{
        date: `${startDate} to ${endDate}`,
        gscClicks,
        ga4OrganicSessions,
        ratio: parseFloat(ratio.toFixed(2)),
        classification,
        recommendation
    }];
}
