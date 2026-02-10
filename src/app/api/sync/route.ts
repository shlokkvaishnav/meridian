import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GitHubClient } from '@/lib/github';

// Maximum repos and PRs per sync to avoid timeout
const MAX_REPOS = 10;
const MAX_PRS_PER_REPO = 50;

export async function POST(request: NextRequest) {
  try {
    // Get GitHub client
    const github = await GitHubClient.fromDatabase();

    // Start sync job
    const syncJob = await db.syncJob.create({
      data: {
        jobType: 'full_sync',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      // Step 1: Fetch and store repositories
      console.log('Fetching repositories...');
      const repos = await github.fetchUserRepos();

      if (repos.length === 0) {
        // Complete the sync job with 0 repos
        await db.syncJob.update({
          where: { id: syncJob.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            progress: { repos: 0, prs: 0 },
          },
        });
        return NextResponse.json({
          success: true,
          stats: { repositories: 0, pullRequests: 0 },
        });
      }
      
      for (const repo of repos) {
        await db.repository.upsert({
          where: { githubRepoId: repo.githubRepoId },
          create: repo,
          update: {
            ...repo,
            lastSyncedAt: new Date(),
          },
        });
      }

      // Step 2: Fetch PRs for each repository (limit to 50 PRs per repo for now)
      console.log(`Fetching PRs for ${repos.length} repositories...`);
      let totalPRs = 0;
      let totalReviews = 0;

      for (const repo of repos.slice(0, 10)) { // Start with first 10 repos
        const [owner, repoName] = repo.fullName.split('/');
        
        try {
          const prs = await github.fetchPRs(owner, repoName);
          
          const dbRepo = await db.repository.findUnique({
            where: { githubRepoId: repo.githubRepoId },
          });

          if (!dbRepo) continue;

          for (const pr of prs.slice(0, 50)) { // Limit to 50 PRs per repo
            // Upsert PR with proper typing
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

            // Fetch and store reviews (skip if too many PRs to avoid rate limiting)
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

              // Compute time to first review
              if (reviews.length > 0) {
                const firstReview = reviews.sort((a, b) => 
                  a.submittedAt.getTime() - b.submittedAt.getTime()
                )[0];
                
                const timeToFirstReview = Math.floor(
                  (firstReview.submittedAt.getTime() - pr.createdAt.getTime()) / 1000 / 60
                ); // minutes

                await db.pullRequest.update({
                  where: { id: dbPR.id },
                  data: { 
                    timeToFirstReview,
                    reviewCycleCount: reviews.length,
                  },
                });
              }

              // Compute time to merge for merged PRs
              if (pr.mergedAt) {
                const timeToMerge = Math.floor(
                  (pr.mergedAt.getTime() - pr.createdAt.getTime()) / 1000 / 60
                ); // minutes

                await db.pullRequest.update({
                  where: { id: dbPR.id },
                  data: { timeToMerge },
                });
              }
            } catch (reviewError) {
              console.error(`Error fetching reviews for PR #${pr.number}:`, reviewError);
            }
          }

          // Update repo sync time
          await db.repository.update({
            where: { id: dbRepo.id },
            data: { lastSyncedAt: new Date() },
          });
        } catch (error) {
          console.error(`Error fetching PRs for ${repo.fullName}:`, error);
        }
      }

      // Update app settings
      await db.appSettings.updateMany({
        data: { lastSyncedAt: new Date() },
      });

      // Complete sync job
      await db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progress: {
            repos: repos.length,
            prs: totalPRs,
          },
        },
      });

      return NextResponse.json({
        success: true,
        stats: {
          repositories: repos.length,
          pullRequests: totalPRs,
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
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

// Get sync status
export async function GET() {
  try {
    const latestJob = await db.syncJob.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const settings = await db.appSettings.findFirst();

    return NextResponse.json({
      lastSync: settings?.lastSyncedAt,
      latestJob,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
