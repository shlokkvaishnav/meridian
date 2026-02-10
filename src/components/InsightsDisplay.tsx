'use client';

import { useState } from 'react';
import { Insight } from '@/lib/insights';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  Target,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface InsightsDisplayProps {
  initialInsights?: Insight[];
}

export default function InsightsDisplay({ initialInsights = [] }: InsightsDisplayProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateInsights = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/insights', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();

      if (data.success) {
        setInsights(data.insights);
      } else {
        setError(data.error || 'Failed to generate insights');
      }
    } catch (err: any) {
      console.error('Failed to generate insights:', err);
      setError('Failed to connect to insights engine');
    } finally {
      setGenerating(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CAUTION':
        return <AlertCircle className="h-4 w-4" />;
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BOTTLENECK':
        return <Clock className="h-3 w-3" />;
      case 'WORKLOAD':
        return <Users className="h-3 w-3" />;
      case 'VELOCITY':
        return <TrendingUp className="h-3 w-3" />;
      case 'QUALITY':
        return <Target className="h-3 w-3" />;
      case 'COLLABORATION':
        return <Users className="h-3 w-3" />;
      default:
        return <Lightbulb className="h-3 w-3" />;
    }
  };

  const getAccent = (type: string) => {
    switch (type) {
      case 'WARNING':
        return { bar: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'CAUTION':
        return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'SUCCESS':
        return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      default:
        return { bar: 'bg-sky-500', text: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    }
  };

  if (insights.length === 0) {
    return (
      <div className="glass-card noise p-10 text-center animate-fade-in-up">
        <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4 animate-float">
          <Sparkles className="h-6 w-6 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1.5 tracking-tight">No insights yet</h3>
        <p className="text-sm text-slate-400 mb-7 max-w-xs mx-auto leading-relaxed">
          Analyze your workflow to discover patterns and opportunities
        </p>
        <button
          onClick={handleGenerateInsights}
          disabled={generating}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all duration-300 disabled:opacity-40 inline-flex items-center gap-2 shadow-glow hover:shadow-glow-lg"
        >
          {generating ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Generate Insights
            </>
          )}
        </button>

        {error && (
          <p className="text-red-400 text-xs mt-4">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card noise p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">Insights</h2>
          <span className="text-xs text-slate-500 font-mono ml-1">{insights.length}</span>
        </div>
        <button
          onClick={handleGenerateInsights}
          disabled={generating}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 disabled:opacity-40 inline-flex items-center gap-1.5"
        >
          {generating ? (
            <>
              <div className="h-3 w-3 border-[1.5px] border-white/20 border-t-white rounded-full animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              Refresh
            </>
          )}
        </button>
      </div>

      <div className="space-y-2.5">
        {insights.map((insight, i) => {
          const accent = getAccent(insight.type);
          return (
            <div
              key={insight.id}
              className={`relative rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] p-4 pl-6 transition-all duration-300 overflow-hidden animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${accent.bar} opacity-60`} />

              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 mt-0.5 ${accent.text}`}>
                  {getIcon(insight.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="text-sm font-medium text-white">{insight.title}</h3>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${accent.badge}`}>
                      {getCategoryIcon(insight.category)}
                      {insight.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{insight.description}</p>

                  {insight.action && (
                    <p className="text-[11px] text-slate-500 italic mb-2">
                      💡 {insight.action}
                    </p>
                  )}

                  {insight.metric && (
                    <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.04] px-3 py-1.5 rounded-lg">
                      <span className={`text-base font-bold font-mono ${accent.text}`}>
                        {insight.metric.value}
                      </span>
                      <span className="text-[10px] text-slate-500">{insight.metric.label}</span>
                    </div>
                  )}

                  {insight.affectedContributors && insight.affectedContributors.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                      <Users className="h-3 w-3" />
                      {insight.affectedContributors.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
