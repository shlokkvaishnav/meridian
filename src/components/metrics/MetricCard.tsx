'use client';

import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn, formatCompactNumber } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  change?: { value: number; trend: "up" | "down" | "neutral"; isPositive?: boolean };
  format?: "number" | "duration" | "percentage";
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  isEmpty?: boolean;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  change, 
  format = "number", 
  icon: Icon, 
  onClick, 
  className,
  loading = false,
  isEmpty = false 
}: MetricCardProps) {
  
  // Loading state
  if (loading) {
    return (
      <div className={cn("group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300", className)}>
         <div className="flex items-center justify-between mb-3">
           <div className="h-3 w-20 rounded bg-muted animate-pulse" />
           {Icon && (
             <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
           )}
         </div>
         <div className="h-8 w-24 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  const formattedValue =
    typeof value === "string"
      ? value
      : format === "duration"
        ? formatDuration(value as number)
        : format === "percentage"
          ? `${value}%`
          : formatCompactNumber(value);

  const TrendIcon = change?.trend === "up" ? TrendingUp : change?.trend === "down" ? TrendingDown : Minus;

  const trendColor = !change
    ? ""
    : change.isPositive
      ? "text-emerald-500"
      : change.isPositive === false
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-glow",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="font-mono-num text-3xl font-bold tracking-tight text-foreground">{isEmpty ? "—" : formattedValue}</span>
          {unit && <span className="mb-1 text-sm text-muted-foreground">{unit}</span>}
        </div>

        {change && !isEmpty && (
          <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(change.value)}%
          </div>
        )}
        
        {isEmpty && (
            <div className="mt-2 text-[10px] text-muted-foreground">Sync to see data</div>
        )}
      </div>
    </div>
  );
}
