import { CompareEnginesOptions, CompareEnginesResult } from "./types.js";
import { fetchGoogleData, fetchBingData } from "./adapters.js";
import { normalizeGoogleRows, normalizeBingRows } from "./normalizer.js";
import { compareRows } from "./comparator.js";
import { generateSignals } from "./signals.js";

export async function compareEngines(options: CompareEnginesOptions): Promise<CompareEnginesResult> {
  // 1. Fetch raw data in parallel
  const [googleRaw, bingRaw] = await Promise.all([
    fetchGoogleData(options),
    fetchBingData(options)
  ]);

  // 2. Normalize
  const googleNormalized = normalizeGoogleRows(googleRaw);
  const bingNormalized = normalizeBingRows(bingRaw);

  // 3. Compare
  const { rows, summary } = compareRows(googleNormalized, bingNormalized);

  // 4. Generate Signals and Filter
  const minImpressions = options.minImpressions || 0;
  const minClicks = options.minClicks || 0;

  const enrichedRows = rows
    .filter(row => {
      const maxImpressions = Math.max(row.google.impressions, row.bing.impressions);
      const maxClicks = Math.max(row.google.clicks, row.bing.clicks);

      return maxImpressions >= minImpressions && maxClicks >= minClicks;
    })
    .map(row => {
      row.signals = generateSignals(row);
      return row;
    });

  return {
    siteUrl: options.siteUrl,
    dimension: options.dimension,
    startDate: options.startDate,
    endDate: options.endDate,
    summary,
    rows: enrichedRows
  };
}
