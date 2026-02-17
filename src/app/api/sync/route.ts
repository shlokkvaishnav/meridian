import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { SyncService } from '@/services/github/sync';
import { GitHubClient } from '@/services/github/github-client';
import { PRState } from '@/generated/prisma/client';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = session;

    // Get GitHub client for this user
    const github = await GitHubClient.initializeWithSettings(settings);

    // Start sync job
    const syncJob = await db.syncJob.create({
      data: {
        jobType: 'full_sync',
        status: 'RUNNING',
        startedAt: new Date(),
        ownerId: settings.id,
      },
    });

    try {
      // Fetch repos from GitHub
      const repos = await github.fetchUserRepos();

      // Upsert repositories
      let repoCount = 0;
      let prCount = 0;
      let reviewCount = 0;

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
        repoCount++;

        // Fetch PRs for each repo
        const [owner, repoName] = repo.fullName.split('/');
        const prs = await github.fetchPRs(owner, repoName, dbRepo.lastSyncedAt ?? undefined);

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
              state: (pr.state as unknown) as PRState,
              repositoryId: dbRepo.id,
            },
            update: {
              title: pr.title,
              body: pr.body,
              state: (pr.state as unknown) as PRState,
              updatedAt: pr.updatedAt,
              closedAt: pr.closedAt,
              mergedAt: pr.mergedAt,
              linesAdded: pr.linesAdded,
              linesDeleted: pr.linesDeleted,
              filesChanged: pr.filesChanged,
              commitsCount: pr.commitsCount,
            },
          });
          prCount++;

          // Fetch reviews
          try {
            const reviews = await github.fetchReviews(owner, repoName, pr.number);
            for (const review of reviews) {
              await db.review.upsert({
                where: { githubReviewId: review.githubReviewId },
                create: {
                  ...review,
                  pullRequestId: (
                    await db.pullRequest.findUnique({
                      where: {
                        repositoryId_number: {
                          repositoryId: dbRepo.id,
                          number: pr.number,
                        },
                      },
                    })
                  )!.id,
                },
                update: {
                  state: review.state,
                  body: review.body,
                },
              });
              reviewCount++;
            }
          } catch (e) {
            console.warn(`Failed to fetch reviews for ${repo.fullName}#${pr.number}:`, e);
          }
        }

        // Update last synced
        await db.repository.update({
          where: { id: dbRepo.id },
          data: { lastSyncedAt: new Date() },
        });
      }

      // Update AppSettings lastSyncedAt
      await db.appSettings.update({
        where: { id: settings.id },
        data: { lastSyncedAt: new Date() },
      });

      // Complete sync job
      const results = { repos: repoCount, prs: prCount, reviews: reviewCount };
      await db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progress: results,
        },
      });

      return NextResponse.json({
        success: true,
        stats: {
          repositories: repoCount,
          pullRequests: prCount,
          reviews: reviewCount,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: errorMessage,
        },
      });
      throw error;
    }
  } catch (error: unknown) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Sync failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Get sync status
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = session;

    const latestJob = await db.syncJob.findFirst({
      where: { ownerId: settings.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      lastSync: settings.lastSyncedAt,
      latestJob,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
