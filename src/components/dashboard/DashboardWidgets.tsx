'use client';

import dynamic from 'next/dynamic';
import { TimeSeriesDataPoint } from '@/services/metrics';

const chartSkeleton = () => <div className="glass-card noise p-6 h-64 animate-pulse bg-white/[0.02]" />;

const MetricsChart = dynamic(() => import('@/components/metrics/MetricsChart'), {
  loading: chartSkeleton,
  ssr: false,
});

const VelocityChart = dynamic(() => import('@/components/charts/VelocityChart').then(mod => ({ default: mod.VelocityChart })), {
  loading: chartSkeleton,
  ssr: false,
});

const ContributorLeaderboard = dynamic(() => import('@/components/dashboard/ContributorLeaderboard'), {
  loading: chartSkeleton,
  ssr: false,
});

const DORAMetrics = dynamic(() => import('@/components/dashboard/DORAMetrics').then(m => ({ default: m.DORAMetrics })), {
  loading: chartSkeleton,
  ssr: false,
});

const BurnoutHeatmap = dynamic(() => import('@/components/dashboard/BurnoutHeatmap').then(m => ({ default: m.BurnoutHeatmap })), {
  loading: chartSkeleton,
  ssr: false,
});

const RepoHealthScore = dynamic(() => import('@/components/dashboard/RepoHealthScore').then(m => ({ default: m.RepoHealthScore })), {
  loading: chartSkeleton,
  ssr: false,
});

const PRSizeAnalysis = dynamic(() => import('@/components/dashboard/PRSizeAnalysis').then(m => ({ default: m.PRSizeAnalysis })), {
  loading: chartSkeleton,
  ssr: false,
});

const CollaborationGraph = dynamic(() => import('@/components/dashboard/CollaborationGraph').then(m => ({ default: m.CollaborationGraph })), {
  loading: chartSkeleton,
  ssr: false,
});

const WeeklyDigest = dynamic(() => import('@/components/dashboard/WeeklyDigest').then(m => ({ default: m.WeeklyDigest })), {
  loading: chartSkeleton,
  ssr: false,
});

interface DashboardWidgetsProps {
  timeSeriesData: TimeSeriesDataPoint[];
  velocityData: any[]; // Using any to avoid complex type duplication for now, could allow strict types if needed
  contributors: any[];
  prs?: Array<{ additions: number; deletions: number; title: string; createdAt: Date }>;
}

export function DashboardWidgets({ timeSeriesData, velocityData, contributors, prs = [] }: DashboardWidgetsProps) {
  return (
    <>
      <DORAMetrics />
      
      {/* Repository Health & PR Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <RepoHealthScore />
        <PRSizeAnalysis prs={prs} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <MetricsChart data={timeSeriesData} />
        <VelocityChart data={velocityData} />
      </div>

      {/* Burnout Heatmap */}
      <BurnoutHeatmap />

      {/* Collaboration & Weekly Digest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <CollaborationGraph contributors={contributors.map(c => c.login || c.name)} />
        <WeeklyDigest />
      </div>

      {/* Contributors */}
      <ContributorLeaderboard contributors={contributors} />
    </>
  );
}
