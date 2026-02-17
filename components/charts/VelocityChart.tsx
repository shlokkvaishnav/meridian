'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, GitPullRequest } from 'lucide-react';
 
 interface VelocityChartProps {
   data: {
     date: string;
     cycleTimeP50: number | null;
     mergeRate: number | null;
   }[];
 }
 
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number | null;
    dataKey: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;

  const date = new Date(label);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="bg-[#141418] border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2 font-mono">{formatted}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name}</span>
          <span className="text-white font-mono font-semibold ml-auto">
            {entry.value !== null ? (
              entry.dataKey === 'mergeRate' ? `${entry.value}%` : `${entry.value}m`
            ) : 'N/A'}
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
      <div className="glass-card noise p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-4 w-4 text-violet-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">
            Engineering Velocity
          </h2>
          <span className="text-xs text-slate-500 font-mono ml-auto">30 days</span>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <GitPullRequest className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            No velocity data yet. Sync your repositories to track cycle time and merge rates.
          </p>
        </div>
      </div>
    );
  }

   return (
    <div className="glass-card noise p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-4 w-4 text-violet-400" />
        <h2 className="text-base font-semibold text-white tracking-tight">
          Engineering Velocity
        </h2>
        <span className="text-xs text-slate-500 font-mono ml-auto">30 days</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.03)" 
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={(val) => {
                const date = new Date(val);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              stroke="rgba(255,255,255,0.1)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis 
              yAxisId="left" 
              stroke="rgba(255,255,255,0.1)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-8}
              label={{ 
                value: 'Cycle Time (min)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'rgba(255,255,255,0.4)', fontSize: 10 }
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="rgba(255,255,255,0.1)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={8}
              label={{ 
                value: 'Merge Rate (%)', 
                angle: 90, 
                position: 'insideRight',
                style: { fill: 'rgba(255,255,255,0.4)', fontSize: 10 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '16px',
                fontSize: '11px'
              }}
              iconType="line"
              formatter={(value) => <span className="text-slate-400">{value}</span>}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cycleTimeP50" 
              name="Cycle Time (P50)" 
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: '#06b6d4', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="mergeRate" 
              name="Merge Rate" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: '#8b5cf6', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
   );
 }
