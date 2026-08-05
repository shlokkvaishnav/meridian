import { NextResponse } from 'next/server';
import { generateInsights } from '@meridian/backend/services/insights';
import { db } from '@meridian/backend/lib/db';
import { getSession } from '@meridian/backend/lib/session';
import { apiError } from '@meridian/backend/lib/api-error';
import { checkRateLimit } from '@meridian/backend/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for AI + DB work (Vercel Pro)

/**
 * Generate and store AI/rule-based insights
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = session;

    const rateLimit = checkRateLimit(`insights:${settings.id}`, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    // Generate insights for this user
    const insights = await generateInsights(settings.id);

    // Clean up old non-read, non-dismissed insights
    await db.insight.deleteMany({
      where: {
        ownerId: settings.id,
        isDismissed: false,
        isRead: false,
      },
    });

    // Store insights
    if (insights.length > 0) {
      await db.insight.createMany({
        data: insights.map((insight) => ({
          title: insight.title,
          description: insight.description,
          type: insight.type,
          category: insight.category,
          priority: insight.priority,
          ownerId: settings.id,
          data: {
            action: insight.action,
            metric: insight.metric,
            affectedContributors: insight.affectedContributors,
          },
          generatedAt: new Date(),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      count: insights.length,
      insights,
    });
  } catch (error: unknown) {
    return apiError(error, 'Failed to generate insights');
  }
}

/**
 * Get latest insights
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insights = await db.insight.findMany({
      where: {
        ownerId: session.settings.id,
        isDismissed: false,
      },
      orderBy: [{ priority: 'desc' }, { generatedAt: 'desc' }],
      take: 20,
    });

    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
