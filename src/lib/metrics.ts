import { db } from './db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

// Re-export types and utilities for backward compatibility
export type { ContributorStats, RepositoryMetrics, TimeSeriesDataPoint } from './metricsTypes';
export { formatDuration } from './metricsTypes';

// Import types for use in this file
import type { ContributorStats, RepositoryMetrics, TimeSeriesDataPoint } from './metricsTypes';

/**
 * Get top contributors by PR count
 * Optimized to use DB aggregation where possible
 */
export async function getTopContributors(limit: number = 10): Promise<ContributorStats[]> {
  // Aggregate PR statistics by author
  const prStats = await db.pullRequest.groupBy({
    by: ['authorLogin'],
    _count: {
      id: true, // Total PRs
    },
    _sum: {
      linesAdded: true,
      linesDeleted: true,
    },
  });

  // Get merged stats separately (Prisma doesn't support conditional count in groupBy yet)
  const mergedStats = await db.pullRequest.groupBy({
    by: ['authorLogin'],
    where: { state: 'MERGED' },
    _count: {
      id: true, // Merged PRs
    },
    _avg: {
      timeToMerge: true,
    },
  });

  // Get review stats
  const reviewStats = await db.review.groupBy({
    by: ['reviewerLogin'],
    _count: {
      id: true, // Reviews given
    },
  });

  // Build the map
  const contributorMap = new Map<string, ContributorStats>();

  // Process PR stats
  for (const stat of prStats) {
    contributorMap.set(stat.authorLogin, {
      login: stat.authorLogin,
      avatarUrl: `https://avatars.githubusercontent.com/${stat.authorLogin}`, // Construct avatar URL
      prsOpened: stat._count.id,
      prsMerged: 0,
      reviewsGiven: 0,
      linesAdded: stat._sum.linesAdded || 0,
      linesDeleted: stat._sum.linesDeleted || 0,
      avgTimeToMerge: null,
    });
  }

  // Process merged stats
  for (const stat of mergedStats) {
    const existing = contributorMap.get(stat.authorLogin);
    if (existing) {
      existing.prsMerged = stat._count.id;
      existing.avgTimeToMerge = stat._avg.timeToMerge ? Math.round(stat._avg.timeToMerge) : null;
    }
  }

  // Process review stats
  for (const stat of reviewStats) {
    const login = stat.reviewerLogin;
    const existing = contributorMap.get(login);
    if (existing) {
      existing.reviewsGiven = stat._count.id;
    } else {
      // Review-only contributor
      contributorMap.set(login, {
        login: login,
        avatarUrl: `https://avatars.githubusercontent.com/${login}`,
        prsOpened: 0,
        prsMerged: 0,
        reviewsGiven: stat._count.id,
        linesAdded: 0,
        linesDeleted: 0,
        avgTimeToMerge: null,
      });
    }
  }

  // Sort by activity (weighted score: PRs * 2 + Reviews)
  return Array.from(contributorMap.values())
    .sort((a, b) => (b.prsOpened * 2 + b.reviewsGiven) - (a.prsOpened * 2 + a.reviewsGiven))
    .slice(0, limit);
}

/**
 * Get metrics for a specific repository
 */
export async function getRepositoryMetrics(repositoryId: string): Promise<RepositoryMetrics | null> {
  const repo = await db.repository.findUnique({
    where: { id: repositoryId },
    select: { name: true, id: true },
  });

  if (!repo) return null;

  const [totalPRs, mergedPRs, openPRs] = await Promise.all([
    db.pullRequest.count({ where: { repositoryId } }),
    db.pullRequest.count({ where: { repositoryId, state: 'MERGED' } }),
    db.pullRequest.count({ where: { repositoryId, state: 'OPEN' } }),
  ]);

  // Cycle time stats
  const cycleTimeAgg = await db.pullRequest.aggregate({
    where: { repositoryId, state: 'MERGED', timeToMerge: { not: null } },
    _avg: { timeToMerge: true },
  });

  // Time to first review
  const timeToReviewAgg = await db.pullRequest.aggregate({
    where: { repositoryId, timeToFirstReview: { not: null } },
    _avg: { timeToFirstReview: true },
  });

  // For P50/P75, we still need to fetch values, but we can select ONLY the relevant field
  // and only for merged PRs, which is much smaller than fetching everything
  const cycleTimes = await db.pullRequest.findMany({
    where: { repositoryId, state: 'MERGED', timeToMerge: { not: null } },
    select: { timeToMerge: true },
    orderBy: { timeToMerge: 'asc' },
  });

  const times = cycleTimes.map((pr) => pr.timeToMerge!);
  const p50CycleTime = times.length > 0 ? times[Math.floor(times.length * 0.5)] : null;
  const p75CycleTime = times.length > 0 ? times[Math.floor(times.length * 0.75)] : null;

  return {
    repositoryId: repo.id,
    repositoryName: repo.name,
    totalPRs,
    mergedPRs,
    openPRs,
    avgCycleTime: cycleTimeAgg._avg.timeToMerge ? Math.round(cycleTimeAgg._avg.timeToMerge) : null,
    p50CycleTime,
    p75CycleTime,
    avgTimeToFirstReview: timeToReviewAgg._avg.timeToFirstReview ? Math.round(timeToReviewAgg._avg.timeToFirstReview) : null,
  };
}

/**
 * Get time-series data for the last N days
 */
export async function getTimeSeriesData(days: number = 30): Promise<TimeSeriesDataPoint[]> {
  const startDate = subDays(new Date(), days);

  // Fetch only necessary fields for aggregation
  const prs = await db.pullRequest.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      mergedAt: true,
      timeToMerge: true,
    },
  });

  // Since we need daily bucketing and logic involves both createdAt and mergedAt,
  // in-memory aggregation is acceptable here IF we only fetch the 3 fields above.
  // The dataset is unlikely to be massive for 30 days unless there are 10k+ PRs/month.

  const dataByDate = new Map<string, TimeSeriesDataPoint>();

  // Initialize map
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

  // Fill data
  for (const pr of prs) {
    const createdDateStr = startOfDay(pr.createdAt).toISOString().split('T')[0];
    const createdPoint = dataByDate.get(createdDateStr);
    if (createdPoint) createdPoint.prsOpened++;

    if (pr.mergedAt) {
      const mergedDateStr = startOfDay(pr.mergedAt).toISOString().split('T')[0];
      const mergedPoint = dataByDate.get(mergedDateStr);
      if (mergedPoint) mergedPoint.prsMerged++;
    }
  }

  // Calculate cycle time (needs careful bucketing)
  // Re-iterate to calculate avg cycle time for *merge date*
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
