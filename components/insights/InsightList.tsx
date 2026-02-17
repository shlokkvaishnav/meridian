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
      <div className="glass-card noise p-10 text-center animate-fade-in-up">
        <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4 animate-float">
          <Sparkles className="h-6 w-6 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1.5 tracking-tight">No insights yet</h3>
        <p className="text-sm text-neutral-500 mb-7 max-w-xs mx-auto leading-relaxed">
          Analyze your workflow to discover patterns and opportunities
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
