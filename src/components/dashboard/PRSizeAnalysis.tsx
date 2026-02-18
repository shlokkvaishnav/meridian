'use client';

import { useMemo } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PRSizeAnalysisProps {
  prs?: Array<{ additions: number; deletions: number; title: string }>;
}

export function PRSizeAnalysis({ prs = [] }: PRSizeAnalysisProps) {
  // Generate mock data if none provided
  const prSizes = useMemo(() => {
    if (prs.length > 0) {
      return prs.map(pr => pr.additions + pr.deletions);
    }
    
    // Mock data showing distribution
    return [
      45, 120, 89, 245, 67, 320, 156, 890, 234, 567, 1234, 345, 678, 234, 456,
      123, 789, 234, 567, 890, 1234, 567, 234, 456, 123, 345, 678, 234, 567, 890,
    ];
  }, [prs]);

  const sizeCategories = useMemo(() => {
    const categories = {
      small: prSizes.filter(s => s < 100).length,
      medium: prSizes.filter(s => s >= 100 && s < 500).length,
      large: prSizes.filter(s => s >= 500 && s < 1000).length,
      xlarge: prSizes.filter(s => s >= 1000).length,
    };
    return categories;
  }, [prSizes]);

  const avgSize = useMemo(() => {
    if (prSizes.length === 0) return 0;
    return Math.round(prSizes.reduce((sum, size) => sum + size, 0) / prSizes.length);
  }, [prSizes]);

  const maxSize = Math.max(...prSizes, 1);
  const histogramBins = useMemo(() => {
    const bins = Array(20).fill(0);
    const binSize = maxSize / 20;
    
    prSizes.forEach(size => {
      const binIndex = Math.min(Math.floor(size / binSize), 19);
      bins[binIndex]++;
    });
    
    return bins;
  }, [prSizes, maxSize]);

  const maxBinValue = Math.max(...histogramBins, 1);
  const largePRCount = sizeCategories.large + sizeCategories.xlarge;
  const largePRPercentage = prSizes.length > 0 ? Math.round((largePRCount / prSizes.length) * 100) : 0;

  return (
    <Card className="glass-card noise p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">PR Size Distribution</h3>
          <p className="text-xs text-slate-400">Large PRs correlate with longer review times</p>
        </div>
        {largePRPercentage > 30 && (
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">{largePRPercentage}% large PRs</span>
          </div>
        )}
      </div>

      {/* Histogram */}
      <div className="mb-6">
        <div className="flex items-end justify-between gap-1 h-32">
          {histogramBins.map((count, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-violet-500/40 to-violet-500/20 rounded-t transition-all hover:from-violet-500/60 hover:to-violet-500/40"
              style={{
                height: `${(count / maxBinValue) * 100}%`,
                minHeight: count > 0 ? '4px' : '0',
              }}
              title={`${Math.round((index / histogramBins.length) * maxSize)}-${Math.round(((index + 1) / histogramBins.length) * maxSize)} lines: ${count} PRs`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>0</span>
          <span>{maxSize}+ lines</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
          <div className="text-xs text-slate-400 mb-1">Average</div>
          <div className="font-metric text-xl text-white">{avgSize}</div>
          <div className="text-xs text-slate-500">lines</div>
        </div>
        <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
          <div className="text-xs text-emerald-400 mb-1">Small</div>
          <div className="font-metric text-xl text-emerald-400">{sizeCategories.small}</div>
          <div className="text-xs text-slate-500">&lt;100 lines</div>
        </div>
        <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
          <div className="text-xs text-amber-400 mb-1">Large</div>
          <div className="font-metric text-xl text-amber-400">{sizeCategories.large}</div>
          <div className="text-xs text-slate-500">500-1000 lines</div>
        </div>
        <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
          <div className="text-xs text-red-400 mb-1">X-Large</div>
          <div className="font-metric text-xl text-red-400">{sizeCategories.xlarge}</div>
          <div className="text-xs text-slate-500">1000+ lines</div>
        </div>
      </div>

      {/* Insight */}
      {largePRPercentage > 30 && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-300">
              <span className="font-medium">Insight:</span> {largePRPercentage}% of PRs are large (&gt;500 lines).
              Consider breaking them into smaller, reviewable chunks to reduce cycle time.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
