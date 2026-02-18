'use client';

import { useState } from 'react';
import { Insight } from '@/services/insights';
import { InsightList } from './InsightList';
import { toast } from 'sonner';

interface InsightsDisplayProps {
  initialInsights?: Insight[];
}

export default function InsightsDisplay({ initialInsights = [] }: InsightsDisplayProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [generating, setGenerating] = useState(false);

  const handleGenerateInsights = async () => {
    setGenerating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for slow AI/generation
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      if (data.success) {
        setInsights(data.insights);
        toast.success("Insights refreshed");
      } else {
        toast.error(data.error || 'Failed to generate insights');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        toast.error('Request timed out. Try again or check your connection.');
      } else {
        console.error('Failed to generate insights:', err);
        toast.error(err?.message || 'Failed to connect to insights engine');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDismiss = (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
    toast.success("Insight dismissed");
  };

  const handleActioned = (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
    toast.success("Insight marked as actioned");
  };

  return (
    <InsightList 
      insights={insights}
      loading={generating}
      onRefresh={handleGenerateInsights}
      onDismiss={handleDismiss}
      onMarkActioned={handleActioned}
    />
  );
}
