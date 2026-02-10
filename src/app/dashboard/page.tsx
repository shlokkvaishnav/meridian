import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { getTopContributors, getTimeSeriesData } from '@/lib/metrics';
import ContributorLeaderboard from '@/components/ContributorLeaderboard';
import MetricsChart from '@/components/MetricsChart';
import InsightsDisplay from '@/components/InsightsDisplay';
import { generateInsights } from '@/lib/insights';

export default async function DashboardPage() {
  // Check if setup is complete
  const settings = await db.appSettings.findFirst();
  
  if (!settings) {
    redirect('/setup');
  }

  // Fetch repositories
  const repositories = await db.repository.findMany({
    where: { isActive: true },
    orderBy: { lastSyncedAt: 'desc' },
    include: {
      _count: {
        select: { pullRequests: true },
      },
    },
  });

  // Fetch recent PRs
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

  // Calculate basic metrics
  const totalPRs = await db.pullRequest.count();
  const mergedPRs = await db.pullRequest.count({
    where: { state: 'MERGED' },
  });
  const openPRs = await db.pullRequest.count({
    where: { state: 'OPEN' },
  });

  // Get contributor stats and time-series data
  const contributors = await getTopContributors(10);
  const timeSeriesData = await getTimeSeriesData(30);
  
  // Generate insights
  const insights = await generateInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Meridian</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {settings.githubLogin && (
                <>
                  <img
                    src={settings.avatarUrl || ''}
                    alt={settings.githubLogin}
                    className="h-6 w-6 rounded-full"
                  />
                  <span>{settings.githubLogin}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {settings.lastSyncedAt && (
              <span>
                Last synced {formatDistanceToNow(new Date(settings.lastSyncedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
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

        {/* Additional sections only shown when there's data */}
        {repositories.length > 0 && (
          <>
            {/* AI Insights */}
            <InsightsDisplay initialInsights={insights} />

            {/* Metrics Chart */}
            <MetricsChart data={timeSeriesData} />

            {/* Contributor Leaderboard */}
            <ContributorLeaderboard contributors={contributors} />
          </>
        )}
      </main>
    </div>
  );
}
