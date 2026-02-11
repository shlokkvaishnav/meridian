import { db } from '@/lib/db';
import { GitHubClient } from '@/lib/github';
import { generateInsights } from '@/lib/insights';

interface SyncOptions {
  userId: string;
  force?: boolean;
}

export class SyncService {
  /**
   * Perform a full sync for a user
   */
  static async syncUser(userId: string) {
    const settings = await db.appSettings.findUnique({
      where: { id: userId },
    });

    if (!settings) {
      throw new Error('User settings not found');
    }

    // Initialize GitHub client
    const github = await GitHubClient.initializeWithSettings(settings);

    // Fetch repositories
    const repos = await github.fetchUserRepos();
    const results = {
      repos: 0,
      prs: 0,
      reviews: 0,
    };

    results.repos = repos.length;

    for (const repo of repos) {
      // Upsert repository
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
          ...repo,
          lastSyncedAt: new Date(),
        },
      });

      // Sync PRs
      const prs = await github.fetchPRs(
        repo.fullName.split('/')[0],
        repo.fullName.split('/')[1],
        settings.lastSyncedAt || undefined
      );

      results.prs += prs.length;

      for (const pr of prs) {
        // Upsert PR
        const dbPR = await db.pullRequest.upsert({
          where: {
            repositoryId_number: {
              repositoryId: dbRepo.id,
              number: pr.number,
            },
          },
          create: {
            ...pr,
            repositoryId: dbRepo.id,
            // Map state string to enum if needed, though types should match
            state: pr.state as 'OPEN' | 'MERGED' | 'CLOSED',
          },
          update: {
            ...pr,
            state: pr.state as 'OPEN' | 'MERGED' | 'CLOSED',
          },
        });

        // Sync Reviews
        const reviews = await github.fetchReviews(
          repo.fullName.split('/')[0],
          repo.fullName.split('/')[1],
          pr.number
        );
        
        results.reviews += reviews.length;

        for (const review of reviews) {
          await db.review.upsert({
            where: { githubReviewId: review.githubReviewId },
            create: {
              ...review,
              pullRequestId: dbPR.id,
            },
            update: {
              ...review,
            },
          });
        }
      }
    }

    // Update user last synced
    await db.appSettings.update({
      where: { id: userId },
      data: { lastSyncedAt: new Date() },
    });

    return results;
  }
}

