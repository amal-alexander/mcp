export interface IndexNowPayload {
    host: string;
    key: string;
    keyLocation?: string;
    urlList: string[];
}

/**
 * Submit URLs via IndexNow API.
 * 
 * @param options - IndexNow configuration and URL list.
 * @returns Success message.
 */
export async function submitIndexNow(options: IndexNowPayload): Promise<string> {
    const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`IndexNow submission failed: ${response.status} ${error}`);
    }

    return `Successfully submitted ${options.urlList.length} URLs to IndexNow for host ${options.host}`;
}
