/**
 * Shared utilities for cross-platform comparison tools.
 */

/**
 * Normalizes a URL by extracting the pathname and search string.
 * This ensures consistency when joining data from different platforms
 * that might report URLs differently (e.g. with or without domain).
 * 
 * @param url The full URL or path to normalize
 * @returns The normalized path (pathname + search)
 */
export function extractUrlPath(url: string): string {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search;
    } catch (e) {
        // Fallback for cases where input is already a path or invalid URL
        return url;
    }
}

/**
 * Extracts the base pathname without the query string.
 * 
 * @param url The full URL or path
 * @returns The pathname only
 */
export function extractBasePropertyName(url: string): string {
    const path = extractUrlPath(url);
    return path.split('?')[0];
}
