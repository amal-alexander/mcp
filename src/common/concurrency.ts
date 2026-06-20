/**
 * Limit the number of concurrent executions of an async mapping function.
 *
 * @param items - The array of items to process.
 * @param limit - The maximum number of concurrent executions.
 * @param fn - The async function to execute for each item.
 * @returns A promise that resolves to an array of results.
 */
export async function limitConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results: Promise<R>[] = [];
    const executing = new Set<Promise<void>>();

    for (const item of items) {
        const p = fn(item);
        results.push(p);

        const e: Promise<void> = p.then(
            () => { executing.delete(e); },
            () => { executing.delete(e); }
        );
        executing.add(e);

        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }

    return Promise.all(results);
}
