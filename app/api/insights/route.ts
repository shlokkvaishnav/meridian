import { NextResponse } from 'next/server';
import { generateInsights } from '@/lib/insights';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';

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
    console.error('Insights generation error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to generate insights';
    return NextResponse.json({ error: msg }, { status: 500 });
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
