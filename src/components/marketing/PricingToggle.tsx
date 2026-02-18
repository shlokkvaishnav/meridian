'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PricingToggleProps {
  onToggle: (isAnnual: boolean) => void;
  defaultAnnual?: boolean;
}

export function PricingToggle({ onToggle, defaultAnnual = false }: PricingToggleProps) {
  const [isAnnual, setIsAnnual] = useState(defaultAnnual);

  const handleToggle = (annual: boolean) => {
    setIsAnnual(annual);
    onToggle(annual);
  };

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <span className={cn('text-sm transition-colors', isAnnual ? 'text-slate-400' : 'text-white font-medium')}>
        Monthly
      </span>
      <button
        onClick={() => handleToggle(!isAnnual)}
        className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/[0.08] border border-white/[0.1] transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
        role="switch"
        aria-checked={isAnnual}
      >
        <span
          className={cn(
            'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
            isAnnual ? 'translate-x-7 bg-violet-500' : 'translate-x-1'
          )}
        />
      </button>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm transition-colors', isAnnual ? 'text-white font-medium' : 'text-slate-400')}>
          Annual
        </span>
        {isAnnual && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
            Save 20%
          </span>
        )}
      </div>
    </div>
  );
}
