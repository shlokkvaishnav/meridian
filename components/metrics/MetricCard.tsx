'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';


// Helper for number formatting (can be moved to lib/utils/numbers.ts later if needed)
function defaultFormatNumber(num: number | string): string {
    if (typeof num === "string") return num;
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);
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
    isPositive?: boolean; // Whether the trend is good or bad (e.g. up is bad for cycle time)
  };
  className?: string;
  format?: 'number' | 'duration' | 'percentage';
  icon?: React.ElementType;
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  className,
  format = 'number',
  icon: Icon
}: MetricCardProps) {
  
  const formattedValue = typeof value === 'string' 
    ? value 
    : format === 'duration' 
      ? defaultFormatDuration(value)
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
      ? 'text-emerald-600 dark:text-emerald-400'
      : change.isPositive === false
        ? 'text-red-600 dark:text-red-400'
        : 'text-neutral-500 dark:text-neutral-400';
  
  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-all duration-200 border-neutral-200 dark:border-neutral-800', className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-neutral-400" />}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {formattedValue}
            </span>
            {unit && (
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {unit}
              </span>
            )}
          </div>
          
          {change && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
