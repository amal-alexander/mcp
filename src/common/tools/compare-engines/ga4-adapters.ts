import { GA4Stats } from './types.js';

export function normalizeGA4Row(row: Record<string, any>): GA4Stats {
    return {
        sessions: Number(row.sessions || 0),
        bounceRate: Number(row.bounceRate || 0),
        engagementRate: Number(row.engagementRate || 0),
        averageSessionDuration: Number(row.averageSessionDuration || 0),
        conversions: Number(row.conversions || 0),
        activeUsers: row.activeUsers !== undefined ? Number(row.activeUsers) : undefined,
        eventCount: row.eventCount !== undefined ? Number(row.eventCount) : undefined,
        revenue: row.totalRevenue !== undefined ? Number(row.totalRevenue) : undefined
    };
}
