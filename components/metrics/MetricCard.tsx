'use client';

import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Helper for number formatting
function defaultFormatNumber(num: number | string): string {
  if (typeof num === 'string') return num;
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}

function defaultFormatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  className?: string;
  format?: 'number' | 'duration' | 'percentage';
  icon?: LucideIcon;
  loading?: boolean;
  isEmpty?: boolean;
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  className,
  format = 'number',
  icon: Icon,
  loading = false,
  isEmpty = false
}: MetricCardProps) {
  
  const formattedValue = typeof value === 'string' 
    ? value 
    : format === 'duration' 
      ? defaultFormatDuration(value as number)
      : format === 'percentage'
        ? `${value}%`
        : defaultFormatNumber(value);
  
  const TrendIcon = change?.trend === 'up' 
    ? TrendingUp 
    : change?.trend === 'down' 
      ? TrendingDown 
      : Minus;
  
  const trendColor = !change 
    ? ''
    : change.isPositive 
      ? 'text-emerald-400'
      : change.isPositive === false
        ? 'text-red-400'
        : 'text-slate-400';

  // Loading state
  if (loading) {
    return (
      <div className={cn('glass-card noise p-5 animate-fade-in-up', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 rounded bg-white/[0.04] animate-shimmer" />
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-white/[0.04] animate-shimmer" />
          )}
        </div>
        <div className="h-8 w-24 rounded bg-white/[0.06] animate-shimmer" />
      </div>
    );
  }

  // Empty state (zero value with no historical data)
  if (isEmpty || (typeof value === 'number' && value === 0 && !change)) {
    return (
      <div className={cn('glass-card noise p-5 animate-fade-in-up', className)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {title}
          </span>
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Icon className="h-4 w-4 text-violet-400/50" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-slate-600 tracking-tight">—</span>
          <span className="text-[10px] text-slate-500">Sync to see data</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('glass-card noise p-5 animate-fade-in-up', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {title}
        </span>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Icon className="h-4 w-4 text-violet-400" />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-white tracking-tight font-mono-num">
            {formattedValue}
          </span>
          {unit && (
            <span className="text-sm font-medium text-slate-500 mb-0.5">
              {unit}
            </span>
          )}
        </div>
        
        {change && (
          <div className={cn('flex items-center gap-1 text-xs font-medium mb-1', trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
