'use client';

import { GitMerge, MessageSquare, Eye, Clock, TrendingUp, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface PR {
  id: string;
  title: string;
  number: number;
  state: string;
  createdAt: Date;
  mergedAt: Date | null;
  repository: { name: string; fullName: string };
}

interface Review {
  id: string;
  state: string;
  createdAt: Date;
  pullRequest: { title: string; number: number; repository: { name: string } };
}

interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  pullRequest: { title: string; number: number; repository: { name: string } };
}

interface ContributorProfileProps {
  login: string;
  metrics: {
    prsAuthored: number;
    prsMerged: number;
    reviewsGiven: number;
    commentsWritten: number;
    avgCycleTime: number;
  };
  prs: PR[];
  reviews: Review[];
  comments: Comment[];
}

export function ContributorProfile({ login, metrics, prs, reviews, comments }: ContributorProfileProps) {
  const mergeRate = metrics.prsAuthored > 0 
    ? Math.round((metrics.prsMerged / metrics.prsAuthored) * 100) 
    : 0;

  const recentPRs = prs.slice(0, 10);
  const recentReviews = reviews.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card noise p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{login}</h1>
            <p className="text-slate-400">Contributor Profile & Analytics</p>
          </div>
          <div className="h-16 w-16 rounded-full bg-violet-500/10 border-2 border-violet-500/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-violet-400" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card noise p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <GitMerge className="h-5 w-5 text-violet-400" />
            </div>
          </div>
          <div className="font-metric text-3xl text-white mb-1">{metrics.prsAuthored}</div>
          <div className="text-sm text-slate-400">PRs Authored</div>
          <div className="text-xs text-emerald-400 mt-1">{mergeRate}% merged</div>
        </Card>

        <Card className="glass-card noise p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-teal-400" />
            </div>
          </div>
          <div className="font-metric text-3xl text-white mb-1">{metrics.reviewsGiven}</div>
          <div className="text-sm text-slate-400">Reviews Given</div>
        </Card>

        <Card className="glass-card noise p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div className="font-metric text-3xl text-white mb-1">{metrics.commentsWritten}</div>
          <div className="text-sm text-slate-400">Comments Written</div>
        </Card>

        <Card className="glass-card noise p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="font-metric text-3xl text-white mb-1">{metrics.avgCycleTime.toFixed(1)}</div>
          <div className="text-sm text-slate-400">Avg Cycle Time</div>
          <div className="text-xs text-slate-500">days</div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent PRs */}
        <Card className="glass-card noise p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-violet-400" />
            Recent Pull Requests
          </h2>
          <div className="space-y-3">
            {recentPRs.length > 0 ? (
              recentPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:border-white/[0.1] transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <Link
                      href={`https://github.com/${pr.repository.fullName}/pull/${pr.number}`}
                      target="_blank"
                      className="text-sm font-medium text-white hover:text-violet-400 transition-colors"
                    >
                      {pr.title}
                    </Link>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        pr.state === 'MERGED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : pr.state === 'OPEN'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      {pr.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{pr.repository.name}</span>
                    <span>•</span>
                    <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">No PRs found</div>
            )}
          </div>
        </Card>

        {/* Recent Reviews */}
        <Card className="glass-card noise p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-teal-400" />
            Recent Reviews
          </h2>
          <div className="space-y-3">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:border-white/[0.1] transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm text-white">
                      {review.pullRequest.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        review.state === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : review.state === 'CHANGES_REQUESTED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      {review.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{review.pullRequest.repository.name}</span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">No reviews found</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
