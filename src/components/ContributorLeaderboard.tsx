'use client';

import { ContributorStats, formatDuration } from '@/lib/metrics';
import { Users, GitPullRequest, GitMerge, MessageSquare } from 'lucide-react';

interface ContributorLeaderboardProps {
  contributors: ContributorStats[];
}

export default function ContributorLeaderboard({ contributors }: ContributorLeaderboardProps) {
  if (contributors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Top Contributors</h2>
      </div>

      <div className="space-y-4">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.login}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 text-center">
              <span
                className={`text-lg font-bold ${
                  index === 0
                    ? 'text-yellow-400'
                    : index === 1
                    ? 'text-gray-300'
                    : index === 2
                    ? 'text-orange-400'
                    : 'text-slate-400'
                }`}
              >
                {index + 1}
              </span>
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {contributor.avatarUrl ? (
                <img
                  src={contributor.avatarUrl}
                  alt={contributor.login}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{contributor.login}</p>
                <p className="text-slate-400 text-xs">
                  {contributor.linesAdded + contributor.linesDeleted} lines changed
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="flex items-center gap-1 text-white font-semibold">
                  <GitPullRequest className="h-3 w-3" />
                  {contributor.prsOpened}
                </div>
                <div className="text-slate-400 text-xs">PRs</div>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-1 text-green-400 font-semibold">
                  <GitMerge className="h-3 w-3" />
                  {contributor.prsMerged}
                </div>
                <div className="text-slate-400 text-xs">Merged</div>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-1 text-blue-400 font-semibold">
                  <MessageSquare className="h-3 w-3" />
                  {contributor.reviewsGiven}
                </div>
                <div className="text-slate-400 text-xs">Reviews</div>
              </div>

              {contributor.avgTimeToMerge && (
                <div className="text-center">
                  <div className="text-purple-400 font-semibold">
                    {formatDuration(contributor.avgTimeToMerge)}
                  </div>
                  <div className="text-slate-400 text-xs">Avg Merge</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
