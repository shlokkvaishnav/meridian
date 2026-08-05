'use client';

import { useState } from 'react';
import { TrendingUp, Clock, Users, GitMerge } from 'lucide-react';

const metrics = [
  { id: 'cycle-time', label: 'P95 Cycle Time', value: '2.3d', trend: '+12%', icon: Clock, color: 'text-primary' },
  { id: 'velocity', label: 'Review Velocity', value: '18/hr', trend: '+8%', icon: TrendingUp, color: 'text-emerald' },
  { id: 'throughput', label: 'PR Throughput', value: '42', trend: '+15%', icon: GitMerge, color: 'text-amber' },
  { id: 'contributors', label: 'Active Contributors', value: '24', trend: '+3', icon: Users, color: 'text-primary' },
];

// Deterministic bar heights (not Math.random()) so server and client render
// identically — a random value here would cause a hydration mismatch.
const CHART_HEIGHTS = [42, 55, 38, 61, 48, 67, 52, 71, 58, 64, 45, 69, 56, 73];

export function InteractiveHero() {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  return (
    <div className="relative mt-12 max-w-5xl mx-auto">
      <div className="glass-card noise p-8 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.08] to-emerald/[0.05]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className={`glass-card p-4 cursor-pointer transition-all duration-300 ${
                hoveredMetric === metric.id
                  ? 'scale-105 border-primary/40 bg-primary/10'
                  : 'hover:border-foreground/[0.1]'
              }`}
              onMouseEnter={() => setHoveredMetric(metric.id)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-xs text-emerald font-medium">{metric.trend}</span>
              </div>
              <div className="font-metric text-2xl text-foreground mb-1">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="h-32 bg-foreground/[0.02] rounded-lg border border-foreground/[0.05] flex items-end justify-center gap-1 p-4">
          {CHART_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-primary/40 to-primary/20 rounded-t transition-all duration-500 hover:from-primary/60 hover:to-primary/40"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {hoveredMetric && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-muted-foreground">
            <span className="text-primary font-medium">Insight:</span>{' '}
            {hoveredMetric === 'cycle-time'
              ? 'Cycle time increased due to 3 PRs stuck in review for 5+ days'
              : hoveredMetric === 'velocity'
              ? 'Review velocity improved after implementing async review guidelines'
              : hoveredMetric === 'throughput'
              ? 'Throughput spike correlates with sprint planning completion'
              : 'New contributors joined the team this week'}
          </div>
        )}
      </div>

      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <div className="glass-card px-6 py-3 flex items-center gap-3 border-primary/30">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Try it free</span> — No credit card required
          </span>
        </div>
      </div>
    </div>
  );
}
