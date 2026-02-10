import { db } from './db';
import { subDays, differenceInDays } from 'date-fns';

export type InsightType = 'WARNING' | 'CAUTION' | 'INFO' | 'SUCCESS';
export type InsightCategory = 
  | 'BOTTLENECK' 
  | 'WORKLOAD' 
  | 'VELOCITY' 
  | 'COLLABORATION' 
  | 'QUALITY';

export interface Insight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  action?: string;
  metric?: {
    value: number | string;
    label: string;
  };
  affectedContributors?: string[];
  priority: number; // 1-10, higher = more important
}

/**
 * Generate insights from PR data using rule-based analysis
 */
export async function generateInsights(): Promise<Insight[]> {
  const insights: Insight[] = [];

  // Fetch data needed for analysis
  const pullRequests = await db.pullRequest.findMany({
    include: {
      repository: true,
      reviews: true,
    },
  });

  const recentPRs = pullRequests.filter(
    (pr) => differenceInDays(new Date(), pr.createdAt) <= 30
  );

  // Run all insight rules
  insights.push(...detectReviewBottlenecks(recentPRs));
  insights.push(...detectCycleTimeIssues(recentPRs));
  insights.push(...detectWorkloadImbalance(recentPRs));
  insights.push(...detectBurnoutSignals(recentPRs));
  insights.push(...detectStalePRs(pullRequests));
  insights.push(...detectReviewCapacityIssues(recentPRs));
  insights.push(...detectPositivePatterns(recentPRs));

  // Sort by priority
  return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * Rule: Detect PRs waiting too long for reviews
 */
function detectReviewBottlenecks(prs: any[]): Insight[] {
  const insights: Insight[] = [];
  
  const openPRs = prs.filter((pr) => pr.state === 'OPEN');
  const avgTimeToFirstReview =
    prs
      .filter((pr) => pr.timeToFirstReview)
      .reduce((sum, pr) => sum + pr.timeToFirstReview!, 0) /
      Math.max(1, prs.filter((pr) => pr.timeToFirstReview).length) || 0;

  // Check for PRs waiting much longer than average
  const slowReviewPRs = openPRs.filter(
    (pr) =>
      !pr.reviews.length &&
      differenceInDays(new Date(), pr.createdAt) * 24 * 60 > avgTimeToFirstReview * 2
  );

  if (slowReviewPRs.length > 0) {
    insights.push({
      id: 'review-bottleneck-1',
      type: 'WARNING',
      category: 'BOTTLENECK',
      title: 'Review Bottleneck Detected',
      description: `${slowReviewPRs.length} PRs waiting significantly longer than average for first review`,
      action: 'Review these PRs or redistribute review assignments',
      metric: {
        value: slowReviewPRs.length,
        label: 'PRs waiting',
      },
      priority: 9,
    });
  }

  // Check overall review delay
  if (avgTimeToFirstReview > 2 * 24 * 60) {
    // > 2 days
    const hours = Math.round(avgTimeToFirstReview / 60);
    insights.push({
      id: 'review-bottleneck-2',
      type: 'CAUTION',
      category: 'VELOCITY',
      title: 'Slow Review Response Time',
      description: `Average time to first review is ${hours} hours`,
      action: 'Consider increasing review capacity',
      metric: {
        value: `${hours}h`,
        label: 'Avg time to first review',
      },
      priority: 7,
    });
  }

  return insights;
}

/**
 * Rule: Detect increasing cycle times
 */
function detectCycleTimeIssues(prs: any[]): Insight[] {
  const insights: Insight[] = [];

  const mergedPRs = prs.filter((pr) => pr.state === 'MERGED' && pr.timeToMerge);

  if (mergedPRs.length < 5) return insights;

  // Split into recent and older
  const recentCutoff = subDays(new Date(), 7);
  const recentMerged = mergedPRs.filter((pr) => pr.mergedAt! >= recentCutoff);
  const olderMerged = mergedPRs.filter((pr) => pr.mergedAt! < recentCutoff);

  if (recentMerged.length === 0 || olderMerged.length === 0) return insights;

  const recentAvg =
    recentMerged.reduce((sum, pr) => sum + pr.timeToMerge!, 0) / recentMerged.length;
  const olderAvg =
    olderMerged.reduce((sum, pr) => sum + pr.timeToMerge!, 0) / olderMerged.length;

  const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (percentChange > 50) {
    insights.push({
      id: 'cycle-time-1',
      type: 'WARNING',
      category: 'VELOCITY',
      title: 'Cycle Time Increased Significantly',
      description: `Cycle time increased ${percentChange.toFixed(0)}% compared to previous period`,
      action: 'Investigate blockers or review capacity issues',
      metric: {
        value: `+${percentChange.toFixed(0)}%`,
        label: 'Increase',
      },
      priority: 8,
    });
  }

  return insights;
}

/**
 * Rule: Detect workload imbalance among contributors
 */
function detectWorkloadImbalance(prs: any[]): Insight[] {
  const insights: Insight[] = [];

  // Count PRs per author
  const prsByAuthor = new Map<string, number>();
  prs.forEach((pr) => {
    prsByAuthor.set(pr.authorLogin, (prsByAuthor.get(pr.authorLogin) || 0) + 1);
  });

  const counts = Array.from(prsByAuthor.values());
  if (counts.length < 2) return insights;

  const avg = counts.reduce((sum, c) => sum + c, 0) / counts.length;
  const max = Math.max(...counts);

  // If someone has >3x the average
  if (max > avg * 3) {
    const heavyContributor = Array.from(prsByAuthor.entries()).find(
      ([_, count]) => count === max
    );

    if (heavyContributor) {
      insights.push({
        id: 'workload-1',
        type: 'CAUTION',
        category: 'WORKLOAD',
        title: 'Workload Imbalance Detected',
        description: `${heavyContributor[0]} has ${max} PRs (${((max / avg - 1) * 100).toFixed(0)}% above average)`,
        action: 'Consider redistributing work or checking for blockers',
        affectedContributors: [heavyContributor[0]],
        priority: 6,
      });
    }
  }

  return insights;
}

/**
 * Rule: Detect potential burnout signals
 */
function detectBurnoutSignals(prs: any[]): Insight[] {
  const insights: Insight[] = [];

  // Check for weekend commits (simplified - assumes createdAt reflects work time)
  const weekendPRs = prs.filter((pr) => {
    const day = pr.createdAt.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  });

  const weekendRatio = weekendPRs.length / Math.max(1, prs.length);

  if (weekendRatio > 0.3 && prs.length > 10) {
    insights.push({
      id: 'burnout-1',
      type: 'CAUTION',
      category: 'WORKLOAD',
      title: 'High Weekend Activity',
      description: `${(weekendRatio * 100).toFixed(0)}% of PRs created on weekends`,
      action: 'Check team workload and work-life balance',
      metric: {
        value: `${(weekendRatio * 100).toFixed(0)}%`,
        label: 'Weekend PRs',
      },
      priority: 7,
    });
  }

  return insights;
}

/**
 * Rule: Detect stale PRs
 */
function detectStalePRs(prs: any[]): Insight[] {
  const insights: Insight[] = [];

  const stalePRs = prs.filter(
    (pr) => pr.state === 'OPEN' && differenceInDays(new Date(), pr.updatedAt) > 14
  );

  if (stalePRs.length > 0) {
    insights.push({
      id: 'stale-1',
      type: 'INFO',
      category: 'QUALITY',
      title: 'Stale Pull Requests',
      description: `${stalePRs.length} PRs haven't been updated in 14+ days`,
      action: 'Close or revive these PRs',
      metric: {
        value: stalePRs.length,
        label: 'Stale PRs',
      },
      priority: 5,
    });
  }

  return insights;
}

/**
 * Rule: Detect review capacity issues
 */
function detectReviewCapacityIssues(prs: any[]): Insight[] {
  const insights: Insight[] = [];

  const openPRs = prs.filter((pr) => pr.state === 'OPEN');

  if (openPRs.length > 15) {
    insights.push({
      id: 'capacity-1',
      type: 'WARNING',
      category: 'BOTTLENECK',
      title: 'High Open PR Count',
      description: `${openPRs.length} open PRs may indicate review capacity issues`,
      action: 'Increase review bandwidth or prioritize critical PRs',
      metric: {
        value: openPRs.length,
        label: 'Open PRs',
      },
      priority: 8,
    });
  }

  return insights;
}

/**
 * Rule: Detect positive patterns worth celebrating
 */
function detectPositivePatterns(prs: any[]): Insight[] {
  const insights: Insight[] = [];

  const mergedPRs = prs.filter((pr) => pr.state === 'MERGED' && pr.timeToMerge);

  if (mergedPRs.length > 0) {
    const avgCycleTime =
      mergedPRs.reduce((sum, pr) => sum + pr.timeToMerge!, 0) / mergedPRs.length;

    // If avg cycle time is under 1 day
    if (avgCycleTime < 24 * 60) {
      const hours = Math.round(avgCycleTime / 60);
      insights.push({
        id: 'positive-1',
        type: 'SUCCESS',
        category: 'VELOCITY',
        title: 'Excellent Cycle Time',
        description: `Team is merging PRs in ${hours} hours on average`,
        action: 'Keep up the great work!',
        metric: {
          value: `${hours}h`,
          label: 'Avg cycle time',
        },
        priority: 3,
      });
    }
  }

  // High merge rate
  const mergeRate = mergedPRs.length / Math.max(1, prs.length);
  if (mergeRate > 0.8 && prs.length > 10) {
    insights.push({
      id: 'positive-2',
      type: 'SUCCESS',
      category: 'QUALITY',
      title: 'High Merge Rate',
      description: `${(mergeRate * 100).toFixed(0)}% of PRs are being merged`,
      action: 'Great collaboration and code quality!',
      priority: 2,
    });
  }

  return insights;
}
