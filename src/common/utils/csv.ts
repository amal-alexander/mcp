/**
 * Convert an array of flat JSON objects to a CSV string.
 * Automatically handles escaping of double quotes and commas.
 */
export function jsonToCsv(data: Record<string, any>[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  // Get all unique headers from all objects
  const headerSet = new Set<string>();
  for (const row of data) {
    if (row && typeof row === 'object') {
      Object.keys(row).forEach(key => headerSet.add(key));
    }
  }
  const headers = Array.from(headerSet);

  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const val = row && typeof row === 'object' ? row[header] : undefined;
      const stringVal = val === undefined || val === null ? '' : String(val);

      // Escape double quotes by doubling them
      const escaped = stringVal.replace(/"/g, '""');

      // Wrap in quotes if it contains comma, quote or newline
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        return `"${escaped}"`;
      }

      return escaped;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}
