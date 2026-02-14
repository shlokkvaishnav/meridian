import { db } from './db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export type { ContributorStats, RepositoryMetrics, TimeSeriesDataPoint } from './metricsTypes';
export { formatDuration } from './metricsTypes';
import { calculatePercentile } from './stats';
import type { ContributorStats, RepositoryMetrics, TimeSeriesDataPoint } from './metricsTypes';
import { calculateContributorRisk } from './risk';

/**
 * Get top contributors by PR count (scoped to ownerId)
 */
export async function getTopContributors(ownerId: string, limit: number = 10): Promise<ContributorStats[]> {
  // Get repositories for this owner
  const repos = await db.repository.findMany({
    where: { ownerId },
    select: { id: true },
  });

  const repoIds = repos.map((r) => r.id);
  if (repoIds.length === 0) return [];

  // Aggregate PR statistics by author
  const prStats = await db.pullRequest.groupBy({
    by: ['authorLogin'],
    where: {
      repositoryId: { in: repoIds },
    },
    _count: { id: true },
    _sum: {
      linesAdded: true,
      linesDeleted: true,
    },
  });

  // Get merged stats
  const mergedStats = await db.pullRequest.groupBy({
    by: ['authorLogin'],
    where: {
      state: 'MERGED',
      repositoryId: { in: repoIds },
    },
    _count: { id: true },
    _avg: { timeToMerge: true },
  });

  // Get review stats
  const reviewStats = await db.review.groupBy({
    by: ['reviewerLogin'],
    where: {
      pullRequest: { repositoryId: { in: repoIds } },
    },
    _count: { id: true },
  });

  // Build the map
  const contributorMap = new Map<string, ContributorStats>();

  for (const stat of prStats) {
    contributorMap.set(stat.authorLogin, {
      login: stat.authorLogin,
      avatarUrl: `https://avatars.githubusercontent.com/${stat.authorLogin}`,
      prsOpened: stat._count.id,
      prsMerged: 0,
      reviewsGiven: 0,
      linesAdded: stat._sum.linesAdded || 0,
      linesDeleted: stat._sum.linesDeleted || 0,
      avgTimeToMerge: null,
      riskScore: 0,
    });
  }

  for (const stat of mergedStats) {
    const existing = contributorMap.get(stat.authorLogin);
    if (existing) {
      existing.prsMerged = stat._count.id;
      existing.avgTimeToMerge = stat._avg.timeToMerge ? Math.round(stat._avg.timeToMerge) : null;
    }
  }

  for (const stat of reviewStats) {
    const login = stat.reviewerLogin;
    const existing = contributorMap.get(login);
    if (existing) {
      existing.reviewsGiven = stat._count.id;
    } else {
      contributorMap.set(login, {
        login,
        avatarUrl: `https://avatars.githubusercontent.com/${login}`,
        prsOpened: 0,
        prsMerged: 0,
        reviewsGiven: stat._count.id,
        linesAdded: 0,
        linesDeleted: 0,
        avgTimeToMerge: null,
        riskScore: 0,
      });
    }
  }

  // Calculate risk scores and sort
  const allStats = Array.from(contributorMap.values());
  const maxPrs = Math.max(...allStats.map((s) => s.prsOpened), 0);
  const maxReviews = Math.max(...allStats.map((s) => s.reviewsGiven), 0);
  const validMergeTimes = allStats.map((s) => s.avgTimeToMerge).filter((t) => t !== null) as number[];
  const avgMergeTime =
    validMergeTimes.length > 0 ? validMergeTimes.reduce((a, b) => a + b, 0) / validMergeTimes.length : 0;

  return allStats
    .map((stat) => ({
      ...stat,
      riskScore: calculateContributorRisk(stat, { maxPrs, maxReviews, avgMergeTime }),
    }))
    .sort((a, b) => b.prsOpened * 2 + b.reviewsGiven - (a.prsOpened * 2 + a.reviewsGiven))
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

  const cycleTimeAgg = await db.pullRequest.aggregate({
    where: { repositoryId, state: 'MERGED', timeToMerge: { not: null } },
    _avg: { timeToMerge: true },
  });

  const timeToReviewAgg = await db.pullRequest.aggregate({
    where: { repositoryId, timeToFirstReview: { not: null } },
    _avg: { timeToFirstReview: true },
  });

  const cycleTimes = await db.pullRequest.findMany({
    where: { repositoryId, state: 'MERGED', timeToMerge: { not: null } },
    select: { timeToMerge: true },
    orderBy: { timeToMerge: 'asc' },
  });

  const times = cycleTimes.map((pr: { timeToMerge: number | null }) => pr.timeToMerge!);
  const p50CycleTime = times.length > 0 ? times[Math.floor(times.length * 0.5)] : null;
  const p75CycleTime = times.length > 0 ? times[Math.floor(times.length * 0.75)] : null;

  const timeToFirstReview = timeToReviewAgg._avg.timeToFirstReview
    ? Math.round(timeToReviewAgg._avg.timeToFirstReview)
    : null;

  return {
    repositoryId: repo.id,
    repositoryName: repo.name,
    totalPRs,
    mergedPRs,
    openPRs,
    avgCycleTime: cycleTimeAgg._avg.timeToMerge ? Math.round(cycleTimeAgg._avg.timeToMerge) : null,
    p50CycleTime,
    p75CycleTime,
    avgTimeToFirstReview: timeToFirstReview,
  };
}

/**
 * Get time-series data for the last N days (scoped to ownerId)
 */
export async function getTimeSeriesData(ownerId: string, days: number = 30): Promise<TimeSeriesDataPoint[]> {
  const startDate = subDays(new Date(), days);

  // Get repositories for this owner
  const repos = await db.repository.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const repoIds = repos.map((r) => r.id);

  const prs = await db.pullRequest.findMany({
    where: {
      createdAt: { gte: startDate },
      repositoryId: { in: repoIds },
    },
    select: {
      createdAt: true,
      mergedAt: true,
      timeToMerge: true,
    },
  });

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
    const createdPoint = dataByDate.get(createdDateStr);
    if (createdPoint) createdPoint.prsOpened++;

    if (pr.mergedAt) {
      const mergedDateStr = startOfDay(pr.mergedAt).toISOString().split('T')[0];
      const mergedPoint = dataByDate.get(mergedDateStr);
      if (mergedPoint) mergedPoint.prsMerged++;
    }
  }

  for (const [dateStr, point] of dataByDate.entries()) {
    const dayStart = new Date(dateStr);
    const dayEnd = endOfDay(dayStart);

    const mergedOnDay = prs.filter(
      (pr: { mergedAt: Date | null; timeToMerge: number | null }) =>
        pr.mergedAt && pr.mergedAt >= dayStart && pr.mergedAt <= dayEnd && pr.timeToMerge
    );

    if (mergedOnDay.length > 0) {
      const totalTime = mergedOnDay.reduce(
        (sum: number, pr: { timeToMerge: number | null }) => sum + (pr.timeToMerge || 0),
        0
      );
      point.avgCycleTime = Math.round(totalTime / mergedOnDay.length);
    }
  }

  return Array.from(dataByDate.values());
}

/**
 * Snapshot metrics for a specific repository for the current day
 */
export async function snapshotDailyMetrics(repositoryId: string): Promise<void> {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const [prsOpened, prsMerged, closedUnmerged] = await Promise.all([
    db.pullRequest.count({ where: { repositoryId, createdAt: { gte: dayStart, lte: dayEnd } } }),
    db.pullRequest.count({
      where: { repositoryId, state: 'MERGED', mergedAt: { gte: dayStart, lte: dayEnd } },
    }),
    db.pullRequest.count({
      where: { repositoryId, state: 'CLOSED', closedAt: { gte: dayStart, lte: dayEnd } },
    }),
  ]);

  const mergedToday = await db.pullRequest.findMany({
    where: {
      repositoryId,
      state: 'MERGED',
      mergedAt: { gte: dayStart, lte: dayEnd },
      timeToMerge: { not: null },
    },
    select: { timeToMerge: true },
  });

  const mergeTimes = mergedToday.map((pr: { timeToMerge: number | null }) => pr.timeToMerge!);
  const cycleTimeP50 = calculatePercentile(mergeTimes, 0.5);
  const cycleTimeP95 = calculatePercentile(mergeTimes, 0.95);

  const totalClosed = prsMerged + closedUnmerged;
  const mergeRate = totalClosed > 0 ? prsMerged / totalClosed : null;

  await db.metricSnapshot.upsert({
    where: { repositoryId_date: { repositoryId, date: dayStart } },
    update: { prsOpened, prsMerged, cycleTimeP50, cycleTimeP95, mergeRate },
    create: { repositoryId, date: dayStart, prsOpened, prsMerged, cycleTimeP50, cycleTimeP95, mergeRate },
  });
}
