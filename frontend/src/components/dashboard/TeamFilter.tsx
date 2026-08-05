'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Users, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Team {
  id: string;
  name: string;
  memberLogins: string[];
  color?: string;
}

interface TeamFilterProps {
  teams: Team[];
  contributors: Array<{ login: string }>;
}

export function TeamFilter({ teams, contributors }: TeamFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTeam = searchParams.get('team');
  const currentContributor = searchParams.get('contributor');

  const handleSelect = (teamId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear contributor filter when selecting a team
    if (teamId) {
      params.set('team', teamId);
      params.delete('contributor');
    } else {
      params.delete('team');
    }
    
    router.push(`?${params.toString()}`);
  };

  const selectedTeam = teams.find(t => t.id === currentTeam);

  // Get team member count
  const getTeamMemberCount = (team: Team) => {
    return team.memberLogins.length;
  };

  // Get contributors in selected team
  const getTeamContributors = (team: Team) => {
    return contributors.filter(c => team.memberLogins.includes(c.login));
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 border-dashed ${
              currentTeam 
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20' 
                : 'border-slate-700 bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {selectedTeam ? (
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                <span>{selectedTeam.name}</span>
                <span className="text-xs opacity-70">({getTeamMemberCount(selectedTeam)})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                <span>All Teams</span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
          <DropdownMenuLabel>Filter by Team</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleSelect(null)}>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center">
                <Building2 className="h-3 w-3 text-slate-500" />
              </div>
              <span>All Teams</span>
            </div>
          </DropdownMenuItem>

          {teams.length === 0 ? (
            <DropdownMenuItem disabled>
              <span className="text-xs text-slate-500">No teams created yet</span>
            </DropdownMenuItem>
          ) : (
            teams.map((team) => {
              const memberCount = getTeamMemberCount(team);
              const teamContributors = getTeamContributors(team);
              
              return (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => handleSelect(team.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ 
                        backgroundColor: team.color ? `${team.color}20` : 'rgba(139, 92, 246, 0.1)',
                        color: team.color || '#8b5cf6'
                      }}
                    >
                      <Building2 className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{team.name}</span>
                        <span className="text-xs text-slate-500 ml-2">{memberCount}</span>
                      </div>
                      {teamContributors.length > 0 && (
                        <div className="text-xs text-slate-500 truncate">
                          {teamContributors.slice(0, 3).map(c => c.login).join(', ')}
                          {teamContributors.length > 3 && '...'}
                        </div>
                      )}
                    </div>
                    {currentTeam === team.id && (
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {currentTeam && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-slate-500 hover:text-white"
          onClick={() => handleSelect(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
