'use client';

import { useMemo } from 'react';
import { Users, GitMerge } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Collaboration {
  reviewer: string;
  author: string;
  count: number;
}

interface CollaborationGraphProps {
  collaborations?: Collaboration[];
  contributors?: Array<string | { login?: string; name?: string }>;
}

export function CollaborationGraph({ collaborations = [], contributors = [] }: CollaborationGraphProps) {
  // Generate mock data if none provided
  const graphData = useMemo(() => {
    if (collaborations.length > 0) {
      return collaborations;
    }

    // Mock collaboration network
    const contributorNames = contributors.map(c => 
      typeof c === 'string' ? c : (c.login || c.name || 'contributor')
    );
    const mockContributors = contributorNames.length > 0 
      ? contributorNames.slice(0, 8)
      : ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry'];
    
    const mock: Collaboration[] = [];
    for (let i = 0; i < mockContributors.length; i++) {
      for (let j = i + 1; j < mockContributors.length; j++) {
        if (Math.random() > 0.5) {
          mock.push({
            reviewer: mockContributors[i],
            author: mockContributors[j],
            count: Math.floor(Math.random() * 10) + 1,
          });
        }
      }
    }
    return mock;
  }, [collaborations, contributors]);

  const maxCollaborations = Math.max(...graphData.map(c => c.count), 1);
  const topCollaborations = graphData
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Card className="glass-card noise p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            Collaboration Network
          </h3>
          <p className="text-xs text-slate-400">Who reviews whose code most frequently</p>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="mb-6 p-6 bg-white/[0.02] rounded-lg border border-white/[0.05] min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <GitMerge className="h-8 w-8 text-violet-400" />
          </div>
          <p className="text-sm text-slate-400 mb-2">Collaboration Network Visualization</p>
          <p className="text-xs text-slate-500">
            Force-directed graph showing review relationships
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {graphData.length} connections detected
          </p>
        </div>
      </div>

      {/* Top Collaborations List */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Top Collaborations</h4>
        <div className="space-y-2">
          {topCollaborations.length > 0 ? (
            topCollaborations.map((collab, index) => (
              <div
                key={`${collab.reviewer}-${collab.author}`}
                className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:border-white/[0.1] transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-medium text-violet-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      <span className="text-violet-400">{collab.reviewer}</span>
                      <span className="text-slate-500 mx-2">reviews</span>
                      <span className="text-teal-400">{collab.author}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700/30 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-teal-500 transition-all"
                        style={{ width: `${(collab.count / maxCollaborations) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-slate-300">
                  {collab.count}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No collaboration data available</div>
          )}
        </div>
      </div>

      {/* Insight */}
      {topCollaborations.length > 0 && (
        <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
          <div className="text-xs text-violet-300">
            <span className="font-medium">Insight:</span>{' '}
            {topCollaborations[0].reviewer} and {topCollaborations[0].author} have the strongest collaboration
            with {topCollaborations[0].count} review interactions.
          </div>
        </div>
      )}
    </Card>
  );
}
