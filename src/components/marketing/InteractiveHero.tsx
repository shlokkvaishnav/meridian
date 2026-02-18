'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Clock, Users, GitMerge } from 'lucide-react';

export function InteractiveHero() {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const metrics = [
    { id: 'cycle-time', label: 'P95 Cycle Time', value: '2.3d', trend: '+12%', icon: Clock, color: 'violet' },
    { id: 'velocity', label: 'Review Velocity', value: '18/hr', trend: '+8%', icon: TrendingUp, color: 'teal' },
    { id: 'throughput', label: 'PR Throughput', value: '42', trend: '+15%', icon: GitMerge, color: 'amber' },
    { id: 'contributors', label: 'Active Contributors', value: '24', trend: '+3', icon: Users, color: 'cyan' },
  ];

  return (
    <div className="relative mt-12 max-w-5xl mx-auto">
      {/* Mock Dashboard Preview */}
      <div className="glass-card noise p-8 border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-teal-500/[0.05]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className={`glass-card p-4 cursor-pointer transition-all duration-300 ${
                hoveredMetric === metric.id
                  ? 'scale-105 border-violet-500/40 bg-violet-500/10'
                  : 'hover:border-white/[0.1]'
              }`}
              onMouseEnter={() => setHoveredMetric(metric.id)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon
                  className={`h-4 w-4 ${
                    metric.color === 'violet'
                      ? 'text-violet-400'
                      : metric.color === 'teal'
                      ? 'text-teal-400'
                      : metric.color === 'amber'
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`}
                />
                <span className="text-xs text-emerald-400 font-medium">{metric.trend}</span>
              </div>
              <div className="font-metric text-2xl text-white mb-1">{metric.value}</div>
              <div className="text-xs text-slate-400">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Mini Chart Preview */}
        <div className="h-32 bg-white/[0.02] rounded-lg border border-white/[0.05] flex items-end justify-center gap-1 p-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-violet-500/40 to-violet-500/20 rounded-t transition-all duration-500 hover:from-violet-500/60 hover:to-violet-500/40"
              style={{
                height: `${30 + Math.sin(i / 2) * 20 + Math.random() * 15}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>

        {hoveredMetric && (
          <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm text-slate-300">
            <span className="text-violet-400 font-medium">Insight:</span>{' '}
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

      {/* CTA Overlay */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <div className="glass-card px-6 py-3 flex items-center gap-3 border-violet-500/30">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-sm text-slate-300">
            <span className="text-white font-medium">Try it free</span> — No credit card required
          </span>
        </div>
      </div>
    </div>
  );
}
