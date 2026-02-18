'use client';

import { Shield, CheckCircle2 } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="glass-card p-6 border-2 border-teal-500/20 bg-teal-500/[0.05]">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
          <Shield className="h-6 w-6 text-teal-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">Enterprise-Grade Security</h3>
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              SOC2 Ready
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            Your GitHub tokens are encrypted with AES-256 encryption. We're SOC2 compliant and never store your code.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-teal-400" />
              AES-256 Encryption
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-teal-400" />
              SOC2 Compliant
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-teal-400" />
              GDPR Ready
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-teal-400" />
              No Code Storage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
