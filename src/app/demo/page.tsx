'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, TrendingUp, Clock, Users, GitMerge, BarChart3, Zap } from 'lucide-react';
import { DORAMetrics } from '@/components/dashboard/DORAMetrics';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

// Mock data for demo
const mockMetrics = {
  cycleTime: { p50: 1.2, p95: 3.5, trend: -15 },
  reviewVelocity: { avg: 18, trend: 8 },
  throughput: { weekly: 42, trend: 15 },
  contributors: { active: 24, new: 3 },
};

const mockPRs = [
  { id: 1, title: 'Add authentication middleware', size: 245, status: 'merged', cycleTime: 1.2 },
  { id: 2, title: 'Refactor user service', size: 1200, status: 'open', cycleTime: 3.5 },
  { id: 3, title: 'Fix memory leak in cache', size: 45, status: 'merged', cycleTime: 0.8 },
  { id: 4, title: 'Update API documentation', size: 320, status: 'merged', cycleTime: 1.5 },
  { id: 5, title: 'Implement feature flags', size: 890, status: 'open', cycleTime: 2.1 },
];

export default function DemoPage() {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky z-10 border-b border-white/[0.06] top-0 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-7 w-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <span className="text-base font-semibold text-white tracking-tight">Meridian</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              Demo Mode
            </div>
            <ThemeToggle />
            <Link
              href="/setup"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        {/* Demo Banner */}
        <div className="glass-card p-6 border-2 border-violet-500/20 bg-violet-500/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Interactive Demo Dashboard</h1>
              <p className="text-slate-400">
                Explore Meridian's features with sample data. Connect your GitHub to see your real metrics.
              </p>
            </div>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all"
            >
              Connect Your Repo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'cycle-time',
              label: 'P95 Cycle Time',
              value: `${mockMetrics.cycleTime.p95}d`,
              trend: mockMetrics.cycleTime.trend,
              icon: Clock,
              color: 'violet',
            },
            {
              id: 'velocity',
              label: 'Review Velocity',
              value: `${mockMetrics.reviewVelocity.avg}/hr`,
              trend: mockMetrics.reviewVelocity.trend,
              icon: TrendingUp,
              color: 'teal',
            },
            {
              id: 'throughput',
              label: 'PR Throughput',
              value: mockMetrics.throughput.weekly.toString(),
              trend: mockMetrics.throughput.trend,
              icon: GitMerge,
              color: 'amber',
            },
            {
              id: 'contributors',
              label: 'Active Contributors',
              value: mockMetrics.contributors.active.toString(),
              trend: mockMetrics.contributors.new,
              icon: Users,
              color: 'cyan',
            },
          ].map((metric) => (
            <div
              key={metric.id}
              className={`glass-card noise p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/30 ${
                hoveredMetric === metric.id ? 'border-violet-500/40 bg-violet-500/10' : ''
              }`}
              onMouseEnter={() => setHoveredMetric(metric.id)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    metric.color === 'violet'
                      ? 'bg-violet-500/10 text-violet-400'
                      : metric.color === 'teal'
                      ? 'bg-teal-500/10 text-teal-400'
                      : metric.color === 'amber'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-cyan-500/10 text-cyan-400'
                  }`}
                >
                  <metric.icon className="h-5 w-5" />
                </div>
                <div className={`text-xs font-medium ${metric.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                </div>
              </div>
              <div className="font-metric text-3xl text-white mb-1">{metric.value}</div>
              <div className="text-sm text-slate-400">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* DORA Metrics */}
        <DORAMetrics
          metrics={{
            deploymentFrequency: 2.3,
            leadTimeForChanges: 18,
            changeFailureRate: 3.2,
            timeToRestoreService: 45,
          }}
        />

        {/* Recent PRs */}
        <div className="glass-card noise p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Pull Requests</h2>
          <div className="space-y-3">
            {mockPRs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:border-white/[0.1] transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-white">{pr.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        pr.status === 'merged'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {pr.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{pr.size} lines</span>
                    <span>•</span>
                    <span>Cycle time: {pr.cycleTime}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-card p-8 text-center border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-teal-500/[0.05]">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to see your real data?</h2>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Connect your GitHub repository and get insights in under 60 seconds. No credit card required.
          </p>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all shadow-glow hover:shadow-glow-lg hover:scale-[1.02]"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
