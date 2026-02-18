'use client';

import { TrendingUp, TrendingDown, Clock, AlertCircle, Zap, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DORAMetric {
  id: string;
  name: string;
  value: string;
  trend: number;
  status: 'good' | 'warning' | 'poor';
  description: string;
  icon: typeof TrendingUp;
}

interface DORAMetricsProps {
  metrics?: Partial<{
    deploymentFrequency: number;
    leadTimeForChanges: number;
    changeFailureRate: number;
    timeToRestoreService: number;
  }>;
}

export function DORAMetrics({ metrics }: DORAMetricsProps) {
  // Mock data - replace with actual data from props
  const doraMetrics: DORAMetric[] = [
    {
      id: 'deployment-frequency',
      name: 'Deployment Frequency',
      value: metrics?.deploymentFrequency ? `${metrics.deploymentFrequency}/day` : '2.3/day',
      trend: 15,
      status: 'good',
      description: 'How often you deploy to production',
      icon: Zap,
    },
    {
      id: 'lead-time',
      name: 'Lead Time for Changes',
      value: metrics?.leadTimeForChanges ? `${metrics.leadTimeForChanges}h` : '18h',
      trend: -12,
      status: 'good',
      description: 'Time from commit to production',
      icon: Clock,
    },
    {
      id: 'change-failure-rate',
      name: 'Change Failure Rate',
      value: metrics?.changeFailureRate ? `${metrics.changeFailureRate}%` : '3.2%',
      trend: -5,
      status: 'good',
      description: 'Percentage of deployments causing failures',
      icon: AlertCircle,
    },
    {
      id: 'time-to-restore',
      name: 'Time to Restore Service',
      value: metrics?.timeToRestoreService ? `${metrics.timeToRestoreService}m` : '45m',
      trend: -20,
      status: 'good',
      description: 'Time to recover from failures',
      icon: Activity,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'warning':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'poor':
        return 'text-red-400 border-red-500/20 bg-red-500/5';
      default:
        return 'text-slate-400 border-slate-500/20 bg-slate-500/5';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-3 w-3" />;
    }
    return <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = (trend: number, metricId: string) => {
    // For deployment frequency and lead time, positive trends are good (more deployments, faster)
    // For failure rate and restore time, negative trends are good (less failures, faster recovery)
    const isPositiveGood = metricId === 'deployment-frequency' || metricId === 'lead-time';
    const isGood = isPositiveGood ? trend > 0 : trend < 0;
    return isGood ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">DORA Metrics</h2>
        <p className="text-sm text-slate-400">
          Industry-standard metrics for measuring engineering performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doraMetrics.map((metric) => (
          <Card
            key={metric.id}
            className={`glass-card noise p-6 border-2 ${getStatusColor(metric.status)} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${getStatusColor(metric.status)}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{metric.name}</h3>
                  <p className="text-xs text-slate-400">{metric.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-metric text-3xl text-white mb-1">{metric.value}</div>
                <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(metric.trend, metric.id)}`}>
                  {getTrendIcon(metric.trend)}
                  <span>{Math.abs(metric.trend)}%</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="glass-card p-4 border border-violet-500/20 bg-violet-500/5">
        <p className="text-xs text-slate-400">
          <span className="text-violet-400 font-medium">DORA Metrics</span> are based on{' '}
          <a
            href="https://www.devops-research.com/research.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Google's DevOps Research and Assessment (DORA)
          </a>
          {' '}research. Elite performers typically deploy multiple times per day with lead times under an hour.
        </p>
      </div>
    </div>
  );
}
