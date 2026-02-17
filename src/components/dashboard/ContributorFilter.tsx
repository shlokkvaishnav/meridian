'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContributorStats } from '@/services/metrics';
import Image from 'next/image';

interface ContributorFilterProps {
  contributors: ContributorStats[];
}

export function ContributorFilter({ contributors }: ContributorFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentContributor = searchParams.get('contributor');

  const handleSelect = (login: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (login) {
      params.set('contributor', login);
    } else {
      params.delete('contributor');
    }
    router.push(`?${params.toString()}`);
  };

  const selectedContributor = contributors.find(c => c.login === currentContributor);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 border-dashed ${
              currentContributor 
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20' 
                : 'border-slate-700 bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {selectedContributor ? (
              <div className="flex items-center gap-2">
                {selectedContributor.avatarUrl ? (
                  <Image
                    src={selectedContributor.avatarUrl}
                    alt={selectedContributor.login}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <Users className="h-3.5 w-3.5" />
                )}
                <span>{selectedContributor.login}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                <span>All Contributors</span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
          <DropdownMenuLabel>Filter by Contributor</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleSelect(null)}>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center">
                <Users className="h-3 w-3 text-slate-500" />
              </div>
              <span>All Contributors</span>
            </div>
          </DropdownMenuItem>

          {contributors.map((contributor) => (
            <DropdownMenuItem
              key={contributor.login}
              onClick={() => handleSelect(contributor.login)}
            >
              <div className="flex items-center gap-2 w-full">
                {contributor.avatarUrl ? (
                  <Image
                    src={contributor.avatarUrl}
                    alt={contributor.login}
                    width={24}
                    height={24}
                    className="rounded-full ring-1 ring-white/10"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <span className="text-xs text-violet-400">{contributor.login[0]}</span>
                  </div>
                )}
                <span className="flex-1 truncate">{contributor.login}</span>
                {currentContributor === contributor.login && (
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {currentContributor && (
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
