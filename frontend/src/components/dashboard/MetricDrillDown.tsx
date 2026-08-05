'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

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

interface MetricDrillDownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  prs: PullRequest[];
  loading?: boolean;
}

export function MetricDrillDown({
  open,
  onOpenChange,
  title,
  description,
  prs,
  loading = false,
}: MetricDrillDownProps) {
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </DialogHeader>

        {prs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pull requests found</p>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {prs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between rounded-xl border border-transparent bg-secondary/30 px-4 py-3 transition-colors hover:border-border hover:bg-secondary/60 cursor-pointer group"
              >
                <div className="flex-1 min-w-0 mr-4">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {pr.title}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                   </div>
                   <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{pr.repository.name}#{pr.number}</span>
                      <span>•</span>
                      {pr.authorAvatarUrl ? (
                        <img
                          src={pr.authorAvatarUrl}
                          alt={pr.authorLogin}
                          className="h-4 w-4 rounded-full"
                        />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[8px] text-primary">{pr.authorLogin[0]}</span>
                        </div>
                      )}
                      <span>{pr.authorLogin}</span>
                      {pr.mergedAt && (
                        <>
                          <span>•</span>
                          <span>
                            Merged {formatDistanceToNow(new Date(pr.mergedAt), { addSuffix: true })}
                          </span>
                        </>
                      )}
                   </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider flex-shrink-0 ${
                    pr.state === 'MERGED'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : pr.state === 'OPEN'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {pr.state}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
