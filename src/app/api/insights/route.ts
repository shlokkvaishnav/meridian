import { NextResponse } from 'next/server';
import { generateInsights } from '@/lib/insights';
import { db } from '@/lib/db';

import { cookies } from 'next/headers';

/**
 * Generate and store AI/rule-based insights
 * Cleans up old insights before generating new ones
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.appSettings.findUnique({
      where: { sessionId },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate insights for this user
    const insights = await generateInsights(settings.id);

    // Clean up old insights before inserting new ones (keep only latest batch)
    // Only delete insights for THIS user
    await db.insight.deleteMany({
      where: {
        ownerId: settings.id,
        isDismissed: false,
        isRead: false,
      },
    });

    // Store insights in database
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
      insights: insights,
    });
  } catch (error: any) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

/**
 * Get latest insights
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.appSettings.findUnique({
      where: { sessionId },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insights = await db.insight.findMany({
      where: { 
        ownerId: settings.id,
        isDismissed: false 
      },
      orderBy: [{ priority: 'desc' }, { generatedAt: 'desc' }],
      take: 20,
    });

    return NextResponse.json({ insights });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
