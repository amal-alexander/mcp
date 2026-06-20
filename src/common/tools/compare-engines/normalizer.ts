import { searchconsole_v1 } from "googleapis";
import { BingQueryStats, BingPageStats } from "../../../bing/client.js";
import { NormalizedRow } from "./types.js";

export function normalizeGoogleRows(rows: searchconsole_v1.Schema$ApiDataRow[]): NormalizedRow[] {
  return rows.map(row => ({
    key: row.keys && row.keys.length > 0 ? row.keys[0] : "",
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
    engine: "google" as const
  })).filter(row => row.key !== ""); // Filter out rows without key
}

export function normalizeBingRows(rows: (BingQueryStats | BingPageStats)[]): NormalizedRow[] {
  return rows.map(row => ({
    key: row.Query || "",
    clicks: row.Clicks || 0,
    impressions: row.Impressions || 0,
    ctr: row.CTR || 0,
    position: row.AvgPosition || 0,
    engine: "bing" as const
  })).filter(row => row.key !== ""); // Filter out rows without key
}
