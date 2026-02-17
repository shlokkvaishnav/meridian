'use client';

 import { TimeSeriesDataPoint, formatDuration } from '@/services/metrics';
 import {
   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
   CartesianGrid, Area, AreaChart
 } from 'recharts';
 import { TrendingUp } from 'lucide-react';

 interface MetricsChartProps {
   data: TimeSeriesDataPoint[];
 }

 interface CustomTooltipPayloadEntry {
   color: string;
   name: string;
   value: number | string;
 }

 interface CustomTooltipProps {
   active?: boolean;
   payload?: CustomTooltipPayloadEntry[];
   label?: string | number;
 }

 function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
   if (!active || !payload?.length || label == null) return null;

   const date = new Date(label);
   const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

   return (
     <div className="bg-[#141418] border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
       <p className="text-xs text-slate-400 mb-2 font-mono font-medium">{formatted}</p>
       {payload.map((entry, i: number) => (
         <div key={i} className="flex items-center gap-2 text-xs">
           <div
             className="h-2 w-2 rounded-full"
             style={{ backgroundColor: entry.color }}
           />
           <span className="text-slate-300 font-medium">{entry.name}</span>
           <span className="text-white font-mono font-semibold ml-auto">{entry.value}</span>
         </div>
       ))}
     </div>
   );
 }

 export default function MetricsChart({ data }: MetricsChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card noise p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">Activity Trends</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">30 days</span>
        </div>

        {/* Empty state with visual placeholder */}
        <div className="h-64 relative flex flex-col items-center justify-center border border-dashed border-white/[0.06] rounded-lg">
          {/* Chart placeholder visual */}
          <div className="absolute inset-0 flex items-end justify-around p-8 opacity-[0.15]">
            {[40, 65, 45, 70, 55, 80, 60].map((height, i) => (
              <div
                key={i}
                className="w-full mx-1 bg-gradient-to-t from-violet-500/30 to-violet-500/10 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          {/* Empty state content */}
          <div className="relative z-10 text-center">
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No activity data yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Sync your repositories to see PR trends over time
            </p>
          </div>
        </div>

        {/* Legend (maintained for consistency) */}
        <div className="flex justify-center gap-6 mt-4 opacity-40">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-6 rounded-full bg-violet-400" />
            <span className="text-[11px] text-slate-400 font-medium">Opened</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-6 rounded-full bg-cyan-400" />
            <span className="text-[11px] text-slate-400 font-medium">Merged</span>
          </div>
        </div>
      </div>
    );
  }

   return (
     <div className="glass-card noise p-6 animate-fade-in-up">
       <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2">
           <TrendingUp className="h-4 w-4 text-violet-400" />
           <h2 className="text-base font-semibold text-white tracking-tight">Activity Trends</h2>
         </div>
         <span className="text-xs text-slate-500 font-mono">30 days</span>
       </div>

       <div className="h-64">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={data}>
             <defs>
               <linearGradient id="gradientOpened" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.25} />
                 <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
               </linearGradient>
               <linearGradient id="gradientMerged" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                 <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
               </linearGradient>
             </defs>
             <CartesianGrid
               strokeDasharray="3 3"
               stroke="rgba(255,255,255,0.03)"
               vertical={false}
             />
             <XAxis
               dataKey="date"
               stroke="rgba(255,255,255,0.1)"
               fontSize={10}
               tickLine={false}
               axisLine={false}
               dy={8}
               tickFormatter={(value) => {
                 const date = new Date(value);
                 return `${date.getMonth() + 1}/${date.getDate()}`;
               }}
             />
             <YAxis
               stroke="rgba(255,255,255,0.1)"
               fontSize={10}
               tickLine={false}
               axisLine={false}
               dx={-8}
             />
             <Tooltip content={<CustomTooltip />} />
             <Area
               type="monotone"
               dataKey="prsOpened"
               stroke="#a78bfa"
               strokeWidth={2}
               fill="url(#gradientOpened)"
               name="Opened"
               dot={false}
               activeDot={{ r: 4, fill: '#a78bfa', stroke: '#0a0a0f', strokeWidth: 2 }}
             />
             <Area
               type="monotone"
               dataKey="prsMerged"
               stroke="#22d3ee"
               strokeWidth={2}
               fill="url(#gradientMerged)"
               name="Merged"
               dot={false}
               activeDot={{ r: 4, fill: '#22d3ee', stroke: '#0a0a0f', strokeWidth: 2 }}
             />
           </AreaChart>
         </ResponsiveContainer>
       </div>

       <div className="flex justify-center gap-6 mt-4">
         <div className="flex items-center gap-2">
           <div className="h-1.5 w-6 rounded-full bg-violet-400" />
           <span className="text-[11px] text-slate-400 font-medium">Opened</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="h-1.5 w-6 rounded-full bg-cyan-400" />
           <span className="text-[11px] text-slate-400 font-medium">Merged</span>
         </div>
       </div>
     </div>
   );
 }
