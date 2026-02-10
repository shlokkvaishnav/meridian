import { db } from './db';
import { decrypt } from './encryption';
import { Octokit } from 'octokit';

/**
 * GitHub API client with rate limit handling
 */
export class GitHubClient {
  private octokit: Octokit;
  private rateLimitRemaining: number = 5000;
  private rateLimitReset: Date = new Date();

  constructor(token: string) {
    this.octokit = new Octokit({ 
      auth: token,
      retry: {
        enabled: true,
      },
    });
  }

  /**
   * Get authenticated GitHub client from database
   */
  static async fromDatabase(): Promise<GitHubClient> {
    const settings = await db.appSettings.findFirst();
    
    if (!settings) {
      throw new Error('GitHub token not configured. Please run setup first.');
    }

    const token = await decrypt(settings.encryptedToken);
    return new GitHubClient(token);
  }

  /**
   * Fetch all repositories for the authenticated user
   */
  async fetchUserRepos() {
    try {
      const repos = await this.octokit.paginate(
        this.octokit.rest.repos.listForAuthenticatedUser,
        {
          per_page: 100,
          sort: 'updated',
        }
      );

      return repos.map((repo) => ({
        githubRepoId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch || 'main',
        description: repo.description,
        isPrivate: repo.private,
      }));
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('GitHub token is invalid or expired. Please update your token.');
      }
      throw error;
    }
  }

  /**
   * Fetch pull requests for a repository
   */
  async fetchPRs(owner: string, repo: string, since?: Date) {
    const pullRequests = await this.octokit.paginate(
      this.octokit.rest.pulls.list,
      {
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      }
    );

    // Filter by date if provided
    const filtered = since
      ? pullRequests.filter((pr) => new Date(pr.updated_at) > since)
      : pullRequests;

    return filtered.map((pr) => ({
      githubPrId: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state === 'open' ? 'OPEN' : pr.merged_at ? 'MERGED' : 'CLOSED',
      authorLogin: pr.user?.login || 'unknown',
      authorAvatarUrl: pr.user?.avatar_url,
      createdAt: new Date(pr.created_at),
      updatedAt: new Date(pr.updated_at),
      closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
      linesAdded: pr.additions || 0,
      linesDeleted: pr.deletions || 0,
      filesChanged: pr.changed_files || 0,
      commitsCount: pr.commits || 0,
    }));
  }

  /**
   * Fetch reviews for a pull request
   */
  async fetchReviews(owner: string, repo: string, prNumber: number) {
    const reviews = await this.octokit.paginate(
      this.octokit.rest.pulls.listReviews,
      {
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100,
      }
    );

    return reviews.map((review) => ({
      githubReviewId: review.id,
      reviewerLogin: review.user?.login || 'unknown',
      reviewerAvatarUrl: review.user?.avatar_url,
      state: review.state as any, // APPROVED, CHANGES_REQUESTED, COMMENTED, DISMISSED
      body: review.body,
      submittedAt: new Date(review.submitted_at!),
    }));
  }

  /**
   * Fetch comments for a pull request
   */
  async fetchComments(owner: string, repo: string, prNumber: number) {
    const comments = await this.octokit.paginate(
      this.octokit.rest.issues.listComments,
      {
        owner,
        repo,
        issue_number: prNumber,
        per_page: 100,
      }
    );

    return comments.map((comment) => ({
      githubCommentId: comment.id,
      authorLogin: comment.user?.login || 'unknown',
      authorAvatarUrl: comment.user?.avatar_url,
      body: comment.body || '',
      createdAt: new Date(comment.created_at),
      updatedAt: new Date(comment.updated_at),
    }));
  }

  /**
   * Check current rate limit status
   */
  async checkRateLimit() {
    const { data } = await this.octokit.rest.rateLimit.get();
    this.rateLimitRemaining = data.rate.remaining;
    this.rateLimitReset = new Date(data.rate.reset * 1000);
    
    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset,
      limit: data.rate.limit,
    };
  }
}
