'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RepoHealthScoreProps {
  cycleTime?: number;
  reviewCoverage?: number;
  commentDensity?: number;
  mergeSuccessRate?: number;
  repoName?: string;
}

export function RepoHealthScore({
  cycleTime = 2.5,
  reviewCoverage = 85,
  commentDensity = 3.2,
  mergeSuccessRate = 92,
  repoName = 'Repository',
}: RepoHealthScoreProps) {
  const healthScore = useMemo(() => {
    // Calculate health score (0-100) based on multiple factors
    const cycleTimeScore = Math.max(0, 100 - (cycleTime * 10)); // Lower is better
    const reviewCoverageScore = reviewCoverage; // Higher is better
    const commentDensityScore = Math.min(100, commentDensity * 20); // Moderate is good
    const mergeSuccessScore = mergeSuccessRate; // Higher is better
    
    // Weighted average
    const score = Math.round(
      cycleTimeScore * 0.3 +
      reviewCoverageScore * 0.3 +
      commentDensityScore * 0.2 +
      mergeSuccessScore * 0.2
    );
    
    return Math.max(0, Math.min(100, score));
  }, [cycleTime, reviewCoverage, commentDensity, mergeSuccessRate]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'Excellent' };
    if (score >= 60) return { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', label: 'Good' };
    if (score >= 40) return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'Fair' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Needs Attention' };
  };

  const health = getHealthColor(healthScore);

  const factors = [
    {
      label: 'Cycle Time',
      value: `${cycleTime.toFixed(1)}d`,
      score: Math.max(0, 100 - (cycleTime * 10)),
      trend: cycleTime < 2 ? 'up' : cycleTime > 4 ? 'down' : 'neutral',
    },
    {
      label: 'Review Coverage',
      value: `${reviewCoverage}%`,
      score: reviewCoverage,
      trend: reviewCoverage > 80 ? 'up' : reviewCoverage < 60 ? 'down' : 'neutral',
    },
    {
      label: 'Comment Density',
      value: `${commentDensity.toFixed(1)}`,
      score: Math.min(100, commentDensity * 20),
      trend: commentDensity > 2 && commentDensity < 5 ? 'up' : 'neutral',
    },
    {
      label: 'Merge Success Rate',
      value: `${mergeSuccessRate}%`,
      score: mergeSuccessRate,
      trend: mergeSuccessRate > 90 ? 'up' : mergeSuccessRate < 80 ? 'down' : 'neutral',
    },
  ];

  return (
    <Card className={`glass-card noise p-6 border-2 ${health.border} ${health.bg}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Repository Health Score</h3>
          <p className="text-xs text-slate-400">{repoName}</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border ${health.border} ${health.bg}`}>
          <div className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${health.text}`} />
            <div>
              <div className={`font-metric text-2xl ${health.text}`}>{healthScore}</div>
              <div className="text-xs text-slate-400">{health.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Factors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {factors.map((factor) => (
          <div key={factor.label} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">{factor.label}</span>
              {factor.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
              {factor.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
            </div>
            <div className="font-metric text-lg text-white mb-1">{factor.value}</div>
            <div className="h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  factor.score >= 80
                    ? 'bg-emerald-500'
                    : factor.score >= 60
                    ? 'bg-teal-500'
                    : factor.score >= 40
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${factor.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {healthScore < 60 && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="text-xs text-amber-300">
            <span className="font-medium">Recommendations:</span>{' '}
            {cycleTime > 4 && 'Consider reducing PR size to improve cycle time. '}
            {reviewCoverage < 70 && 'Increase review coverage by requiring more reviewers. '}
            {mergeSuccessRate < 85 && 'Investigate why PRs are failing to merge successfully.'}
          </div>
        </div>
      )}
    </Card>
  );
}
