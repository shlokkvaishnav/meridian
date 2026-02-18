import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { ContributorProfile } from '@/components/contributors/ContributorProfile';
import { Activity } from 'lucide-react';
import Link from 'next/link';

interface ContributorPageProps {
  params: Promise<{ login: string }>;
}

export default async function ContributorPage(props: ContributorPageProps) {
  const params = await props.params;
  const login = decodeURIComponent(params.login);
  
  const session = await getSession();
  if (!session) {
    redirect('/setup');
  }

  const { settings } = session;

  // Fetch contributor data
  const [prs, reviews, comments] = await Promise.all([
    db.pullRequest.findMany({
      where: {
        authorLogin: login,
        repository: { ownerId: settings.id },
      },
      include: {
        repository: {
          select: { name: true, fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.review.findMany({
      where: {
        reviewerLogin: login,
        pullRequest: {
          repository: { ownerId: settings.id },
        },
      },
      include: {
        pullRequest: {
          select: {
            title: true,
            number: true,
            repository: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.comment.findMany({
      where: {
        authorLogin: login,
        pullRequest: {
          repository: { ownerId: settings.id },
        },
      },
      include: {
        pullRequest: {
          select: {
            title: true,
            number: true,
            repository: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  // Calculate metrics
  const metrics = {
    prsAuthored: prs.length,
    prsMerged: prs.filter(p => p.state === 'MERGED').length,
    reviewsGiven: reviews.length,
    commentsWritten: comments.length,
    avgCycleTime: prs.length > 0
      ? prs
          .filter(p => p.mergedAt && p.createdAt)
          .reduce((sum, p) => {
            const cycleTime = (new Date(p.mergedAt!).getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return sum + cycleTime;
          }, 0) / prs.filter(p => p.mergedAt).length
      : 0,
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="sticky z-10 border-b border-white/[0.06] top-0 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="h-7 w-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <span className="text-base font-semibold text-white tracking-tight">Meridian</span>
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-sm text-slate-400">Contributors</span>
            <span className="text-slate-500">/</span>
            <span className="text-sm text-white font-medium">{login}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <ContributorProfile
          login={login}
          metrics={metrics}
          prs={prs}
          reviews={reviews}
          comments={comments}
        />
      </main>
    </div>
  );
}
