'use client';

import { Shield, CheckCircle2 } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="glass-card p-6 border-2 border-emerald/20 bg-emerald/[0.05]">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald/10 flex items-center justify-center flex-shrink-0 border border-emerald/20">
          <Shield className="h-6 w-6 text-emerald" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">Enterprise-Grade Security</h3>
            <div className="px-2 py-0.5 rounded-full bg-emerald/20 text-emerald text-xs font-medium border border-emerald/30 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              SOC2 Ready
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Your GitHub tokens are encrypted with AES-256 encryption. We&apos;re SOC2 compliant and never store your code.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald" />
              AES-256 Encryption
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald" />
              SOC2 Compliant
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald" />
              GDPR Ready
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald" />
              No Code Storage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
