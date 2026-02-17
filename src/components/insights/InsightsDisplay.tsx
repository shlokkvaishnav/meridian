'use client';

import { useState } from 'react';
import { Insight, generateInsights } from '@/services/insights';
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
    try {
      const res = await fetch('/api/insights', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();

      if (data.success) {
        setInsights(data.insights);
        toast.success("Insights refreshed");
      } else {
        toast.error(data.error || 'Failed to generate insights');
      }
    } catch (err: any) {
      console.error('Failed to generate insights:', err);
      toast.error('Failed to connect to insights engine');
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
