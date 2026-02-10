import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GitHubClient } from '@/lib/github';
import { generateInsights } from '@/lib/insights';

/**
 * Vercel Cron endpoint for daily sync
 * Runs automatically at 2 AM UTC every day
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate Vercel Cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting daily cron sync...');

    // Create sync job
    const syncJob = await db.syncJob.create({
      data: {
        jobType: 'cron_sync',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      // Get GitHub client
      const github = await GitHubClient.fromDatabase();

      // Fetch repositories
      const repos = await github.fetchUserRepos();
      console.log(`Found ${repos.length} repositories`);

      let totalPRs = 0;
      let totalReviews = 0;

      // Get last sync time for incremental sync
      const settings = await db.appSettings.findFirst();
      const lastSync = settings?.lastSyncedAt;

      // Sync each repository's PRs
      for (const repo of repos) {
        const [owner, repoName] = repo.fullName.split('/');

        try {
          // Upsert repository
          const dbRepo = await db.repository.upsert({
            where: { githubRepoId: repo.githubRepoId },
            create: repo,
            update: {
              ...repo,
              lastSyncedAt: new Date(),
            },
          });

          // Fetch PRs (only updated since last sync for incremental)
          const prs = await github.fetchPRs(owner, repoName, lastSync || undefined);
          console.log(`Syncing ${prs.length} PRs for ${repo.fullName}`);

          for (const pr of prs) {
            // Upsert PR
            const prData = {
              githubPrId: pr.githubPrId,
              number: pr.number,
              title: pr.title,
              body: pr.body,
              state: pr.state as 'OPEN' | 'MERGED' | 'CLOSED',
              authorLogin: pr.authorLogin,
              authorAvatarUrl: pr.authorAvatarUrl,
              createdAt: pr.createdAt,
              updatedAt: pr.updatedAt,
              closedAt: pr.closedAt,
              mergedAt: pr.mergedAt,
              linesAdded: pr.linesAdded,
              linesDeleted: pr.linesDeleted,
              filesChanged: pr.filesChanged,
              commitsCount: pr.commitsCount,
            };

            const dbPR = await db.pullRequest.upsert({
              where: {
                repositoryId_number: {
                  repositoryId: dbRepo.id,
                  number: pr.number,
                },
              },
              create: {
                ...prData,
                repositoryId: dbRepo.id,
              },
              update: prData,
            });

            totalPRs++;

            // Fetch and store reviews
            try {
              const reviews = await github.fetchReviews(owner, repoName, pr.number);

              for (const review of reviews) {
                await db.review.upsert({
                  where: { githubReviewId: review.githubReviewId },
                  create: {
                    ...review,
                    pullRequestId: dbPR.id,
                  },
                  update: {
                    reviewerLogin: review.reviewerLogin,
                    reviewerAvatarUrl: review.reviewerAvatarUrl,
                    state: review.state,
                    body: review.body,
                    submittedAt: review.submittedAt,
                  },
                });
                totalReviews++;
              }

              // Compute metrics
              if (reviews.length > 0) {
                const firstReview = reviews.sort((a, b) =>
                  a.submittedAt.getTime() - b.submittedAt.getTime()
                )[0];

                const timeToFirstReview = Math.floor(
                  (firstReview.submittedAt.getTime() - pr.createdAt.getTime()) / 1000 / 60
                );

                await db.pullRequest.update({
                  where: { id: dbPR.id },
                  data: {
                    timeToFirstReview,
                    reviewCycleCount: reviews.length,
                  },
                });
              }

              if (pr.mergedAt) {
                const timeToMerge = Math.floor(
                  (pr.mergedAt.getTime() - pr.createdAt.getTime()) / 1000 / 60
                );

                await db.pullRequest.update({
                  where: { id: dbPR.id },
                  data: { timeToMerge },
                });
              }
            } catch (reviewError) {
              console.error(`Error syncing reviews for PR #${pr.number}:`, reviewError);
            }
          }

          // Update repo last synced
          await db.repository.update({
            where: { id: dbRepo.id },
            data: { lastSyncedAt: new Date() },
          });
        } catch (error) {
          console.error(`Error syncing ${repo.fullName}:`, error);
        }
      }

      // Update app settings
      await db.appSettings.updateMany({
        data: { lastSyncedAt: new Date() },
      });

      // Generate insights after sync
      console.log('Generating insights...');
      const insights = await generateInsights();

      // Store insights
      await Promise.all(
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

      // Complete sync job
      await db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progress: {
            repos: repos.length,
            prs: totalPRs,
            reviews: totalReviews,
            insights: insights.length,
          },
        },
      });

      console.log('Daily sync completed successfully');

      return NextResponse.json({
        success: true,
        stats: {
          repositories: repos.length,
          pullRequests: totalPRs,
          reviews: totalReviews,
          insights: insights.length,
        },
      });
    } catch (error: any) {
      // Fail the sync job
      await db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error.message,
        },
      });

      throw error;
    }
  } catch (error: any) {
    console.error('Daily sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
