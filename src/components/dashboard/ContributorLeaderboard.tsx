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
       if (index === 0) return 'bg-amber-500/15 border-amber-500/30 text-amber-500';
       if (index === 1) return 'bg-slate-400/10 border-slate-400/30 text-slate-300';
       if (index === 2) return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
       return 'bg-secondary border-border text-muted-foreground';
     };
   
     return (
       <div className="rounded-2xl border border-border bg-card p-6 animate-fade-in-up">
         <div className="flex items-center gap-2 mb-6">
           <Trophy className="h-4 w-4 text-primary" />
           <h2 className="text-sm font-semibold text-foreground tracking-tight">Top Contributors</h2>
         </div>
   
         <div className="space-y-2">
           {contributors.map((contributor, index) => (
             <div
               key={contributor.login}
               className={`flex items-center gap-4 p-3.5 rounded-xl border border-transparent bg-secondary/30 hover:bg-secondary/60 hover:border-border transition-all duration-300 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
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
                     className="h-8 w-8 rounded-full ring-1 ring-border"
                     width={32}
                     height={32}
                   />
                 ) : (
                   <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                     <Users className="h-4 w-4 text-primary" />
                   </div>
                 )}
                 <div className="flex-1 min-w-0">
                   <p className="text-sm text-foreground font-medium truncate">{contributor.login}</p>
                   <p className="text-[10px] text-muted-foreground font-mono">
                     {(contributor.linesAdded + contributor.linesDeleted).toLocaleString()} lines
                   </p>
                 </div>
               </div>
   
               {/* Stats */}
               <div className="flex gap-4 text-xs sm:gap-6">
                 <div className="text-center">
                   <div className="flex items-center gap-1 text-foreground font-mono font-semibold">
                     <GitPullRequest className="h-3 w-3 text-muted-foreground" />
                     {contributor.prsOpened}
                   </div>
                   <div className="text-[10px] text-muted-foreground mt-0.5">PRs</div>
                 </div>
   
                 <div className="text-center">
                   <div className="flex items-center gap-1 text-emerald-500 font-mono font-semibold">
                     <GitMerge className="h-3 w-3 text-emerald-500/50" />
                     {contributor.prsMerged}
                   </div>
                   <div className="text-[10px] text-muted-foreground mt-0.5">Merged</div>
                 </div>
   
                 <div className="text-center hidden sm:block">
                   <div className="flex items-center gap-1 text-sky-500 font-mono font-semibold">
                     <MessageSquare className="h-3 w-3 text-sky-500/50" />
                     {contributor.reviewsGiven}
                   </div>
                   <div className="text-[10px] text-muted-foreground mt-0.5">Reviews</div>
                 </div>
   
                 {contributor.avgTimeToMerge && (
                   <div className="text-center hidden sm:block">
                     <div className="flex items-center gap-1 text-violet-400 font-mono font-semibold">
                       <Clock className="h-3 w-3 text-violet-500/50" />
                       {formatDuration(contributor.avgTimeToMerge)}
                     </div>
                     <div className="text-[10px] text-muted-foreground mt-0.5">Avg</div>
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>
       </div>
     );
   }
