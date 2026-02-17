import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { generateWorkSummary } from '@/services/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Generate work summary for the authenticated user
 * GET /api/ai/summary?timeframe=week|month|quarter
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch merged PRs in timeframe
    const prs = await db.pullRequest.findMany({
      where: {
        repository: {
          ownerId: session.settings.id,
        },
        state: 'MERGED',
        mergedAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        title: true,
        mergedAt: true,
        linesAdded: true,
        linesDeleted: true,
      },
      orderBy: {
        mergedAt: 'desc',
      },
    });

    // Generate summary
    const summary = await generateWorkSummary({
      prs,
      timeframe: timeframe === 'week' ? 'this week' : timeframe === 'month' ? 'this month' : 'this quarter',
      githubLogin: session.settings.githubLogin || 'User',
    });

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Work summary generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Summary generation failed' },
      { status: 500 }
    );
  }
}
