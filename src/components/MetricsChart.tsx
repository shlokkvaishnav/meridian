'use client';

import { TimeSeriesDataPoint } from '@/lib/metrics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MetricsChartProps {
  data: TimeSeriesDataPoint[];
}

export default function MetricsChart({ data }: MetricsChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Activity Trends (Last 30 Days)</h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Line
              type="monotone"
              dataKey="prsOpened"
              stroke="#a855f7"
              strokeWidth={2}
              name="PRs Opened"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="prsMerged"
              stroke="#22c55e"
              strokeWidth={2}
              name="PRs Merged"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
          <span className="text-sm text-slate-400">PRs Opened</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-slate-400">PRs Merged</span>
        </div>
      </div>
    </div>
  );
}
