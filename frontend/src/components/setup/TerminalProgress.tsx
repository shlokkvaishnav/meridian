'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
}

interface TerminalProgressProps {
  steps: Step[];
  currentStep: number;
}

export function TerminalProgress({ steps, currentStep }: TerminalProgressProps) {
  const [displayedSteps, setDisplayedSteps] = useState<Step[]>([]);

  useEffect(() => {
    // Animate steps appearing
    const timer = setTimeout(() => {
      setDisplayedSteps(steps.slice(0, currentStep + 1));
    }, 100);

    return () => clearTimeout(timer);
  }, [steps, currentStep]);

  return (
    <div className="glass-card p-6 font-mono text-sm bg-black/40 border border-white/[0.1] rounded-lg">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.05]">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="ml-4 text-xs text-slate-500">meridian-sync</span>
      </div>

      <div className="space-y-3">
        {displayedSteps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-center gap-3 animate-fade-in-up"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            {step.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            ) : step.status === 'running' ? (
              <Loader2 className="h-4 w-4 text-violet-400 animate-spin flex-shrink-0" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-slate-600 flex-shrink-0" />
            )}

            <span className={step.status === 'completed' ? 'text-emerald-400' : step.status === 'running' ? 'text-violet-400' : 'text-slate-500'}>
              {step.status === 'running' && '> '}
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {currentStep < steps.length - 1 && (
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
