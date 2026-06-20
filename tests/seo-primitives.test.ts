import { describe, it, expect } from 'vitest';
import {
    getRankingBucket,
    calculateTrafficDelta,
    isBrandQuery,
    isCannibalized
} from '../src/common/tools/seo-primitives';

describe('SEO Primitives', () => {

    describe('getRankingBucket', () => {
        it('should categorize positions correctly', () => {
            expect(getRankingBucket(1).bucket).toBe('Top 3');
            expect(getRankingBucket(3).bucket).toBe('Top 3');
            expect(getRankingBucket(4).bucket).toBe('Page 1 (4-10)');
            expect(getRankingBucket(10).bucket).toBe('Page 1 (4-10)');
            expect(getRankingBucket(11).bucket).toBe('Page 2 (11-20)');
            expect(getRankingBucket(20).bucket).toBe('Page 2 (11-20)');
            expect(getRankingBucket(21).bucket).toBe('Page 3+');
            expect(getRankingBucket(0).bucket).toBe('Unranked');
        });
    });

    describe('calculateTrafficDelta', () => {
        it('should calculate increase correctly', () => {
            const result = calculateTrafficDelta(150, 100);
            expect(result.status).toBe('increased');
            expect(result.absoluteChange).toBe(50);
            expect(result.percentChange).toBe(50);
        });

        it('should calculate decrease correctly', () => {
            const result = calculateTrafficDelta(50, 100);
            expect(result.status).toBe('decreased');
            expect(result.absoluteChange).toBe(-50);
            expect(result.percentChange).toBe(-50);
        });

        it('should handle new traffic (0 to >0)', () => {
            const result = calculateTrafficDelta(10, 0);
            expect(result.status).toBe('new');
            expect(result.percentChange).toBe(100);
        });

        it('should handle lost traffic (>0 to 0)', () => {
            const result = calculateTrafficDelta(0, 10);
            expect(result.status).toBe('lost');
            expect(result.percentChange).toBe(-100);
        });
    });

    it('should handle zero change (same > 0)', () => {
        const result = calculateTrafficDelta(10, 10);
        expect(result.status).toBe('unchanged');
        expect(result.percentChange).toBe(0);
    });

    it('should handle zero change (0 to 0)', () => {
        const result = calculateTrafficDelta(0, 0);
        expect(result.status).toBe('unchanged');
        expect(result.percentChange).toBe(0);
    });
});

describe('isBrandQuery', () => {
    it('should identify brand queries', () => {
        expect(isBrandQuery('acme widgets', 'acme').isBrand).toBe(true);
        expect(isBrandQuery('buy widgets', 'acme').isBrand).toBe(false);
        expect(isBrandQuery('ACME corp', 'acme').isBrand).toBe(true); // Case insensitive
    });

    it('should return false for invalid regex', () => {
        expect(isBrandQuery('test', '[').isBrand).toBe(false);
    });
});

describe('isCannibalized', () => {
    it('should detect cannibalization when positions are close and traffic split', () => {
        // Strong conflict: Pos 5 vs Pos 6, roughly equal traffic
        const result = isCannibalized('query',
            { position: 5, impressions: 1000, clicks: 50 },
            { position: 6, impressions: 900, clicks: 45 }
        );
        expect(result.isCannibalized).toBe(true);
        expect(result.overlapScore).toBeGreaterThan(0.5);
        expect(result.recommendation).toContain('Review content intent');
    });

    it('should detect winner scenario (Page A)', () => {
        const result = isCannibalized('query',
            { position: 3, impressions: 2000, clicks: 500 },
            { position: 4, impressions: 1000, clicks: 10 }
        );
        // Even if cannibalized score triggers, recommendation should favor A
        // We force a high overlap score setup but clear click winner
        const result2 = isCannibalized('query',
            { position: 5, impressions: 1000, clicks: 200 },
            { position: 5, impressions: 1000, clicks: 20 }
        );
        expect(result2.recommendation).toContain('Consolidate to Page A');
    });

    it('should detect winner scenario (Page B)', () => {
        const result = isCannibalized('query',
            { position: 5, impressions: 1000, clicks: 20 },
            { position: 5, impressions: 1000, clicks: 200 }
        );
        expect(result.recommendation).toContain('Consolidate to Page B');
    });

    it('should handle zero impressions without crashing', () => {
        const result = isCannibalized('query',
            { position: 5, impressions: 0, clicks: 0 },
            { position: 5, impressions: 0, clicks: 0 }
        );
        expect(result.overlapScore).toBe(0);
    });

    it('should NOT detect cannibalization when positions are far apart', () => {
        // Weak conflict: Pos 1 vs Pos 50
        const result = isCannibalized('query',
            { position: 1, impressions: 1000, clicks: 200 },
            { position: 50, impressions: 10, clicks: 0 }
        );
        expect(result.isCannibalized).toBe(false);
        expect(result.overlapScore).toBeLessThan(0.3);
        expect(result.recommendation).toBe('No action needed.');
    });
});


