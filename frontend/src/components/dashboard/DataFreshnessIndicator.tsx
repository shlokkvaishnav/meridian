'use client';

import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DataFreshnessIndicatorProps {
  lastSyncedAt: Date | string | null;
  onRefresh?: () => void;
}

export function DataFreshnessIndicator({ lastSyncedAt, onRefresh }: DataFreshnessIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSyncedAt) {
        setTimeAgo('Never synced');
        setIsStale(true);
        return;
      }

      const now = new Date();
      const synced = new Date(lastSyncedAt);
      const diffMs = now.getTime() - synced.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) {
        setTimeAgo('Just now');
        setIsStale(false);
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}m ago`);
        setIsStale(diffMins > 15);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours}h ago`);
        setIsStale(diffHours > 2);
      } else {
        setTimeAgo(`${diffDays}d ago`);
        setIsStale(true);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
      isStale
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    }`}>
      {isStale ? (
        <AlertCircle className="h-3.5 w-3.5" />
      ) : (
        <Clock className="h-3.5 w-3.5" />
      )}
      <span className="text-xs font-medium font-mono">
        {lastSyncedAt ? `Synced ${timeAgo}` : 'Not synced'}
      </span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
