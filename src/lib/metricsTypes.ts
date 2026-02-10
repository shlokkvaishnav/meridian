/**
 * Client-safe types and utilities for metrics.
 * These are separated from metrics.ts to avoid pulling in server-only
 * dependencies (db, pg) into client-side bundles.
 */

export interface ContributorStats {
  login: string;
  avatarUrl: string | null;
  prsOpened: number;
  prsMerged: number;
  reviewsGiven: number;
  linesAdded: number;
  linesDeleted: number;
  avgTimeToMerge: number | null; // minutes
}

export interface RepositoryMetrics {
  repositoryId: string;
  repositoryName: string;
  totalPRs: number;
  mergedPRs: number;
  openPRs: number;
  avgCycleTime: number | null; // minutes
  p50CycleTime: number | null;
  p75CycleTime: number | null;
  avgTimeToFirstReview: number | null;
}

export interface TimeSeriesDataPoint {
  date: string;
  prsOpened: number;
  prsMerged: number;
  avgCycleTime: number | null;
}

/**
 * Format minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }

  return `${days}d`;
}
