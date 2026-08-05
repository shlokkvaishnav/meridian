'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleDot } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface RealtimeSubscriptionProps {
  ownerId: string;
}

export function RealtimeSubscription({ ownerId }: RealtimeSubscriptionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Silently fail if Supabase not configured - webhooks will still work
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Subscribe to PullRequest changes
    const prChannel = supabase
      .channel('pull-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'PullRequest',
          filter: `repository.ownerId=eq.${ownerId}`,
        },
        (payload) => {
          console.log('Real-time PR update:', payload);
          setLastUpdate(new Date());
          // Soft refresh - update data without full page reload
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Review',
          filter: `pullRequest.repository.ownerId=eq.${ownerId}`,
        },
        (payload) => {
          console.log('Real-time Review update:', payload);
          setLastUpdate(new Date());
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Repository',
          filter: `ownerId=eq.${ownerId}`,
        },
        (payload) => {
          console.log('Real-time Repository update:', payload);
          setLastUpdate(new Date());
          router.refresh();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active');
        }
      });

    return () => {
      supabase.removeChannel(prChannel);
    };
  }, [ownerId, router]);

  if (!isConnected) {
    return null; // Don't show indicator if not connected
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
      <div className="relative">
        <CircleDot className="h-3 w-3 text-emerald-400" />
        <div className="absolute inset-0 animate-ping">
          <div className="h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
        </div>
      </div>
      <span className="text-xs text-emerald-400 font-medium">Live</span>
      {lastUpdate && (
        <span className="text-xs text-emerald-500/70">
          Updated {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
