'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Clock,
  ChevronDown,
  X,
  Check,
  Target,
  Lightbulb,
  AlertCircle,
  Info,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Insight } from '@/services/insights';
import { InsightType, InsightCategory } from '@/services/insights';

interface InsightCardProps {
  insight: Insight;
  onDismiss?: (id: string) => void;
  onMarkActioned?: (id: string) => void;
  className?: string;
}

const CATEGORY_ICONS = {
  VELOCITY: TrendingUp,
  QUALITY: AlertTriangle,
  COLLABORATION: Users,
  BURNOUT: Clock,
  BOTTLENECK: Clock,
  WORKLOAD: Users,
} as const;

// Fallback for unknown categories
const DEFAULT_CATEGORY_ICON = Lightbulb;

const SEVERITY_STYLES = {
  WARNING: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20',
  CAUTION: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
  INFO: 'border-l-sky-500 bg-sky-50/50 dark:bg-sky-950/20',
  SUCCESS: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
} as const;

const SEVERITY_BADGE_VARIANT = {
  WARNING: 'destructive',
  CAUTION: 'warning', // We'll need to ensure this variant exists or map to default/secondary
  INFO: 'secondary',
  SUCCESS: 'outline', // Or a success variant if we add one
} as const;

export function InsightCard({
  insight,
  onDismiss,
  onMarkActioned,
  className,
}: InsightCardProps) {
  const Icon = CATEGORY_ICONS[insight.category as keyof typeof CATEGORY_ICONS] || DEFAULT_CATEGORY_ICON;
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Map our custom types to shadcn Badge variants (which are limited by default)
  const badgeVariant = 
    insight.type === 'WARNING' ? 'destructive' :
    insight.type === 'CAUTION' ? 'secondary' : // 'warning' isn't default shadcn
    insight.type === 'SUCCESS' ? 'outline' : 
    'secondary';
  
  return (
    <Card 
      className={cn(
        'border-l-4 transition-all duration-200',
        'hover:shadow-md hover:scale-[1.01]',
        SEVERITY_STYLES[insight.type],
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="mt-1 flex-shrink-0">
            <div className="p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 shadow-sm">
              <Icon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                {insight.title}
              </CardTitle>
              <Badge variant={badgeVariant} className="uppercase tracking-wider text-[10px]">
                {insight.type}
              </Badge>
            </div>
            
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {insight.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        {/* Recommended Action */}
        {insight.action && (
          <div className="p-3 rounded-md bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/5">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Recommended Action
            </p>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {insight.action}
            </p>
          </div>
        )}
        
        {/* Metric Evidence (Expandable) */}
        {insight.metric && (
          <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 pl-1">
            <div className="font-mono font-bold text-base text-neutral-900 dark:text-neutral-100">
              {insight.metric.value}
            </div>
            <div className="text-xs text-neutral-500 border-l pl-3 border-neutral-300 dark:border-neutral-700">
              {insight.metric.label}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 justify-end">
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(insight.id)}
              className="gap-2 h-8 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </Button>
          )}
          
          {onMarkActioned && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkActioned(insight.id)}
              className="gap-2 h-8 bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40"
            >
              <Check className="h-3.5 w-3.5" />
              Actioned
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
