import { db } from '@/lib/db';
import { subDays, differenceInDays } from 'date-fns';
import { calculateMean, calculateStdDev, calculateZScore } from '../stats';
import { generateStrategicInsight } from '../ai';

export type InsightType = 'WARNING' | 'CAUTION' | 'INFO' | 'SUCCESS';
export type InsightCategory = 
  | 'BOTTLENECK' 
  | 'WORKLOAD' 
  | 'VELOCITY' 
  | 'COLLABORATION' 
  | 'QUALITY'
  | 'STRATEGIC';

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
/**
 * Generate insights from PR data using rule-based analysis
 */
import { unstable_cache } from 'next/cache';

/**
 * Generate insights from PR data using rule-based analysis
 */
export const generateInsights = unstable_cache(
  async (ownerId: string, authorLogin?: string): Promise<Insight[]> => {
    const insights: Insight[] = []; 
    // Fetch data needed for analysis (last 30 days only)
    const now = new Date();
    const startDate = subDays(now, 30);
  
    // Get repositories for this owner
    const repos = await db.repository.findMany({
      where: { ownerId },
      select: { id: true },
    });
    const repoIds = repos.map((r) => r.id);
  
    if (repoIds.length === 0) return insights;
  
    const pullRequests = await db.pullRequest.findMany({
      where: {
        createdAt: { gte: startDate },
        repositoryId: { in: repoIds },
        ...(authorLogin ? { authorLogin } : {}),
      },
      include: {
        repository: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  
    // Early return if no data
    if (pullRequests.length === 0) {
      return insights;
    }
  
    const recentPRs = pullRequests;
  
    // Run all insight rules (each is safe with empty arrays)
    try {
      insights.push(...detectReviewBottlenecks(recentPRs));
      insights.push(...detectCycleTimeIssues(recentPRs));
      insights.push(...detectWorkloadImbalance(recentPRs));
      insights.push(...detectBurnoutSignals(recentPRs));
      insights.push(...detectStalePRs(recentPRs));
      insights.push(...detectReviewCapacityIssues(recentPRs));
      insights.push(...detectPositivePatterns(recentPRs));
    } catch (error) {
      console.error('Error running insight rules:', error);
    }
  
    try {
      // Generate AI Strategic Insight if API key is present
      if (process.env.ANTHROPIC_API_KEY && insights.length > 0) {
        const strategicInsight = await generateStrategicInsight(insights, ownerId); // ownerId is used as proxy for login if needed, though strictly it's an ID
        if (strategicInsight) {
          insights.push({
            id: 'strategic-ai',
            ...strategicInsight
          });
        }
      }
    } catch (error) {
      console.error('Error generating AI strategic insight:', error);
    }
  
    // Sort by priority
    return insights.sort((a, b) => b.priority - a.priority);
  },
  ['dashboard-insights'],
  { revalidate: 1800, tags: ['dashboard-metrics'] }
);

/**
 * Rule: Detect PRs waiting too long for reviews (Z-Score > 2)
 */
function detectReviewBottlenecks(prs: any[]): Insight[] {
  const insights: Insight[] = [];
  if (prs.length === 0) return insights;
  
  const openPRs = prs.filter((pr) => pr.state === 'OPEN');
  
  // Calculate stats for TIME TO FIRST REVIEW for all PRs that have it
  const prsWithReviewTime = prs.filter((pr) => pr.timeToFirstReview != null && pr.timeToFirstReview > 0);
  
  if (prsWithReviewTime.length < 5) return insights; // Need some data for meaningful stats

  const reviewTimes = prsWithReviewTime.map(pr => pr.timeToFirstReview!);
  const meanReviewTime = calculateMean(reviewTimes);
  const stdDevReviewTime = calculateStdDev(reviewTimes, meanReviewTime);

  // Check for Open PRs that have been waiting an anomalously long time
  // Estimate "wait time" for open PRs as (now - createdAt)
  const slowReviewPRs = openPRs.filter((pr) => {
    if (pr.reviews.length > 0) return false; // Already reviewed
    
    const waitTime = differenceInDays(new Date(), pr.createdAt) * 24 * 60; // minutes
    // If wait time is > 2 std devs above the mean (and significantly larger than mean itself)
    if (stdDevReviewTime > 0) {
      const zScore = calculateZScore(waitTime, meanReviewTime, stdDevReviewTime);
      return zScore > 2 && waitTime > meanReviewTime;
    }
    return waitTime > meanReviewTime * 2; // Fallback if stdDev is 0 (all same values)
  });

  if (slowReviewPRs.length > 0) {
    insights.push({
      id: 'review-bottleneck-stat',
      type: 'WARNING',
      category: 'BOTTLENECK',
      title: 'Statistical Review Bottleneck',
      description: `${slowReviewPRs.length} PRs are waiting >2 standard deviations longer than team average`,
      action: 'Prioritize these statistically stalled PRs',
      metric: {
        value: slowReviewPRs.length,
        label: 'Stalled PRs',
      },
      priority: 9,
    });
  }

  return insights;
}

/**
 * Rule: Detect increasing cycle times using Z-Score deviation
 */
function detectCycleTimeIssues(prs: any[]): Insight[] {
  const insights: Insight[] = [];

  const mergedPRs = prs.filter((pr) => pr.state === 'MERGED' && pr.timeToMerge);

  if (mergedPRs.length < 10) return insights; // Need stable baseline

  // Split into recent (last 7 days) and older (previous 23 days)
  const recentCutoff = subDays(new Date(), 7);
  const recentMerged = mergedPRs.filter((pr) => pr.mergedAt! >= recentCutoff);
  const olderMerged = mergedPRs.filter((pr) => pr.mergedAt! < recentCutoff);

  if (recentMerged.length < 3 || olderMerged.length < 5) return insights;

  const olderTimes = olderMerged.map(pr => pr.timeToMerge!);
  const baselineMean = calculateMean(olderTimes);
  const baselineStdDev = calculateStdDev(olderTimes, baselineMean);

  const recentTimes = recentMerged.map(pr => pr.timeToMerge!);
  const recentMean = calculateMean(recentTimes);

  // Calculate Z-Score of the recent MEAN against the baseline distribution
  // Standard Error of the Mean (SEM) = stdDev / sqrt(N)
  // z = (recentMean - baselineMean) / SEM
  // But for simplicity, let's just see if recentMean is > 1.5 std devs away from baseline mean
  
  if (baselineStdDev > 0) {
    const zScore = (recentMean - baselineMean) / baselineStdDev;

    if (zScore > 1.5) {
      const percentChange = ((recentMean - baselineMean) / baselineMean) * 100;
      insights.push({
        id: 'cycle-time-stat',
        type: 'WARNING',
        category: 'VELOCITY',
        title: 'Significant Cycle Time Increase',
        description: `Recent cycle time is ${zScore.toFixed(1)}σ above baseline (+${percentChange.toFixed(0)}%)`,
        action: 'Investigate blockers or review capacity issues',
        metric: {
          value: `+${percentChange.toFixed(0)}%`,
          label: 'Deviation',
        },
        priority: 8,
      });
    }
  }

  return insights;
}

/**
 * Rule: Detect workload imbalance using Z-Scores
 */
function detectWorkloadImbalance(prs: any[]): Insight[] {
  const insights: Insight[] = [];

  // Count PRs per author
  const prsByAuthor = new Map<string, number>();
  prs.forEach((pr) => {
    prsByAuthor.set(pr.authorLogin, (prsByAuthor.get(pr.authorLogin) || 0) + 1);
  });

  const counts = Array.from(prsByAuthor.values());
  if (counts.length < 3) return insights; // Need a "team" to have stats

  const mean = calculateMean(counts);
  const stdDev = calculateStdDev(counts, mean);

  if (stdDev === 0) return insights;

  for (const [author, count] of prsByAuthor.entries()) {
    const zScore = calculateZScore(count, mean, stdDev);
    
    // Z > 2.0 means top 2.5% of probability (if normal dist)
    // Often "High Performer" but potentially "Overloaded" if > 2.5 or 3
    if (zScore > 2.0) {
      insights.push({
        id: `workload-${author}`,
        type: 'CAUTION',
        category: 'WORKLOAD',
        title: 'Workload Anomaly Detected',
        description: `${author} has ${count} PRs (Z-Score: ${zScore.toFixed(1)}). This is significantly higher than team average.`,
        action: 'Verify this is sustainable; consider redistributing work.',
        affectedContributors: [author],
        priority: 7,
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
