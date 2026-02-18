import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { getTopContributors, getTimeSeriesData } from '@/services/metrics';
import InsightsDisplay from '@/components/insights/InsightsDisplay';
import { generateInsights } from '@/services/insights';
import { Activity, Clock, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/session';
import dynamic from 'next/dynamic';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { ContributorFilter } from '@/components/dashboard/ContributorFilter';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { ThemeToggle } from '@/components/theme/ThemeToggle';



// Force dynamic rendering (renamed to avoid conflict with Next.js dynamic import)
export const dynamicParams = false;
export const revalidate = 0;

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const contributor = typeof searchParams.contributor === 'string' ? searchParams.contributor : undefined;

  const session = await getSession();

  if (!session) {
    redirect('/setup');
  }

  const { settings } = session;

  // Common filter for PR queries
  const prFilter = {
    repository: { ownerId: settings.id },
    ...(contributor ? { authorLogin: contributor } : {}),
  };

  // Parallelize independent data fetching
  const [
    repositories, 
    recentPRs, 
    totalPRs, 
    mergedPRs, 
    openPRs, 
    contributorsForFilter, 
    contributors, 
    timeSeriesData, 
    insights, 
    snapshots
  ] =
    await Promise.all([
      // 1. Repositories (Always all repos)
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

      // 2. Recent PRs (Filtered)
      db.pullRequest.findMany({
        where: prFilter,
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

      // 3. Stats counts (Filtered)
      db.pullRequest.count({
        where: prFilter,
      }),
      db.pullRequest.count({
        where: { state: 'MERGED', ...prFilter },
      }),
      db.pullRequest.count({
        where: { state: 'OPEN', ...prFilter },
      }),

      // 4. Contributors for Filter (Unfiltered, top 50)
      getTopContributors(settings.id, 50),

      // 5. Contributors for Leaderboard (Filtered)
      getTopContributors(settings.id, 10, contributor),

      // 6. Charts (Filtered by time/contributor)
      getTimeSeriesData(settings.id, 30, contributor),

      // 7. Insights (Filtered)
      generateInsights(settings.id, contributor).catch((e) => {
        console.error('Failed to generate insights for dashboard:', e);
        return [];
      }),

      // 8. Velocity Data (Repo level, so NOT filtered by contributor effectively, but we keep it for context)
      // Ideally we would hide this or filter if Snapshot supported it.
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
  
  // If filtering by contributor, hiding velocity chart might be better as it's repo-wide data
  // But let's show it for now with a note or just show it.

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
    <div className="min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

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
            <ContributorFilter contributors={contributorsForFilter} />
            <DateRangePicker />

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span className="font-mono">
                {settings.lastSyncedAt
                  ? `Synced ${new Date(settings.lastSyncedAt).toLocaleDateString()}`
                  : 'Not synced yet'}
              </span>
            </div>
            <ThemeToggle />
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
            <DashboardWidgets 
              timeSeriesData={timeSeriesData}
              velocityData={velocityData}
              contributors={contributors}
            />
          </>
        )}
      </main>
    </div>
  );
}
