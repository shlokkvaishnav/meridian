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
  Target
} from 'lucide-react';

interface InsightsDisplayProps {
  initialInsights?: Insight[];
}

export default function InsightsDisplay({ initialInsights = [] }: InsightsDisplayProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [generating, setGenerating] = useState(false);

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/insights', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5" />;
      case 'CAUTION':
        return <AlertCircle className="h-5 w-5" />;
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bottleneck':
        return <Clock className="h-4 w-4" />;
      case 'workload':
        return <Users className="h-4 w-4" />;
      case 'velocity':
        return <TrendingUp className="h-4 w-4" />;
      case 'quality':
        return <Target className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WARNING':
        return 'border-red-500/50 bg-red-500/10';
      case 'CAUTION':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'SUCCESS':
        return 'border-green-500/50 bg-green-500/10';
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getTypeTextColor = (type: string) => {
    switch (type) {
      case 'WARNING':
        return 'text-red-400';
      case 'CAUTION':
        return 'text-yellow-400';
      case 'SUCCESS':
        return 'text-green-400';
      default:
        return 'text-blue-400';
    }
  };

  if (insights.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <Lightbulb className="h-12 w-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Insights Yet</h3>
        <p className="text-slate-400 mb-6">
          Generate insights to discover patterns and opportunities in your team's workflow
        </p>
        <button
          onClick={handleGenerateInsights}
          disabled={generating}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4" />
              Generate Insights
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">AI Insights</h2>
        </div>
        <button
          onClick={handleGenerateInsights}
          disabled={generating}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all disabled:opacity-50 inline-flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border rounded-xl p-4 ${getTypeColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 mt-0.5 ${getTypeTextColor(insight.type)}`}>
                {getIcon(insight.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{insight.title}</h3>
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    {getCategoryIcon(insight.category)}
                    {insight.category}
                  </span>
                </div>

                <p className="text-slate-300 text-sm mb-2">{insight.description}</p>

                {insight.action && (
                  <p className="text-slate-400 text-xs italic mb-2">
                    💡 {insight.action}
                  </p>
                )}

                {insight.metric && (
                  <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg">
                    <span className={`text-lg font-bold ${getTypeTextColor(insight.type)}`}>
                      {insight.metric.value}
                    </span>
                    <span className="text-xs text-slate-400">{insight.metric.label}</span>
                  </div>
                )}

                {insight.affectedContributors && insight.affectedContributors.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <Users className="h-3 w-3" />
                    {insight.affectedContributors.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
