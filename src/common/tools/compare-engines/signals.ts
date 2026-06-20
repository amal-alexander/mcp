import { ComparisonRow } from "./types.js";

export function generateSignals(row: ComparisonRow): string[] {
  const signals: string[] = [];

  const google = row.google;
  const bing = row.bing;
  const deltas = row.deltas;

  const totalClicks = google.clicks + bing.clicks;
  const googleClickShare = deltas.click_share_google; // already computed

  // bing_opportunity
  // Google position ≤ 5
  // Bing position ≥ 10 (or unranked/0, assuming 0 means > 10 in terms of "badness")
  // Google clicks > 50
  if (google.position > 0 && google.position <= 5 && (bing.position >= 10 || bing.position === 0) && google.clicks > 50) {
    signals.push("bing_opportunity");
  }

  // google_dependency_risk
  // google_click_share ≥ 0.85
  // total_clicks > 100
  if (googleClickShare >= 0.85 && totalClicks > 100) {
    signals.push("google_dependency_risk");
  }

  // ctr_mismatch
  // abs(ctr_delta) ≥ 0.05
  // abs(position_delta) ≤ 2
  // We use standard Math.abs on the pre-calculated delta
  if (Math.abs(deltas.ctr_delta) >= 0.05 && Math.abs(deltas.position_delta) <= 2) {
    signals.push("ctr_mismatch");
  }

  // ranking_divergence
  // abs(position_delta) ≥ 7
  if (Math.abs(deltas.position_delta) >= 7) {
    signals.push("ranking_divergence");
  }

  return signals;
}
