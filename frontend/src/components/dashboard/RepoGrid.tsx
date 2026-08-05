import { Folder, ArrowUpRight } from "lucide-react";

interface Repository {
  id: string;
  name: string;
  fullName: string;
  _count: {
    pullRequests: number;
  };
}

interface RepoGridProps {
  repositories: Repository[];
}

export function RepoGrid({ repositories }: RepoGridProps) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-foreground">Repositories</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {repositories.map((repo, i) => (
          <div
            key={repo.id}
            className="animate-fade-in-up group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-glow"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Folder className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{repo.name}</p>
              <p className="text-xs text-muted-foreground truncate">{repo.fullName}</p>
              <p className="mt-1 text-xs text-muted-foreground">{repo._count.pullRequests} PRs</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
