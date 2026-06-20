export function formatRows(response: any) {
    if (!response || !response.rows) return [];
    return response.rows.map((row: any) => {
        const item: Record<string, any> = {};

        // Map dimensions
        response.dimensionHeaders?.forEach((header: any, index: number) => {
            item[header.name] = row.dimensionValues[index].value;
        });

        // Map metrics
        response.metricHeaders?.forEach((header: any, index: number) => {
            // Try to parse number, otherwise keep string
            const val = row.metricValues[index].value;
            const num = Number(val);
            item[header.name] = isNaN(num) ? val : num;
        });

        return item;
    });
}
