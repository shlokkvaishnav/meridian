import { NextResponse } from 'next/server';
import { generateInsights } from '@/lib/insights';
import { db } from '@/lib/db';

/**
 * Generate and store AI/rule-based insights
 * Cleans up old insights before generating new ones
 */
export async function POST() {
  try {
    // Generate insights
    const insights = await generateInsights();

    // Clean up old insights before inserting new ones (keep only latest batch)
    await db.insight.deleteMany({
      where: {
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
    const insights = await db.insight.findMany({
      where: { isDismissed: false },
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
