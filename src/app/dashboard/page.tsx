import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardClient from '@/features/dashboard/DashboardClient';
import { getTopContributors, getTimeSeriesData } from '@/lib/metrics';
import ContributorLeaderboard from '@/features/dashboard/ContributorLeaderboard';
import MetricsChart from '@/features/dashboard/MetricsChart';
import { VelocityChart } from '@/features/dashboard/VelocityChart';
import InsightsDisplay from '@/features/dashboard/InsightsDisplay';
import { generateInsights } from '@/features/insights';
import { Activity, Clock, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/setup');
  }

  const { settings } = session;

  // Parallelize independent data fetching
  const [repositories, recentPRs, totalPRs, mergedPRs, openPRs, contributors, timeSeriesData, insights, snapshots] =
    await Promise.all([
      // 1. Repositories
      db.repository.findMany({
        where: {
          isActive: true,
          ownerId: settings.id,
        },
        orderBy: { lastSyncedAt: 'desc' },
        include: {
          _count: {
            select: { pullRequests: true },
          },
        },
      }),

      // 2. Recent PRs
      db.pullRequest.findMany({
        where: {
          repository: { ownerId: settings.id },
        },
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
      }),

      // 3. Stats counts
      db.pullRequest.count({
        where: { repository: { ownerId: settings.id } },
      }),
      db.pullRequest.count({
        where: { state: 'MERGED', repository: { ownerId: settings.id } },
      }),
      db.pullRequest.count({
        where: { state: 'OPEN', repository: { ownerId: settings.id } },
      }),

      // 4. Contributors
      getTopContributors(settings.id, 10),

      // 5. Charts
      getTimeSeriesData(settings.id, 30),

      // 6. Insights
      generateInsights(settings.id).catch((e) => {
        console.error('Failed to generate insights for dashboard:', e);
        return [];
      }),

      // 7. Velocity Data
      db.metricSnapshot.findMany({
        where: {
          repository: { ownerId: settings.id },
        },
        orderBy: { date: 'asc' },
        take: 30,
        select: {
          date: true,
          cycleTimeP50: true,
          mergeRate: true,
        },
      }),
    ]);

  type VelocitySnapshot = {
    date: Date;
    cycleTimeP50: number | null;
    mergeRate: number | null;
  };

  const velocityData = (snapshots as VelocitySnapshot[]).map((s) => ({
    date: s.date.toISOString(),
    cycleTimeP50: s.cycleTimeP50,
    mergeRate: s.mergeRate ? Math.round(s.mergeRate * 100) : null,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] left-0 w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky z-10 border-b border-white/[0.06] top-0 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="h-7 w-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <span className="text-base font-semibold text-white tracking-tight">Meridian</span>
            </Link>

            {settings.avatarUrl && (
              <div className="flex items-center gap-2 pl-5 border-l border-white/[0.06]">
                <Image
                  src={settings.avatarUrl}
                  alt={settings.name || settings.githubLogin || 'User'}
                  className="h-6 w-6 rounded-full ring-1 ring-white/10"
                  width={24}
                  height={24}
                />
                <span className="text-sm text-slate-400">
                  {settings.name || settings.githubLogin}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span className="font-mono">
                {settings.lastSyncedAt
                  ? `Synced ${new Date(settings.lastSyncedAt).toLocaleDateString()}`
                  : 'Not synced yet'}
              </span>
            </div>
            <Link
              href="/setup"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <LogOut className="h-3 w-3" />
              Settings
            </Link>
          </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricsChart data={timeSeriesData} />
              <VelocityChart data={velocityData} />
            </div>
            <ContributorLeaderboard contributors={contributors} />
          </>
        )}
      </main>
    </div>
  );
}
