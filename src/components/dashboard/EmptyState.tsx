'use client';

import { GitBranch, ArrowRight, BarChart3, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'no-repos' | 'no-data' | 'no-prs' | 'no-contributors';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const configs = {
    'no-repos': {
      icon: GitBranch,
      defaultTitle: 'No repositories connected',
      defaultDescription: 'Connect your GitHub repositories to start tracking metrics and insights.',
      defaultActionLabel: 'Connect Repository',
      defaultActionHref: '/setup',
      color: 'violet',
    },
    'no-data': {
      icon: BarChart3,
      defaultTitle: 'No data available',
      defaultDescription: 'Sync your repositories to populate metrics and visualizations.',
      defaultActionLabel: 'Sync Now',
      defaultActionHref: undefined,
      color: 'teal',
    },
    'no-prs': {
      icon: TrendingUp,
      defaultTitle: 'No pull requests found',
      defaultDescription: 'Once you create pull requests, they will appear here with detailed analytics.',
      defaultActionLabel: 'View Documentation',
      defaultActionHref: '#docs',
      color: 'amber',
    },
    'no-contributors': {
      icon: Users,
      defaultTitle: 'No contributors found',
      defaultDescription: 'Contributors will appear here once they start making commits and pull requests.',
      defaultActionLabel: 'Learn More',
      defaultActionHref: '#docs',
      color: 'cyan',
    },
  };

  const config = configs[type];
  const Icon = config.icon;
  const colorClasses = {
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  // Mock data visualization for empty state
  const MockChart = () => (
    <div className="mt-6 p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
      <div className="flex items-end justify-center gap-1 h-24">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-violet-500/20 to-violet-500/10 rounded-t transition-all"
            style={{
              height: `${30 + Math.sin(i / 2) * 15 + Math.random() * 10}%`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 text-center text-xs text-slate-500">
        Example: Your metrics will appear here
      </div>
    </div>
  );

  const ActionButton = () => {
    if (onAction) {
      return (
        <button
          onClick={onAction}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all shadow-glow hover:shadow-glow-lg hover:scale-[1.02]`}
        >
          {actionLabel || config.defaultActionLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      );
    }

    if (actionHref || config.defaultActionHref) {
      return (
        <Link
          href={actionHref || config.defaultActionHref!}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all shadow-glow hover:shadow-glow-lg hover:scale-[1.02]`}
        >
          {actionLabel || config.defaultActionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="max-w-md mx-auto text-center py-12 animate-fade-in-up">
      <div className="glass-card noise p-8">
        <div className={`h-16 w-16 rounded-2xl ${colorClasses[config.color as keyof typeof colorClasses]} flex items-center justify-center mx-auto mb-6 animate-float`}>
          <Icon className="h-8 w-8" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">
          {title || config.defaultTitle}
        </h2>
        
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          {description || config.defaultDescription}
        </p>

        {type === 'no-data' && <MockChart />}

        <div className="mt-8">
          <ActionButton />
        </div>
      </div>
    </div>
  );
}
