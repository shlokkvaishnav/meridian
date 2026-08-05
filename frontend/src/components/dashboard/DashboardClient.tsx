'use client';

import { useState } from 'react';
import { RefreshCw, GitPullRequest, GitMerge, GitBranch } from 'lucide-react';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricDrillDown } from '@/components/dashboard/MetricDrillDown';
import { RepoGrid } from '@/components/dashboard/RepoGrid';
import { RecentPRs } from '@/components/dashboard/RecentPRs';

 interface Repository {
   id: string;
   name: string;
   fullName: string;
   lastSyncedAt: Date | null;
   _count: {
     pullRequests: number;
   };
 }

 interface PullRequest {
   id: string;
   number: number;
   title: string;
   state: string;
   authorLogin: string;
   authorAvatarUrl: string | null;
   createdAt: Date;
   mergedAt: Date | null;
   closedAt: Date | null;
   repository: {
     name: string;
     fullName: string;
   };
 }

 interface DashboardClientProps {
   repositories: Repository[];
   recentPRs: PullRequest[];
   stats: {
     total: number;
     merged: number;
     open: number;
   };
   hasData: boolean;
 }

 export default function DashboardClient({ repositories, recentPRs, stats, hasData }: DashboardClientProps) {
   const [syncing, setSyncing] = useState(false);
   const [syncError, setSyncError] = useState('');
   const [drillDownState, setDrillDownState] = useState<{
     open: boolean;
     title: string;
     description: string;
     prs: PullRequest[];
   }>({  
     open: false,
     title: '',
     description: '',
     prs: [],
   });

   const handleSync = async () => {
     setSyncing(true);
     setSyncError('');

     try {
       const res = await fetch('/api/sync', { method: 'POST' });
       const data = await res.json();

       if (!res.ok) {
         throw new Error(data.error || 'Sync failed');
       }

       window.location.reload();
     } catch (error: any) {
       setSyncError(error.message);
     } finally {
       setSyncing(false);
     }
   };

   const showDrillDown = (title: string, description: string, filterFn: (pr: PullRequest) => boolean) => {
     const filteredPRs = recentPRs.filter(filterFn);
     setDrillDownState({
       open: true,
       title,
       description,
       prs: filteredPRs,
     });
   };

   if (!hasData) {
     return (
       <div className="max-w-md mx-auto text-center py-20 animate-fade-in-up">
         <div className="glass-card noise p-12">
           <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5 animate-float">
             <GitBranch className="h-7 w-7 text-violet-400" />
           </div>
           <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">
             No data yet
           </h2>
           <p className="text-sm text-slate-400 mb-8 leading-relaxed">
             Sync your GitHub repositories to start tracking metrics
           </p>

           <button
             onClick={handleSync}
             disabled={syncing}
             className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all duration-300 disabled:opacity-40 inline-flex items-center gap-2 shadow-glow hover:shadow-glow-lg"
           >
             {syncing ? (
               <>
                 <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 Syncing...
               </>
             ) : (
               <>
                 <RefreshCw className="h-4 w-4" />
                 Sync Now
               </>
             )}
           </button>

           {syncError && (
             <p className="text-red-400 text-xs mt-4">{syncError}</p>
           )}
         </div>
       </div>
     );
   }
   return (
     <div className="space-y-8">
       {/* Stats Grid */}
       <div className="grid md:grid-cols-3 gap-4">
          <MetricCard
            title="Total PRs"
            value={stats.total}
            icon={GitPullRequest}
            isEmpty={stats.total === 0}
            onClick={() => showDrillDown('All Pull Requests', 'All PRs across all repositories', () => true)}
          />
          <MetricCard
            title="Merged PRs"
            value={stats.merged}
            icon={GitMerge}
            isEmpty={stats.merged === 0}
            onClick={() => showDrillDown('Merged Pull Requests', 'PRs that have been merged', (pr) => pr.state === 'MERGED')}
          />
          <MetricCard
            title="Open PRs"
            value={stats.open}
            icon={GitBranch}
            isEmpty={stats.open === 0}
            onClick={() => showDrillDown('Open Pull Requests', 'PRs currently open and awaiting review', (pr) => pr.state === 'OPEN')}
          />
       </div>

       {/* Drill-Down Modal */}
       <MetricDrillDown
         open={drillDownState.open}
         onOpenChange={(open) => setDrillDownState((prev) => ({ ...prev, open }))}
         title={drillDownState.title}
         description={drillDownState.description}
         prs={drillDownState.prs}
       />

       {/* Repositories Header */}
       <div className="flex justify-between items-center animate-fade-in-up stagger-4">
         <h2 className="text-lg font-semibold text-white tracking-tight">Repositories</h2>
         <button
           onClick={handleSync}
           disabled={syncing}
           className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 disabled:opacity-40 inline-flex items-center gap-2"
         >
           <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
           {syncing ? 'Syncing...' : 'Sync'}
         </button>
       </div>

       {syncError && (
         <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-red-400 text-xs">
           {syncError}
         </div>
       )}

       {/* Repositories Grid */}
       <RepoGrid repositories={repositories} />

       {/* Recent PRs */}
       {recentPRs.length > 0 && (
         <RecentPRs prs={recentPRs} />
       )}
     </div>
   );
 }
