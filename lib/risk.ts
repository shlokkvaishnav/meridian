import { ContributorStats } from './metricsTypes';

/**
 * Calculate risk score for a contributor (0-100)
 * Higher score = higher risk of burnout or bottlenecking
 * 
 * Factors:
 * 1. Workload (PRs Opened) - 40%
 * 2. Review Load (Reviews Given) - 30%
 * 3. Merge Speed (Time to Merge) - 30% (Slower = higher risk of being stuck)
 */
export function calculateContributorRisk(
  stats: Omit<ContributorStats, 'riskScore'>,
  teamStats: { maxPrs: number; maxReviews: number; avgMergeTime: number }
): number {
  let score = 0;

  // 1. Workload Risk
  if (teamStats.maxPrs > 0) {
    const workloadRatio = stats.prsOpened / teamStats.maxPrs;
    score += workloadRatio * 40;
  }

  // 2. Review Load Risk
  if (teamStats.maxReviews > 0) {
    const reviewRatio = stats.reviewsGiven / teamStats.maxReviews;
    score += reviewRatio * 30;
  }

  // 3. Merge Speed Risk (Struggle factor)
  // If taking longer than average to merge, might be blocked/struggling
  if (stats.avgTimeToMerge && teamStats.avgMergeTime > 0) {
    const timeRatio = stats.avgTimeToMerge / teamStats.avgMergeTime;
    // Cap at 2x average to avoid skewing too hard
    const normalizedTime = Math.min(timeRatio, 2) / 2; 
    score += normalizedTime * 30;
  }

  return Math.min(Math.round(score), 100);
}
