export type Engine = "google" | "bing";

export interface NormalizedRow {
  key: string; // query/page/device/country value
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  engine: Engine;
}

export interface EngineStats {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface Deltas {
  position_delta: number;
  ctr_delta: number;
  click_share_google: number;
}

export interface ComparisonRow {
  key: string;
  google: EngineStats;
  bing: EngineStats;
  deltas: Deltas;
  signals: string[];
}

export interface ComparisonSummary {
  total_keys: number;
  google_total_clicks: number;
  bing_total_clicks: number;
  google_dependency_score: number;
}

export interface CompareEnginesOptions {
  siteUrl: string;
  dimension: "query" | "page" | "country" | "device";
  startDate: string;
  endDate: string;
  minImpressions?: number;
  minClicks?: number;
  limit?: number;
  offset?: number;
}

export interface CompareEnginesResult {
  siteUrl: string;
  dimension: string;
  startDate: string;
  endDate: string;
  summary: ComparisonSummary;
  rows: ComparisonRow[];
}

export interface GA4Stats {
    sessions: number;
    bounceRate: number;
    engagementRate: number;
    averageSessionDuration: number;
    conversions: number;
    activeUsers?: number;
    eventCount?: number;
    revenue?: number;
}

export interface PageAnalysisRow {
    url: string;
    gsc?: EngineStats;
    ga4?: GA4Stats;
    clickToSessionRatio?: number;
    opportunityScore?: number;
}

export interface TrafficHealthRow {
    date: string;
    gscClicks: number;
    ga4OrganicSessions: number;
    ratio: number;
    classification: 'Healthy' | 'Tracking Gap' | 'Filter Issue';
    recommendation: string;
}

export interface OpportunityMatrixRow {
    url: string;
    query?: string;
    gsc: EngineStats;
    bing?: EngineStats;
    ga4?: GA4Stats;
    priorityScore: number;
    action: string;
    category: 'Quick Win' | 'Content Fix' | 'Bing Opportunity';
}

export interface BrandAnalysisRow {
    platform: 'Google' | 'Bing' | 'GA4';
    brandMetrics: {
        clicks?: number;
        impressions?: number;
        sessions?: number;
    };
    nonBrandMetrics: {
        clicks?: number;
        impressions?: number;
        sessions?: number;
    };
    brandShare: number;
}
