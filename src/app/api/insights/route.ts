import { NextResponse } from 'next/server';
import { generateInsights } from '@/lib/insights';
import { db } from '@/lib/db';

/**
 * Generate and store AI/rule-based insights
 */
export async function POST() {
  try {
    // Generate insights
    const insights = await generateInsights();

    // Store insights in database
    const storedInsights = await Promise.all(
      insights.map((insight) =>
        db.insight.create({
          data: {
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
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: storedInsights.length,
      insights: insights,
    });
  } catch (error: any) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
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
      orderBy: { generatedAt: 'desc' },
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
