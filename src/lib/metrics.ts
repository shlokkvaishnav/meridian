import { db } from './db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

// Re-export types and utilities for backward compatibility
export type { ContributorStats, RepositoryMetrics, TimeSeriesDataPoint } from './metricsTypes';
export { formatDuration } from './metricsTypes';

// Import types for use in this file
import type { ContributorStats, RepositoryMetrics, TimeSeriesDataPoint } from './metricsTypes';

/**
 * Get top contributors by PR count
 */
export async function getTopContributors(limit: number = 10): Promise<ContributorStats[]> {
  const prs = await db.pullRequest.findMany({
    select: {
      authorLogin: true,
      authorAvatarUrl: true,
      state: true,
      linesAdded: true,
      linesDeleted: true,
      timeToMerge: true,
    },
  });

  const reviews = await db.review.findMany({
    select: {
      reviewerLogin: true,
    },
  });

  // Group by contributor
  const contributorMap = new Map<string, ContributorStats>();

  for (const pr of prs) {
    const existing = contributorMap.get(pr.authorLogin) || {
      login: pr.authorLogin,
      avatarUrl: pr.authorAvatarUrl,
      prsOpened: 0,
      prsMerged: 0,
      reviewsGiven: 0,
      linesAdded: 0,
      linesDeleted: 0,
      avgTimeToMerge: null,
    };

    existing.prsOpened++;
    if (pr.state === 'MERGED') {
      existing.prsMerged++;
    }
    existing.linesAdded += pr.linesAdded;
    existing.linesDeleted += pr.linesDeleted;

    contributorMap.set(pr.authorLogin, existing);
  }

  // Add review counts
  for (const review of reviews) {
    const existing = contributorMap.get(review.reviewerLogin) || {
      login: review.reviewerLogin,
      avatarUrl: null,
      prsOpened: 0,
      prsMerged: 0,
      reviewsGiven: 0,
      linesAdded: 0,
      linesDeleted: 0,
      avgTimeToMerge: null,
    };

    existing.reviewsGiven++;
    contributorMap.set(review.reviewerLogin, existing);
  }

  // Calculate avg time to merge for each contributor
  for (const [login, stats] of contributorMap.entries()) {
    const mergedPRs = prs.filter(
      (pr) => pr.authorLogin === login && pr.state === 'MERGED' && pr.timeToMerge
    );

    if (mergedPRs.length > 0) {
      const totalTime = mergedPRs.reduce((sum, pr) => sum + (pr.timeToMerge || 0), 0);
      stats.avgTimeToMerge = Math.round(totalTime / mergedPRs.length);
    }
  }

  // Sort by total PR count and take top N
  return Array.from(contributorMap.values())
    .sort((a, b) => b.prsOpened - a.prsOpened)
    .slice(0, limit);
}

/**
 * Get metrics for a specific repository
 */
export async function getRepositoryMetrics(repositoryId: string): Promise<RepositoryMetrics | null> {
  const repo = await db.repository.findUnique({
    where: { id: repositoryId },
    include: {
      pullRequests: true,
    },
  });

  if (!repo) return null;

  const totalPRs = repo.pullRequests.length;
  const mergedPRs = repo.pullRequests.filter((pr) => pr.state === 'MERGED').length;
  const openPRs = repo.pullRequests.filter((pr) => pr.state === 'OPEN').length;

  // Cycle time (time to merge)
  const mergedWithTime = repo.pullRequests.filter(
    (pr) => pr.state === 'MERGED' && pr.timeToMerge
  );

  let avgCycleTime = null;
  let p50CycleTime = null;
  let p75CycleTime = null;

  if (mergedWithTime.length > 0) {
    const times = mergedWithTime.map((pr) => pr.timeToMerge!).sort((a, b) => a - b);
    avgCycleTime = Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
    p50CycleTime = times[Math.floor(times.length * 0.5)];
    p75CycleTime = times[Math.floor(times.length * 0.75)];
  }

  // Time to first review
  const withFirstReview = repo.pullRequests.filter((pr) => pr.timeToFirstReview);
  const avgTimeToFirstReview =
    withFirstReview.length > 0
      ? Math.round(
          withFirstReview.reduce((sum, pr) => sum + pr.timeToFirstReview!, 0) /
            withFirstReview.length
        )
      : null;

  return {
    repositoryId: repo.id,
    repositoryName: repo.name,
    totalPRs,
    mergedPRs,
    openPRs,
    avgCycleTime,
    p50CycleTime,
    p75CycleTime,
    avgTimeToFirstReview,
  };
}

/**
 * Get time-series data for the last N days
 */
export async function getTimeSeriesData(days: number = 30): Promise<TimeSeriesDataPoint[]> {
  const startDate = subDays(new Date(), days);

  const prs = await db.pullRequest.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
      mergedAt: true,
      timeToMerge: true,
    },
  });

  // Group by date
  const dataByDate = new Map<string, TimeSeriesDataPoint>();

  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), days - i);
    const dateStr = startOfDay(date).toISOString().split('T')[0];

    dataByDate.set(dateStr, {
      date: dateStr,
      prsOpened: 0,
      prsMerged: 0,
      avgCycleTime: null,
    });
  }

  for (const pr of prs) {
    const createdDateStr = startOfDay(pr.createdAt).toISOString().split('T')[0];
    const point = dataByDate.get(createdDateStr);

    if (point) {
      point.prsOpened++;
    }

    if (pr.mergedAt) {
      const mergedDateStr = startOfDay(pr.mergedAt).toISOString().split('T')[0];
      const mergedPoint = dataByDate.get(mergedDateStr);
      if (mergedPoint) {
        mergedPoint.prsMerged++;
      }
    }
  }

  // Calculate avg cycle time per day
  for (const [dateStr, point] of dataByDate.entries()) {
    const dayStart = new Date(dateStr);
    const dayEnd = endOfDay(dayStart);

    const mergedOnDay = prs.filter(
      (pr) =>
        pr.mergedAt &&
        pr.mergedAt >= dayStart &&
        pr.mergedAt <= dayEnd &&
        pr.timeToMerge
    );

    if (mergedOnDay.length > 0) {
      const totalTime = mergedOnDay.reduce((sum, pr) => sum + (pr.timeToMerge || 0), 0);
      point.avgCycleTime = Math.round(totalTime / mergedOnDay.length);
    }
  }

  return Array.from(dataByDate.values());
}

