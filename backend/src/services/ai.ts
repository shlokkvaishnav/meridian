import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PRAnalysis {
  summary: string;
  risks: string[];
  suggestions: string[];
  complexity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface WorkSummary {
  overview: string;
  highlights: string[];
  areas_of_focus: string[];
  velocity_assessment: string;
}

/**
 * Analyze a Pull Request using Claude
 * 
 * @param pr PullRequest object with title, body, diff stats
 * @returns Analysis including summary, risks, and suggestions
 */
export async function analyzePR(params: {
  title: string;
  body: string;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: number;
  authorLogin: string;
}): Promise<PRAnalysis> {
  const { title, body, linesAdded, linesDeleted, filesChanged, authorLogin } = params;

  const prompt = `You are an expert code reviewer. Analyze this Pull Request and provide insights.

**PR Title:** ${title}

**PR Description:**
${body || '(No description provided)'}

**Stats:**
- Lines added: ${linesAdded}
- Lines deleted: ${linesDeleted}
- Files changed: ${filesChanged}
- Author: ${authorLogin}

Based on this information, provide:
1. A concise summary (1-2 sentences)
2. Potential risks or concerns (list 0-3 items)
3. Suggestions for improvement (list 0-3 items)
4. Complexity assessment (low/medium/high)

Respond in JSON format:
{
  "summary": "...",
  "risks": ["...", "..."],
  "suggestions": ["...", "..."],
  "complexity": "low|medium|high",
  "confidence": 0.0-1.0
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]) as PRAnalysis;
    return analysis;
  } catch (error: any) {
    console.error('AI analysis error:', error);
    // Return fallback analysis
    return {
      summary: 'Analysis unavailable',
      risks: [],
      suggestions: [],
      complexity: 'medium',
      confidence: 0,
    };
  }
}

/**
 * Generate a work summary for a user based on their recent PRs
 * 
 * @param prs Array of recent merged PRs
 * @param timeframe Description of timeframe (e.g., "this week", "last sprint")
 * @returns Work summary with highlights and focus areas
 */
export async function generateWorkSummary(params: {
  prs: Array<{
    title: string;
    mergedAt: Date | null;
    linesAdded: number;
    linesDeleted: number;
  }>;
  timeframe: string;
  githubLogin: string;
}): Promise<WorkSummary> {
  const { prs, timeframe, githubLogin } = params;

  if (prs.length === 0) {
    return {
      overview: `No merged PRs found for ${timeframe}.`,
      highlights: [],
      areas_of_focus: [],
      velocity_assessment: 'No activity recorded.',
    };
  }

  const totalLines = prs.reduce((sum, pr) => sum + pr.linesAdded + pr.linesDeleted, 0);
  const prList = prs.map((pr) => `- ${pr.title} (+${pr.linesAdded}/-${pr.linesDeleted})`).join('\n');

  const prompt = `You are an engineering manager reviewing a developer's work.

**Developer:** ${githubLogin}
**Timeframe:** ${timeframe}
**Merged PRs:** ${prs.length}
**Total Lines Changed:** ${totalLines}

**PR Titles:**
${prList}

Based on this information, provide:
1. A brief overview (2-3 sentences)
2. Key highlights (list 2-4 accomplishments)
3. Areas of focus (list 2-3 themes or domains)
4. Velocity assessment (1 sentence about pace and impact)

Respond in JSON format:
{
  "overview": "...",
  "highlights": ["...", "..."],
  "areas_of_focus": ["...", "..."],
  "velocity_assessment": "..."
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const summary = JSON.parse(jsonMatch[0]) as WorkSummary;
    return summary;
  } catch (error: any) {
    console.error('Work summary generation error:', error);
    return {
      overview: 'Summary generation unavailable',
      highlights: [],
      areas_of_focus: [],
      velocity_assessment: 'Unable to assess velocity.',
    };
  }
}

/**
 * Cache AI analysis in database to avoid redundant API calls
 */
export async function getCachedPRAnalysis(
  prId: string,
  analyzer: () => Promise<PRAnalysis>
): Promise<PRAnalysis> {
  // TODO: Implement caching logic using Prisma
  // For now, just call the analyzer directly
  return analyzer();
}
/**
 * Generate a high-level strategic insight based on other detected insights
 */
export async function generateStrategicInsight(
  insights: any[], // Type should be Insight[] but avoiding circular dep issues for now
  githubLogin?: string
): Promise<any | null> {
  // Only proceed if we have enough insights to analyze and an API key
  if (insights.length < 2 || !process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  // Summarize the top insights (limit to 5)
  const topInsights = insights.slice(0, 5).map(i => 
    `- [${i.type}] ${i.title}: ${i.description}`
  ).join('\n');

  const prompt = `You are a CTO or VP of Engineering reviewing your team's health.
  
Here are the key signals detected from the data:
${topInsights}

Based on these signals, provide ONE single "Strategic Advice" insight.
It should be directive, high-level, and addressed to the engineering leader.
Focus on the root cause or the most critical action to take.

Respond in JSON format:
{
  "title": "...",
  "description": "...", 
  "action": "..."
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) return null;

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      title: result.title,
      description: result.description,
      action: result.action,
      type: 'INFO',
      category: 'STRATEGIC', // This needs to be added to InsightCategory type
      priority: 10
    };
  } catch (error) {
    console.error('Strategic insight generation error:', error);
    return null;
  }
}
