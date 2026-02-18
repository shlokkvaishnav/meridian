'use client';

import dynamic from 'next/dynamic';
import { TimeSeriesDataPoint } from '@/services/metrics';
import { DORAMetrics } from '@/components/dashboard/DORAMetrics';

const MetricsChart = dynamic(() => import('@/components/metrics/MetricsChart'), {
  loading: () => <div className="glass-card noise p-6 h-64 animate-pulse bg-white/[0.02]" />,
  ssr: false,
});

const VelocityChart = dynamic(() => import('@/components/charts/VelocityChart').then(mod => ({ default: mod.VelocityChart })), {
  loading: () => <div className="glass-card noise p-6 h-64 animate-pulse bg-white/[0.02]" />,
  ssr: false,
});

const ContributorLeaderboard = dynamic(() => import('@/components/dashboard/ContributorLeaderboard'), {
  loading: () => <div className="glass-card noise p-6 h-64 animate-pulse bg-white/[0.02]" />,
  ssr: false,
});

interface DashboardWidgetsProps {
  timeSeriesData: TimeSeriesDataPoint[];
  velocityData: any[]; // Using any to avoid complex type duplication for now, could allow strict types if needed
  contributors: any[];
}

export function DashboardWidgets({ timeSeriesData, velocityData, contributors }: DashboardWidgetsProps) {
  return (
    <>
      <DORAMetrics />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <MetricsChart data={timeSeriesData} />
        <VelocityChart data={velocityData} />
      </div>
      <ContributorLeaderboard contributors={contributors} />
    </>
  );
}
