'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComparisonModeProps {
  currentData: Array<{ date: string; value: number }>;
  previousData: Array<{ date: string; value: number }>;
  label: string;
}

export function ComparisonMode({ currentData, previousData, label }: ComparisonModeProps) {
  const [isComparing, setIsComparing] = useState(false);

  const calculateChange = () => {
    if (currentData.length === 0 || previousData.length === 0) return 0;
    
    const currentAvg = currentData.reduce((sum, d) => sum + d.value, 0) / currentData.length;
    const previousAvg = previousData.reduce((sum, d) => sum + d.value, 0) / previousData.length;
    
    return ((currentAvg - previousAvg) / previousAvg) * 100;
  };

  const change = calculateChange();
  const isPositive = change > 0;

  return (
    <Card className="glass-card noise p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{label}</h3>
          <p className="text-xs text-slate-400">Compare with previous period</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsComparing(!isComparing)}
          className="border-violet-500/20 hover:bg-violet-500/10"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {isComparing ? 'Stop Comparing' : 'Compare Periods'}
        </Button>
      </div>

      {isComparing && (
        <div className="mt-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-slate-400 mb-1">Current Period</div>
                <div className="font-metric text-lg text-white">
                  {currentData.length > 0
                    ? (currentData.reduce((sum, d) => sum + d.value, 0) / currentData.length).toFixed(1)
                    : '0'}
                </div>
              </div>
              <div className="text-slate-600">vs</div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Previous Period</div>
                <div className="font-metric text-lg text-white">
                  {previousData.length > 0
                    ? (previousData.reduce((sum, d) => sum + d.value, 0) / previousData.length).toFixed(1)
                    : '0'}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="flex items-end justify-between gap-1 h-24 mt-4">
            {currentData.slice(-7).map((point, index) => {
              const prevPoint = previousData[index];
              const currentHeight = (point.value / Math.max(...currentData.map(d => d.value), 1)) * 100;
              const prevHeight = prevPoint ? (prevPoint.value / Math.max(...previousData.map(d => d.value), 1)) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex items-end gap-0.5">
                  <div
                    className="flex-1 bg-violet-500/40 rounded-t transition-all"
                    style={{ height: `${currentHeight}%` }}
                    title={`Current: ${point.value.toFixed(1)}`}
                  />
                  {prevPoint && (
                    <div
                      className="flex-1 bg-slate-600/40 rounded-t transition-all"
                      style={{ height: `${prevHeight}%` }}
                      title={`Previous: ${prevPoint.value.toFixed(1)}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-violet-500/40" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-600/40" />
              <span>Previous</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
