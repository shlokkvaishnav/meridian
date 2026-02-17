 'use client';

 import { useState } from 'react';
 import { RefreshCw, GitPullRequest, GitMerge, GitBranch, Folder, ArrowUpRight } from 'lucide-react';
 import { MetricCard } from '@/components/metrics/MetricCard';

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
   createdAt: Date;
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
          className="border-violet-200 dark:border-violet-900/50 bg-violet-50/30 dark:bg-violet-950/10"
        />
        <MetricCard
          title="Merged PRs"
          value={stats.merged}
          icon={GitMerge}
          className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10"
        />
        <MetricCard
          title="Open PRs"
          value={stats.open}
          icon={GitBranch}
          className="border-sky-200 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-950/10"
        />
       </div>

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
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
         {repositories.map((repo, i) => (
           <div
             key={repo.id}
             className={`glass-card noise p-5 group animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
           >
             <div className="flex items-start gap-3">
               <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <Folder className="h-4 w-4 text-violet-400" />
               </div>
               <div className="flex-1 min-w-0">
                 <h3 className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                   {repo.name}
                 </h3>
                 <p className="text-xs text-slate-500 truncate mt-0.5">{repo.fullName}</p>
                 <p className="text-xs text-slate-400 mt-2 font-mono">
                   {repo._count.pullRequests} <span className="text-slate-500">PRs</span>
                 </p>
               </div>
             </div>
           </div>
         ))}
       </div>

       {/* Recent PRs */}
       {recentPRs.length > 0 && (
         <div className="animate-fade-in-up stagger-5">
           <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Recent Pull Requests</h2>
           <div className="space-y-1.5">
             {recentPRs.map((pr) => (
               <div
                 key={pr.id}
                 className="glass-card noise !rounded-xl p-4 !bg-white/[0.02] hover:!bg-white/[0.04]"
               >
                 <div className="flex items-center justify-between gap-4">
                   <div className="flex-1 min-w-0">
                     <p className="text-sm text-white truncate">{pr.title}</p>
                     <p className="text-xs text-slate-500 mt-1 font-mono">
                       {pr.repository.name}
                       <span className="text-slate-600"> #{pr.number}</span>
                       <span className="text-slate-600"> · </span>
                       {pr.authorLogin}
                     </p>
                   </div>
                   <span
                     className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider flex-shrink-0 ${
                       pr.state === 'MERGED'
                         ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                         : pr.state === 'OPEN'
                         ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                         : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                     }`}
                   >
                     {pr.state}
                   </span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}
     </div>
   );
 }
