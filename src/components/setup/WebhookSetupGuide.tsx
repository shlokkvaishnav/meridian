'use client';

import { CheckCircle2, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WebhookSetupGuideProps {
  webhookUrl: string;
}

export function WebhookSetupGuide({ webhookUrl }: WebhookSetupGuideProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: 1,
      title: 'Go to Repository Settings',
      description: 'Navigate to your GitHub repository → Settings → Webhooks',
      link: 'https://github.com',
    },
    {
      num: 2,
      title: 'Add Webhook',
      description: 'Click "Add webhook" button',
    },
    {
      num: 3,
      title: 'Configure Webhook',
      description: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">Payload URL:</span>
            <code className="px-2 py-1 bg-black/40 rounded text-xs text-violet-300 font-mono">
              {webhookUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2"
            >
              {copied ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="text-xs text-slate-400">
            Content type: <code className="text-violet-300">application/json</code>
          </div>
          <div className="text-xs text-slate-400">
            Secret: <code className="text-violet-300">Set GITHUB_WEBHOOK_SECRET in .env</code>
          </div>
        </div>
      ),
    },
    {
      num: 4,
      title: 'Select Events',
      description: 'Choose "Pull requests" and "Pushes" events',
    },
    {
      num: 5,
      title: 'Save Webhook',
      description: 'Click "Add webhook" to save',
    },
  ];

  return (
    <Card className="glass-card noise p-6 border-2 border-violet-500/20">
      <div className="flex items-start gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">Enable Real-Time Updates</h3>
          <p className="text-sm text-slate-400">
            Set up GitHub webhooks to receive instant updates when PRs are opened, reviewed, or merged.
            No more waiting for manual syncs!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.num} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-400">
                {step.num}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">{step.title}</h4>
              {typeof step.description === 'string' ? (
                <p className="text-xs text-slate-400">{step.description}</p>
              ) : (
                step.description
              )}
              {step.link && (
                <a
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-1"
                >
                  Open GitHub <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-emerald-300">
            <span className="font-medium">Benefits:</span> Once configured, your dashboard will update automatically
            when PRs are created, reviewed, or merged. No manual sync needed!
          </div>
        </div>
      </div>
    </Card>
  );
}
