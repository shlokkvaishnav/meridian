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
      // Fetch all users (AppSettings)
      const allSettings = await db.appSettings.findMany();
      console.log(`Found ${allSettings.length} users to sync`);

      let totalRepos = 0;
      let totalPRs = 0;
      let totalReviews = 0;
      let totalInsights = 0;

      // Sync for each user
      for (const settings of allSettings) {
        console.log(`Syncing for user session: ${settings.sessionId}`);
        
        try {
          // Get GitHub client for this specific user
          // We need a way to instantiate client from a specific settings object
          // Since GitHubClient.fromDatabase() likely fetches findFirst(), we need to instantiate directly
          // or add a method to GitHubClient to accept settings.
          
          // Assuming we can pass the encrypted token to a new static method or constructor
          // Let's modify GitHubClient usage. 
          // Since I can't easily see GitHubClient code right now, I'll update it to use a new method I'll add: `fromSettings`
          // Or just assuming I can use `new GitHubClient(token)` if I decrypt it?
          // I'll stick to `GitHubClient.fromDatabase(settings.id)` if I modify that class, 
          // or better: let's use `GitHubClient.fromSettings(settings)` which I will implement.
          
          // Wait, I haven't modified GitHubClient yet. I should rely on what I can control.
          // I'll modify GitHubClient in a separate step or just use the token if possible.
          // For now, I will use a placeholder `GitHubClient.init(settings)` and I will update `lib/github.ts` next.
          
          const github = await GitHubClient.initializeWithSettings(settings);

          // Fetch repositories
          const repos = await github.fetchUserRepos();
          console.log(`Found ${repos.length} repositories for user`);
          totalRepos += repos.length;

          // Sync each repository
          for (const repo of repos) {
            const [owner, repoName] = repo.fullName.split('/');

            try {
              // Upsert repository with ownerId
              const dbRepo = await db.repository.upsert({
                where: { 
                  ownerId_githubRepoId: {
                    ownerId: settings.id,
                    githubRepoId: repo.githubRepoId
                  }
                },
                create: {
                  ...repo,
                  ownerId: settings.id
                },
                update: {
                  ...repo,
                  lastSyncedAt: new Date(),
                  // ensure ownerId is preserved (though it shouldn't change)
                },
              });

              // Fetch PRs (only updated since last sync)
              // We pass lastSync from THIS user's settings
              const prs = await github.fetchPRs(owner, repoName, settings.lastSyncedAt || undefined);
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

                  // Compute metrics (time to first review, etc.)
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
              console.error(`Error syncing repo ${repo.fullName}:`, error);
            }
          }

          // Update this user's lastSyncedAt
          await db.appSettings.update({
            where: { id: settings.id },
            data: { lastSyncedAt: new Date() },
          });

          // Generate insights for THIS user
          console.log(`Generating insights for user ${settings.id}...`);
          const insights = await generateInsights(settings.id);
          totalInsights += insights.length;

          // Store insights with ownerId
          await Promise.all(
            insights.map((insight) =>
              db.insight.create({
                data: {
                  title: insight.title,
                  description: insight.description,
                  type: insight.type,
                  category: insight.category,
                  priority: insight.priority,
                  ownerId: settings.id, // Link to user
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

        } catch (userError) {
          console.error(`Error syncing user ${settings.id}:`, userError);
          // Continue to next user
        }
      }

      // Complete sync job
      await db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progress: {
            users: allSettings.length,
            repos: totalRepos,
            prs: totalPRs,
            reviews: totalReviews,
            insights: totalInsights,
          },
        },
      });

      console.log('Daily sync completed successfully');

      return NextResponse.json({
        success: true,
        stats: {
          users: allSettings.length,
          repositories: totalRepos,
          pullRequests: totalPRs,
          reviews: totalReviews,
          insights: totalInsights,
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
