'use client';

import { useState } from 'react';
import { RefreshCw, GitPullRequest, GitMerge, GitBranch, Folder } from 'lucide-react';

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

      // Reload page to show new data
      window.location.reload();
    } catch (error: any) {
      setSyncError(error.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!hasData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
          <GitBranch className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No Data Yet
          </h2>
          <p className="text-slate-400 mb-6">
            Start by syncing your GitHub repositories
          </p>
          
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {syncing ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            <p className="text-red-400 text-sm mt-4">{syncError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total PRs</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <GitPullRequest className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Merged</p>
              <p className="text-3xl font-bold text-white">{stats.merged}</p>
            </div>
            <GitMerge className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Open</p>
              <p className="text-3xl font-bold text-white">{stats.open}</p>
            </div>
            <GitBranch className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Repositories</h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 inline-flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Repositories List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start gap-3">
              <Folder className="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{repo.name}</h3>
                <p className="text-slate-400 text-sm truncate">{repo.fullName}</p>
                <p className="text-slate-500 text-xs mt-2">
                  {repo._count.pullRequests} PRs
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Pull Requests</h2>
          <div className="space-y-2">
            {recentPRs.map((pr) => (
              <div
                key={pr.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{pr.title}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {pr.repository.name} #{pr.number} by {pr.authorLogin}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      pr.state === 'MERGED'
                        ? 'bg-purple-500/20 text-purple-400'
                        : pr.state === 'OPEN'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-500/20 text-slate-400'
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
