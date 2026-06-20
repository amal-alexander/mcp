import { safeTest } from '../../common/utils/regex.js';

/**
 * SEO Primitives: Atomic functions for building higher-level SEO agents.
 */

/**
 * Result of categorizing a ranking position.
 */
export interface RankingBucketResult {
    /** The original ranking position. */
    position: number;
    /** The category name for the ranking range. */
    bucket: 'Top 3' | 'Page 1 (4-10)' | 'Page 2 (11-20)' | 'Page 3+' | 'Unranked';
    /** The search engine this data originates from. */
    engine?: 'google' | 'bing';
}

/**
 * Result of a traffic delta calculation between two periods.
 */
export interface TrafficDeltaResult {
    /** The value in the current period. */
    current: number;
    /** The value in the previous period. */
    previous: number;
    /** The absolute numerical difference. */
    absoluteChange: number;
    /** The percentage change. */
    percentChange: number;
    /** A semantic status indicating the direction of change. */
    status: 'increased' | 'decreased' | 'unchanged' | 'new' | 'lost';
    /** The search engine this data originates from. */
    engine?: 'google' | 'bing';
}

/**
 * Result of a brand query identification check.
 */
export interface BrandQueryResult {
    /** The query string analyzed. */
    query: string;
    /** Whether the query was identified as a brand query. */
    isBrand: boolean;
    /** The regex pattern that matched, if any. */
    matchedPattern?: string;
    /** The search engine this data originates from. */
    engine?: 'google' | 'bing';
}

/**
 * Result of a cannibalization check between two pages.
 */
export interface CannibalizationCheckResult {
    /** The search query being analyzed. */
    query: string;
    /** The first page URL. */
    pageA: string;
    /** The second page URL. */
    pageB: string;
    /** Whether cannibalization was detected. */
    isCannibalized: boolean;
    /** A score (0-1) representing the severity of the conflict. */
    overlapScore: number;
    /** A human-readable recommendation for resolving the conflict. */
    recommendation: string;
    /** The search engine this data originates from. */
    engine?: 'google' | 'bing';
}

/**
 * Categorize a ranking position into a discrete bucket (Top 3, Page 1, etc.).
 *
 * @param position - The average ranking position.
 * @returns The categorized bucket result.
 */
export function getRankingBucket(position: number, engine?: 'google' | 'bing'): RankingBucketResult {
    let bucket: RankingBucketResult['bucket'];

    if (position <= 0) bucket = 'Unranked';
    else if (position <= 3) bucket = 'Top 3';
    else if (position <= 10) bucket = 'Page 1 (4-10)';
    else if (position <= 20) bucket = 'Page 2 (11-20)';
    else bucket = 'Page 3+';

    return { position, bucket, engine };
}

/**
 * Calculate the delta and percentage change between two traffic metrics.
 *
 * @param current - The current metric value.
 * @param previous - The baseline metric value.
 * @returns A detailed delta result including status.
 */
export function calculateTrafficDelta(current: number, previous: number, engine?: 'google' | 'bing'): TrafficDeltaResult {
    const absoluteChange = current - previous;
    let percentChange = 0;
    let status: TrafficDeltaResult['status'];

    if (previous === 0) {
        if (current > 0) {
            percentChange = 100;
            status = 'new';
        } else {
            percentChange = 0;
            status = 'unchanged';
        }
    } else {
        percentChange = Math.round(((current - previous) / previous) * 100);
        if (current === 0) status = 'lost';
        else if (current > previous) status = 'increased';
        else if (current < previous) status = 'decreased';
        else status = 'unchanged';
    }

    return { current, previous, absoluteChange, percentChange, status, engine };
}

/**
 * Determine if a search query matches a brand pattern using regex.
 *
 * @param query - The search query to test.
 * @param brandRegexString - The regex string to use for matching.
 * @returns A brand detection result.
 */
export function isBrandQuery(query: string, brandRegexString: string, engine?: 'google' | 'bing'): BrandQueryResult {
    const isBrand = safeTest(brandRegexString, 'i', query);
    return {
        query,
        isBrand,
        matchedPattern: isBrand ? brandRegexString : undefined,
        engine
    };
}

/**
 * Check if two pages are potentially cannibalizing each other for the same query.
 *
 * @param query - The shared search query.
 * @param pageA - Performance metrics for the first page.
 * @param pageB - Performance metrics for the second page.
 * @returns An overlap analysis with a recommendation.
 */
export function isCannibalized(
    query: string,
    pageA: { position: number; impressions: number; clicks: number; engine?: 'google' | 'bing' },
    pageB: { position: number; impressions: number; clicks: number; engine?: 'google' | 'bing' }
): CannibalizationCheckResult {
    // 1. Position proximity: Are ranks close? (e.g. Pos 5 vs Pos 6 is high conflict, Pos 1 vs Pos 50 is low)
    const posDiff = Math.abs(pageA.position - pageB.position);

    // 2. Impression share: do they both get seen?
    const totalImpressions = pageA.impressions + pageB.impressions;
    const shareA = totalImpressions > 0 ? pageA.impressions / totalImpressions : 0;
    const shareB = totalImpressions > 0 ? pageB.impressions / totalImpressions : 0;

    // Overlap score calculation (0 to 1)
    // High overlap if positions are close AND impression shares are balanced
    // 1 / (1 + posDiff) -> Pos diff 0 = 1.0, Diff 9 = 0.1
    const positionScore = 1 / (1 + (posDiff * 0.5));

    // Balance score: 1 - abs(shareA - shareB). If 50/50 -> 1.0. If 100/0 -> 0.0.
    const balanceScore = totalImpressions > 0 ? (1 - Math.abs(shareA - shareB)) : 0;

    const overlapScore = parseFloat((positionScore * balanceScore).toFixed(2));
    const isCannibalized = overlapScore > 0.3; // Threshold

    let recommendation = "No action needed.";
    if (isCannibalized) {
        if (pageA.clicks > pageB.clicks * 2) recommendation = "Consolidate to Page A (stronger performer).";
        else if (pageB.clicks > pageA.clicks * 2) recommendation = "Consolidate to Page B (stronger performer).";
        else recommendation = "Review content intent. Pages are competing closely.";
    }

    return {
        query,
        pageA: "Page A", // Placeholder, logic only cares about metrics
        pageB: "Page B",
        isCannibalized,
        overlapScore,
        recommendation,
        engine: pageA.engine // Use engine from pageA if available
    };
}
