import { cn } from "@/lib/utils";

interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: string;
  authorLogin: string;
  createdAt: Date;
  repository: {
    name: string;
  };
}

interface RecentPRsProps {
  prs: PullRequest[];
}

const stateStyles: Record<string, string> = {
  MERGED: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  OPEN: "bg-primary/10 text-primary border border-primary/20",
  CLOSED: "bg-destructive/10 text-destructive border border-destructive/20",
};

export function RecentPRs({ prs }: RecentPRsProps) {
  if (prs.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-5 text-sm font-semibold text-foreground">Recent Pull Requests</h3>
      <div className="space-y-2">
        {prs.map((pr) => (
          <div key={pr.id} className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-secondary/50">
            <div className="flex-1 min-w-0 mr-4">
              <p className="truncate text-sm font-medium text-foreground">{pr.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {pr.repository.name}
                <span className="mx-1.5">#{pr.number}</span>
                <span className="mx-1">·</span>
                {pr.authorLogin}
                <span className="mx-1">·</span>
                {new Date(pr.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", stateStyles[pr.state] || "bg-secondary text-muted-foreground")}>
              {pr.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
