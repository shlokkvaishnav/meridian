'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PRSummarizerProps {
  prId: string;
  prTitle: string;
  prBody?: string;
  additions?: number;
  deletions?: number;
  filesChanged?: number;
}

export function PRSummarizer({
  prId,
  prTitle,
  prBody,
  additions = 0,
  deletions = 0,
  filesChanged = 0,
}: PRSummarizerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/pr/${prId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSummary(data.summary || 'Summary generated successfully.');
      } else {
        throw new Error(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="glass-card noise p-6 border border-violet-500/20 bg-violet-500/[0.05]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">AI PR Summary</h3>
        </div>
        {summary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 px-2 text-xs"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {!summary ? (
        <div className="space-y-4">
          <div className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
            <div className="text-sm text-slate-300 mb-2 font-medium">{prTitle}</div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>+{additions} / -{deletions} lines</span>
              <span>•</span>
              <span>{filesChanged} files changed</span>
            </div>
            {prBody && (
              <div className="mt-2 text-xs text-slate-400 line-clamp-2">{prBody}</div>
            )}
          </div>
          <Button
            onClick={generateSummary}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating summary...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Executive Summary
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateSummary}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate'
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-2 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
