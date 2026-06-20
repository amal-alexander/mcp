import { batchQueryAnalytics, queryAnalytics } from './analytics.js';
import { formatRows } from '../utils.js';

export async function getUserBehavior(
    propertyId: string,
    startDate: string,
    endDate: string,
    accountId?: string
) {
    const response = await batchQueryAnalytics({
        propertyId,
        accountId,
        requests: [
            // 1. Device Category
            {
                dateRanges: [{ startDate, endDate }],
                dimensions: ['deviceCategory'],
                metrics: ['activeUsers', 'sessions', 'engagementRate'],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
            },
            // 2. Country
            {
                dateRanges: [{ startDate, endDate }],
                dimensions: ['country'],
                metrics: ['activeUsers', 'sessions'],
                limit: 10,
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
            },
            // 3. Engagement (Average overall)
            {
                dateRanges: [{ startDate, endDate }],
                metrics: ['averageSessionDuration', 'engagementRate']
            }
        ]
    });

    const reports = response.reports || [];

    return {
        devices: formatRows(reports[0]),
        countries: formatRows(reports[1]),
        engagement: formatRows(reports[2])
    };
}

export async function getAudienceSegments(
    propertyId: string,
    startDate: string,
    endDate: string,
    accountId?: string
) {
    const response = await batchQueryAnalytics({
        propertyId,
        accountId,
        requests: [
            // 1. New vs Returning
            {
                dateRanges: [{ startDate, endDate }],
                dimensions: ['newVsReturning'],
                metrics: ['activeUsers', 'sessions'],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
            },
            // 2. Age Bracket (might be empty due to signals)
            {
                dateRanges: [{ startDate, endDate }],
                dimensions: ['userAgeBracket'],
                metrics: ['activeUsers'],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
            },
            // 3. OS
            {
                dateRanges: [{ startDate, endDate }],
                dimensions: ['operatingSystem'],
                metrics: ['activeUsers'],
                limit: 10,
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
            }
        ]
    });

    const reports = response.reports || [];

    return {
        newVsReturning: formatRows(reports[0]),
        ageBrackets: formatRows(reports[1]),
        operatingSystems: formatRows(reports[2])
    };
}

export async function getConversionFunnel(
    propertyId: string,
    startDate: string,
    endDate: string,
    eventName?: string,
    accountId?: string
) {
    const filter = eventName ? {
        filter: {
            fieldName: 'eventName',
            stringFilter: {
                matchType: 'EXACT',
                value: eventName
            }
        }
    } : undefined;

    // Top converting pages
    const pagesPromise = queryAnalytics({
        propertyId,
        accountId,
        startDate,
        endDate,
        dimensions: ['pagePath'],
        metrics: ['conversions', 'eventCount'],
        dimensionFilter: filter,
        limit: 20,
        orderBys: [{ metric: { metricName: 'conversions' }, desc: true }]
    });

    // Top events (if eventName is specified, this will just return that event, essentially verifying its stats)
    // If eventName is NOT specified, it returns top events.
    const eventsPromise = queryAnalytics({
        propertyId,
        accountId,
        startDate,
        endDate,
        dimensions: ['eventName'],
        metrics: ['eventCount', 'conversions', 'totalRevenue'],
        dimensionFilter: filter,
        limit: 20,
        orderBys: [{ metric: { metricName: 'conversions' }, desc: true }]
    });

    const [pages, events] = await Promise.all([pagesPromise, eventsPromise]);

    return {
        topConvertingPages: formatRows(pages),
        topEvents: formatRows(events)
    };
}
