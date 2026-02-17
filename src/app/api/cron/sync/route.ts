import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GitHubClient } from '@/services/github/github-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Background sync cron job
 * 
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions, or external scheduler).
 * It syncs data for all users with active sessions.
 * 
 * To secure this endpoint, set CRON_SECRET in your .env file and pass it as Authorization header:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn('CRON_SECRET not set. Cron endpoint is unprotected!');
    } else {
      const token = authHeader?.replace('Bearer ', '');
      if (token !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get all active sessions (users who have set up the app)
    const allSettings = await db.appSettings.findMany({
      where: {
        encryptedToken: { not: null },
      },
      select: {
        id: true,
        sessionId: true,
        encryptedToken: true,
        githubLogin: true,
        lastSyncedAt: true,
      },
    });

    if (allSettings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to sync',
        synced: 0,
      });
    }

    const results = [];

    // Sync each user
    for (const settings of allSettings) {
      try {
        const github = await GitHubClient.initializeWithSettings(settings);

        // Fetch repos
        const repos = await github.fetchUserRepos();
        let prCount = 0;

        for (const repo of repos) {
          const dbRepo = await db.repository.upsert({
            where: {
              ownerId_githubRepoId: {
                ownerId: settings.id,
                githubRepoId: repo.githubRepoId,
              },
            },
            create: {
              ...repo,
              ownerId: settings.id,
            },
            update: {
              name: repo.name,
              fullName: repo.fullName,
              defaultBranch: repo.defaultBranch,
              description: repo.description,
              isPrivate: repo.isPrivate,
            },
          });

          // Fetch recent PRs (since last sync)
          const [owner, repoName] = repo.fullName.split('/');
          const prs = await github.fetchPRs(
            owner,
            repoName,
            settings.lastSyncedAt ?? undefined
          );

          for (const pr of prs) {
            await db.pullRequest.upsert({
              where: {
                repositoryId_number: {
                  repositoryId: dbRepo.id,
                  number: pr.number,
                },
              },
              create: {
                ...pr,
                state: pr.state as any,
                repositoryId: dbRepo.id,
              },
              update: {
                title: pr.title,
                body: pr.body,
                state: pr.state as any,
                updatedAt: pr.updatedAt,
                closedAt: pr.closedAt,
                mergedAt: pr.mergedAt,
              },
            });
            prCount++;
          }

          await db.repository.update({
            where: { id: dbRepo.id },
            data: { lastSyncedAt: new Date() },
          });
        }

        // Update user's last synced time
        await db.appSettings.update({
          where: { id: settings.id },
          data: { lastSyncedAt: new Date() },
        });

        results.push({
          user: settings.githubLogin,
          repos: repos.length,
          prs: prCount,
        });
      } catch (error: any) {
        console.error(`Failed to sync user ${settings.githubLogin}:`, error);
        results.push({
          user: settings.githubLogin,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Cron sync failed' },
      { status: 500 }
    );
  }
}
