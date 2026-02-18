import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { PRState } from '@/generated/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GitHub Webhook Handler
 * 
 * Handles real-time events from GitHub:
 * - pull_request (opened, closed, reopened, edited, synchronize)
 * - push
 * 
 * To set up:
 * 1. Go to your GitHub repository settings -> Webhooks
 * 2. Add webhook URL: https://your-domain.com/api/webhooks/github
 * 3. Content type: application/json
 * 4. Secret: Set GITHUB_WEBHOOK_SECRET in .env
 * 5. Select events: Pull requests, Pushes
 */

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');
    const deliveryId = request.headers.get('x-github-delivery');

    if (!signature || !event) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Verify signature
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('GITHUB_WEBHOOK_SECRET not set. Webhook is unprotected!');
    } else {
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    console.log(`Received webhook: ${event} (${deliveryId})`);

    // Handle pull_request events
    if (event === 'pull_request') {
      const action = payload.action;
      const pr = payload.pull_request;
      const repo = payload.repository;

      // Skip if this is a review event (handled separately)
      if (action === 'submitted' || action === 'edited' || action === 'dismissed') {
        // This will be handled by pull_request_review event
        return NextResponse.json({ received: true, event, action: 'skipped_review' });
      }

      // Find the owner (user) for this repository
      const dbRepo = await db.repository.findFirst({
        where: {
          githubRepoId: repo.id,
        },
        select: {
          id: true,
          ownerId: true,
        },
      });

      if (!dbRepo) {
        console.log(`Repository ${repo.full_name} not found in database. Skipping.`);
        return NextResponse.json({ received: true, action: 'skipped' });
      }

      // Map GitHub state to our enum
      let state: PRState = 'OPEN';
      if (pr.merged) {
        state = 'MERGED';
      } else if (pr.state === 'closed') {
        state = 'CLOSED';
      }

      // Upsert PR
      await db.pullRequest.upsert({
        where: {
          repositoryId_number: {
            repositoryId: dbRepo.id,
            number: pr.number,
          },
        },
        create: {
          repositoryId: dbRepo.id,
          githubPrId: pr.id,
          number: pr.number,
          title: pr.title,
          body: pr.body || '',
          state,
          authorLogin: pr.user.login,
          authorAvatarUrl: pr.user.avatar_url,
          createdAt: new Date(pr.created_at),
          updatedAt: new Date(pr.updated_at),
          closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          linesAdded: pr.additions || 0,
          linesDeleted: pr.deletions || 0,
          filesChanged: pr.changed_files || 0,
          commitsCount: pr.commits || 0,
        },
        update: {
          title: pr.title,
          body: pr.body || '',
          state,
          updatedAt: new Date(pr.updated_at),
          closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          linesAdded: pr.additions || 0,
          linesDeleted: pr.deletions || 0,
          filesChanged: pr.changed_files || 0,
          commitsCount: pr.commits || 0,
        },
      });

      console.log(`Updated PR #${pr.number} in ${repo.full_name} (${action})`);


      // Update repository lastSyncedAt for real-time freshness
      await db.repository.update({
        where: { id: dbRepo.id },
        data: {
          lastSyncedAt: new Date(),
        },
      });

      // Update owner's lastSyncedAt
      await db.appSettings.update({
        where: { id: dbRepo.ownerId },
        data: {
          lastSyncedAt: new Date(),
        },
      });

      return NextResponse.json({
        received: true,
        event,
        action,
        pr: pr.number,
        realTime: true,
      });
    }

    // Handle pull_request_review events (separate from pull_request)
    if (event === 'pull_request_review') {
      const action = payload.action;
      const review = payload.review;
      const pr = payload.pull_request;
      const repo = payload.repository;

      const dbRepo = await db.repository.findFirst({
        where: {
          githubRepoId: repo.id,
        },
        select: {
          id: true,
          ownerId: true,
        },
      });

      if (!dbRepo) {
        return NextResponse.json({ received: true, action: 'skipped' });
      }

      const dbPr = await db.pullRequest.findFirst({
        where: {
          repositoryId: dbRepo.id,
          number: pr.number,
        },
        select: { id: true },
      });

      if (!dbPr) {
        return NextResponse.json({ received: true, action: 'pr_not_found' });
      }

      // Upsert review
      await db.review.upsert({
        where: {
          githubReviewId: review.id,
        },
        create: {
          githubReviewId: review.id,
          pullRequestId: dbPr.id,
          reviewerLogin: review.user.login,
          reviewerAvatarUrl: review.user.avatar_url,
          state: review.state === 'approved' ? 'APPROVED' 
                : review.state === 'changes_requested' ? 'CHANGES_REQUESTED'
                : review.state === 'commented' ? 'COMMENTED'
                : 'DISMISSED',
          body: review.body || null,
          submittedAt: new Date(review.submitted_at),
        },
        update: {
          state: review.state === 'approved' ? 'APPROVED' 
                : review.state === 'changes_requested' ? 'CHANGES_REQUESTED'
                : review.state === 'commented' ? 'COMMENTED'
                : 'DISMISSED',
          body: review.body || null,
          submittedAt: new Date(review.submitted_at),
        },
      });

      // Update repository and owner sync timestamps
      await db.repository.update({
        where: { id: dbRepo.id },
        data: { lastSyncedAt: new Date() },
      });

      await db.appSettings.update({
        where: { id: dbRepo.ownerId },
        data: { lastSyncedAt: new Date() },
      });

      console.log(`Updated review ${review.id} for PR #${pr.number} in ${repo.full_name}`);

      return NextResponse.json({
        received: true,
        event,
        action,
        review: review.id,
        realTime: true,
      });
    }

    // Handle push events (optional: update repository metadata)
    if (event === 'push') {
      const repo = payload.repository;

      const dbRepo = await db.repository.findFirst({
        where: {
          githubRepoId: repo.id,
        },
      });

      if (dbRepo) {
        await db.repository.update({
          where: { id: dbRepo.id },
          data: {
            defaultBranch: repo.default_branch,
            description: repo.description,
          },
        });

        console.log(`Updated repository ${repo.full_name} from push event`);
      }

      return NextResponse.json({
        received: true,
        event,
      });
    }

    // Unknown event
    return NextResponse.json({
      received: true,
      event,
      action: 'ignored',
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
