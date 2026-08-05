
import { NextResponse } from 'next/server';
import { getSession } from '@meridian/backend/lib/session';
import { db } from '@meridian/backend/lib/db';
import { analyzePR, generateWorkSummary } from '@meridian/backend/services/ai';
import { apiError } from '@meridian/backend/lib/api-error';
import { checkRateLimit } from '@meridian/backend/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Get AI analysis for a specific PR
 * GET /api/ai/pr/[prId]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`ai-pr:${session.settings.id}`, 20, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    const { prId } = await params;

    // Fetch PR from database
    const pr = await db.pullRequest.findUnique({
      where: { id: prId },
      include: {
        repository: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!pr) {
      return NextResponse.json({ error: 'PR not found' }, { status: 404 });
    }

    // Verify ownership
    if (pr.repository.ownerId !== session.settings.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate AI analysis
    const analysis = await analyzePR({
      title: pr.title,
      body: pr.body || '',
      linesAdded: pr.linesAdded,
      linesDeleted: pr.linesDeleted,
      filesChanged: pr.filesChanged,
      authorLogin: pr.authorLogin,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    return apiError(error, 'Analysis failed');
  }
}
