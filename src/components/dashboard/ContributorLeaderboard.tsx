 'use client';
 
 import Image from 'next/image';
 import { ContributorStats, formatDuration } from '@/types/metrics';
 import { Users, GitPullRequest, GitMerge, MessageSquare, Clock, Trophy } from 'lucide-react';
 
 interface ContributorLeaderboardProps {
   contributors: ContributorStats[];
 }
 
 export default function ContributorLeaderboard({ contributors }: ContributorLeaderboardProps) {
   if (contributors.length === 0) {
     return null;
   }
 
   const getRankStyle = (index: number) => {
     if (index === 0) return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
     if (index === 1) return 'bg-slate-400/10 border-slate-400/30 text-slate-300';
     if (index === 2) return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
     return 'bg-white/[0.03] border-white/[0.06] text-slate-500';
   };
 
   return (
     <div className="glass-card noise p-6 animate-fade-in-up">
       <div className="flex items-center gap-2 mb-6">
         <Trophy className="h-4 w-4 text-violet-400" />
         <h2 className="text-base font-semibold text-white tracking-tight">Top Contributors</h2>
       </div>
 
       <div className="space-y-2">
         {contributors.map((contributor, index) => (
           <div
             key={contributor.login}
             className={`flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
           >
             {/* Rank */}
             <div className={`flex-shrink-0 h-7 w-7 rounded-lg border flex items-center justify-center text-xs font-mono font-bold ${getRankStyle(index)}`}>
               {index + 1}
             </div>
 
             {/* Avatar & Name */}
             <div className="flex items-center gap-3 flex-1 min-w-0">
               {contributor.avatarUrl ? (
                 <Image
                   src={contributor.avatarUrl}
                   alt={contributor.login}
                   className="h-8 w-8 rounded-full ring-1 ring-white/10"
                   width={32}
                   height={32}
                 />
               ) : (
                 <div className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                   <Users className="h-4 w-4 text-violet-400" />
                 </div>
               )}
               <div className="flex-1 min-w-0">
                 <p className="text-sm text-white font-medium truncate">{contributor.login}</p>
                 <p className="text-[10px] text-slate-500 font-mono">
                   {(contributor.linesAdded + contributor.linesDeleted).toLocaleString()} lines
                 </p>
               </div>
             </div>
 
             {/* Stats */}
             <div className="flex gap-5 text-xs">
               <div className="text-center">
                 <div className="flex items-center gap-1 text-white font-mono font-semibold">
                   <GitPullRequest className="h-3 w-3 text-slate-500" />
                   {contributor.prsOpened}
                 </div>
                 <div className="text-[10px] text-slate-500 mt-0.5">PRs</div>
               </div>
 
               <div className="text-center">
                 <div className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                   <GitMerge className="h-3 w-3 text-emerald-500/50" />
                   {contributor.prsMerged}
                 </div>
                 <div className="text-[10px] text-slate-500 mt-0.5">Merged</div>
               </div>
 
               <div className="text-center">
                 <div className="flex items-center gap-1 text-sky-400 font-mono font-semibold">
                   <MessageSquare className="h-3 w-3 text-sky-500/50" />
                   {contributor.reviewsGiven}
                 </div>
                 <div className="text-[10px] text-slate-500 mt-0.5">Reviews</div>
               </div>
 
               {contributor.avgTimeToMerge && (
                 <div className="text-center">
                   <div className="flex items-center gap-1 text-violet-400 font-mono font-semibold">
                     <Clock className="h-3 w-3 text-violet-500/50" />
                     {formatDuration(contributor.avgTimeToMerge)}
                   </div>
                   <div className="text-[10px] text-slate-500 mt-0.5">Avg</div>
                 </div>
               )}
             </div>
           </div>
         ))}
       </div>
     </div>
   );
 }
