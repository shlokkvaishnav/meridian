import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { getTopContributors, getTimeSeriesData } from '@/lib/metrics';
import ContributorLeaderboard from '@/components/ContributorLeaderboard';
import MetricsChart from '@/components/MetricsChart';
import InsightsDisplay from '@/components/InsightsDisplay';
import { generateInsights } from '@/lib/insights';
import { Activity, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const settings = await db.appSettings.findFirst();

  if (!settings) {
    redirect('/setup');
  }

  const repositories = await db.repository.findMany({
    where: { isActive: true },
    orderBy: { lastSyncedAt: 'desc' },
    include: {
      _count: {
        select: { pullRequests: true },
      },
    },
  });

  const recentPRs = await db.pullRequest.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      repository: {
        select: {
          name: true,
          fullName: true,
        },
      },
    },
  });

  const totalPRs = await db.pullRequest.count();
  const mergedPRs = await db.pullRequest.count({ where: { state: 'MERGED' } });
  const openPRs = await db.pullRequest.count({ where: { state: 'OPEN' } });

  const contributors = await getTopContributors(10);
  const timeSeriesData = await getTimeSeriesData(30);

  let insights: Awaited<ReturnType<typeof generateInsights>> = [];
  try {
    insights = await generateInsights();
  } catch (e) {
    console.error('Failed to generate insights for dashboard:', e);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="h-7 w-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <span className="text-base font-semibold text-white tracking-tight">Meridian</span>
            </Link>

            {settings.githubLogin && (
              <div className="flex items-center gap-2 pl-5 border-l border-white/[0.06]">
                {settings.avatarUrl && (
                  <img
                    src={settings.avatarUrl}
                    alt={settings.githubLogin}
                    className="h-6 w-6 rounded-full ring-1 ring-white/10"
                  />
                )}
                <span className="text-sm text-slate-400">{settings.githubLogin}</span>
              </div>
            )}
          </div>

          {settings.lastSyncedAt && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span className="font-mono">
                {formatDistanceToNow(new Date(settings.lastSyncedAt), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        <DashboardClient
          repositories={repositories}
          recentPRs={recentPRs}
          stats={{
            total: totalPRs,
            merged: mergedPRs,
            open: openPRs,
          }}
          hasData={repositories.length > 0}
        />

        {repositories.length > 0 && (
          <>
            <InsightsDisplay initialInsights={insights} />
            <MetricsChart data={timeSeriesData} />
            <ContributorLeaderboard contributors={contributors} />
          </>
        )}
      </main>
    </div>
  );
}
