import { getOrganicLandingPages } from './analytics.js';
import { analyzePageSpeed } from '../../google/tools/pagespeed.js';
import { limitConcurrency } from '../../common/concurrency.js';

export async function getPageSpeedCorrelation(
    propertyId: string,
    domain: string,
    startDate: string,
    endDate: string,
    limit: number = 5,
    strategy: 'mobile' | 'desktop' = 'mobile',
    accountId?: string
) {
    // Normalize domain
    let baseUrl = domain.trim();
    if (!baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
    }
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    // 1. Get top organic landing pages
    const pages = await getOrganicLandingPages(propertyId, startDate, endDate, limit, accountId);

    // 2. Run PageSpeed on each with concurrency limit
    const results = await limitConcurrency(pages, 5, async (page: any) => {
        try {
            const path = page.landingPagePlusQueryString || page.pagePath;
            if (!path) throw new Error("No page path found");

            const fullUrl = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

            const psiResult = await analyzePageSpeed(fullUrl, strategy);
            return {
                ...page,
                pageSpeed: psiResult
            };
        } catch (error: any) {
            return {
                ...page,
                pageSpeedError: error.message || "Failed to analyze"
            };
        }
    });

    return results;
}
