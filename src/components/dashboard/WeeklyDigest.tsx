'use client';

import { Mail, TrendingUp, GitMerge, Users, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WeeklyDigestProps {
  week?: {
    startDate: string;
    endDate: string;
    metrics: {
      prsMerged: number;
      avgCycleTime: number;
      activeContributors: number;
      reviewVelocity: number;
    };
    topContributors: Array<{ login: string; prs: number }>;
    insights: string[];
  };
}

export function WeeklyDigest({ week }: WeeklyDigestProps) {
  // Mock data if none provided
  const digestData = week || {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    endDate: new Date().toLocaleDateString(),
    metrics: {
      prsMerged: 42,
      avgCycleTime: 1.8,
      activeContributors: 24,
      reviewVelocity: 18,
    },
    topContributors: [
      { login: 'alice', prs: 8 },
      { login: 'bob', prs: 6 },
      { login: 'charlie', prs: 5 },
    ],
    insights: [
      'Cycle time improved by 15% this week',
      '3 PRs stuck in review for 5+ days',
      'Review velocity increased after async review guidelines',
    ],
  };

  return (
    <Card className="glass-card noise p-6 border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-teal-500/[0.05]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Mail className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Weekly Engineering Digest</h3>
            <p className="text-xs text-slate-400">
              {digestData.startDate} - {digestData.endDate}
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          AI Generated
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-2">
            <GitMerge className="h-4 w-4 text-violet-400" />
            <span className="text-xs text-slate-400">PRs Merged</span>
          </div>
          <div className="font-metric text-2xl text-white">{digestData.metrics.prsMerged}</div>
        </div>
        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-teal-400" />
            <span className="text-xs text-slate-400">Avg Cycle Time</span>
          </div>
          <div className="font-metric text-2xl text-white">{digestData.metrics.avgCycleTime.toFixed(1)}d</div>
        </div>
        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-slate-400">Contributors</span>
          </div>
          <div className="font-metric text-2xl text-white">{digestData.metrics.activeContributors}</div>
        </div>
        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Review Velocity</span>
          </div>
          <div className="font-metric text-2xl text-white">{digestData.metrics.reviewVelocity}/hr</div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="mb-6 p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
        <h4 className="text-sm font-semibold text-white mb-3">Top Contributors This Week</h4>
        <div className="space-y-2">
          {digestData.topContributors.map((contributor, index) => (
            <div key={contributor.login} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-medium text-violet-400">
                  {index + 1}
                </div>
                <span className="text-sm text-white">{contributor.login}</span>
              </div>
              <span className="text-sm text-slate-400">{contributor.prs} PRs</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Key Insights</h4>
        <div className="space-y-2">
          {digestData.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-slate-300 flex-1">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
        <p className="text-xs text-slate-400">
          This digest is automatically generated every Monday
        </p>
        <Button
          variant="outline"
          size="sm"
          className="border-violet-500/20 hover:bg-violet-500/10"
        >
          Configure Email
          <ArrowRight className="h-3 w-3 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
