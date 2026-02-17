'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';
 
 interface VelocityChartProps {
   data: {
     date: string;
     cycleTimeP50: number | null;
     mergeRate: number | null;
   }[];
 }
 
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;

  const date = new Date(label);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{formatted}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-semibold text-foreground ml-auto">
            {entry.name === "Cycle Time" ? `${Math.round(entry.value / 60)}h` : `${entry.value}%`}
          </span>
        </div>
      ))}
    </div>
  );
}

 export function VelocityChart({ data }: VelocityChartProps) {
  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">
              Velocity
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">30 days</span>
        </div>
        <div className="h-[280px] flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-amber-500" />
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            No data yet
          </p>
        </div>
      </div>
    );
  }

   return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-foreground">
            Velocity
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">30 days</span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(240 4% 16%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={(val) => {
                const date = new Date(val);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              stroke="hsl(215 20% 35%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis 
              yAxisId="left" 
              stroke="hsl(215 20% 35%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-8}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="hsl(215 20% 35%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cycleTimeP50" 
              name="Cycle Time" 
              stroke="hsl(38 92% 50%)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(38 92% 50%)', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="mergeRate" 
              name="Merge Rate" 
              stroke="hsl(263 70% 58%)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(263 70% 58%)', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Cycle Time
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Merge Rate
        </div>
      </div>
    </div>
   );
 }
