'use client';

import { TimeSeriesDataPoint } from '@/services/metrics';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MetricsChartProps {
  data: TimeSeriesDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || label == null) return null;

  const date = new Date(label);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{formatted}</p>
      {payload.map((entry, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-semibold text-foreground ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function MetricsChart({ data }: MetricsChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Activity Trends</h2>
          </div>
          <span className="text-xs text-muted-foreground">30 days</span>
        </div>

        {/* Empty state */}
        <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-border/50 rounded-lg">
           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
             <TrendingUp className="h-6 w-6 text-primary" />
           </div>
           <h3 className="text-sm font-medium text-foreground mb-1">No activity data yet</h3>
           <p className="text-xs text-muted-foreground">Sync repositories to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Activity Trends</h2>
        </div>
        <span className="text-xs text-muted-foreground">30 days</span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradientOpened" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(263 70% 58%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(263 70% 58%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientMerged" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(240 4% 16%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(215 20% 35%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="hsl(215 20% 35%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="prsOpened"
              stroke="hsl(263 70% 58%)"
              strokeWidth={2}
              fill="url(#gradientOpened)"
              name="Opened"
              activeDot={{ r: 4, fill: 'hsl(263 70% 58%)', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="prsMerged"
              stroke="hsl(160 84% 39%)"
              strokeWidth={2}
              fill="url(#gradientMerged)"
              name="Merged"
              activeDot={{ r: 4, fill: 'hsl(160 84% 39%)', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-6 rounded-full bg-primary" />
          <span className="text-[11px] text-muted-foreground font-medium">Opened</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-6 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-muted-foreground font-medium">Merged</span>
        </div>
      </div>
    </div>
  );
}
