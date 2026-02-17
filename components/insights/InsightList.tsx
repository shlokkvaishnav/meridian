'use client';

import { Insight } from '@/lib/insights';
import { InsightCard } from './InsightCard';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsightListProps {
  insights: Insight[];
  loading?: boolean;
  onRefresh?: () => void;
  onDismiss?: (id: string) => void;
  onMarkActioned?: (id: string) => void;
}

export function InsightList({
  insights,
  loading,
  onRefresh,
  onDismiss,
  onMarkActioned,
}: InsightListProps) {
  
  if (insights.length === 0 && !loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        {/* Header with title */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">Insights</h2>
        </div>

        {/* Preview example cards */}
        <div className="space-y-3">
          {/* Example 1: High severity */}
          <div className="glass-card noise p-4 opacity-50 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-semibold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                EXAMPLE
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-red-400 mt-1.5 shrink-0 animate-pulse" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white mb-1">
                  Review Bottleneck Detected
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  PRs are waiting an average of 3.2 days for first review. This is 40% longer than your team's usual pace.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-violet-400">→ Recommended:</span>
                  <span className="text-slate-500">Add review rotation or increase reviewer pool</span>
                </div>
              </div>
            </div>
          </div>

          {/* Example 2: Medium severity */}
          <div className="glass-card noise p-4 opacity-50 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-semibold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                EXAMPLE
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0 animate-pulse" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white mb-1">
                  Merge Velocity Improving
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  Your cycle time decreased by 18% this week. Smaller PRs are being merged within 24 hours.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-violet-400">→ Recommended:</span>
                  <span className="text-slate-500">Maintain current PR size guidelines</span>
                </div>
              </div>
            </div>
          </div>

          {/* Example 3: Low severity */}
          <div className="glass-card noise p-4 opacity-50 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-semibold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                EXAMPLE
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white mb-1">
                  Consistent Contribution Pattern
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  All team members contributed code this week. Workload appears well-distributed across 7 active contributors.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-violet-400">→ Recommended:</span>
                  <span className="text-slate-500">Continue current collaboration practices</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="glass-card noise p-8 text-center border-t-2 border-t-violet-500/20">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4 animate-float">
            <Sparkles className="h-6 w-6 text-violet-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1.5 tracking-tight">Ready to discover insights?</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Our AI will analyze your PRs, reviews, and commits to surface patterns and opportunities you might have missed.
          </p>
          
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="default"
              className="shadow-glow hover:shadow-glow-lg transition-all duration-300"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Insights
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <h2 className="text-base font-semibold tracking-tight">Insights</h2>
          {insights.length > 0 && (
             <span className="text-xs text-neutral-500 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
              {insights.length}
             </span>
          )}
        </div>
        
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={insight.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
            <InsightCard 
              insight={insight} 
              onDismiss={onDismiss}
              onMarkActioned={onMarkActioned}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
