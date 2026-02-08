// Shared type definitions

export interface MetricContext {
  organizationId: string;
  timeRange: { start: Date; end: Date };
  
  metrics: {
    cycleTime: {
      current: { p50: number; p75: number; p95: number };
      baseline: { p50: number; p75: number; p95: number };
      change: { percent: number; isSignificant: boolean };
    };
    
    reviewTime: {
      current: { p50: number };
      baseline: { p50: number };
      change: { percent: number; isSignificant: boolean };
      
      bottlenecks: Array<{
        reviewer: string;
        avgReviewTime: number;
        reviewCount: number;
      }>;
    };
    
    prThroughput: {
      current: { opened: number; merged: number; closeRate: number };
      baseline: { opened: number; merged: number; closeRate: number };
    };
    
    workDistribution: {
      giniCoefficient: number;
      topContributors: Array<{ developer: string; prCount: number; percentage: number }>;
    };
  };
  
  detectedAnomalies: Array<{
    type: 'cycle_time_spike' | 'review_bottleneck' | 'work_imbalance' | 'burnout_signal';
    severity: 'low' | 'medium' | 'high';
    affectedEntity: string;
    metricEvidence: Record<string, unknown>;
  }>;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface SyncCheckpoint {
  jobId: string;
  phase: 'repos' | 'prs' | 'reviews' | 'commits';
  cursor: string;
  processedCount: number;
  startedAt: Date;
}
