import crypto from 'crypto';
import { db } from './db';

/**
 * Verify GitHub webhook signature
 */
export async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const algorithm = { name: 'HMAC', hash: 'SHA-256' };
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    algorithm,
    false,
    ['verify']
  );
  
  const signatureBytes = hexToBytes(signature.split('=')[1]);
  const dataBytes = encoder.encode(body);
  
  return crypto.subtle.verify(
    algorithm.name,
    key,
    signatureBytes,
    dataBytes
  );
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Handle pull_request event
 */
export async function handlePullRequestEvent(payload: any) {
  const { action, pull_request, repository, sender } = payload;
  
  console.log(`[Webhook] Processing PR event: ${action} for ${repository.full_name}#${pull_request.number}`);

  // 1. Find the repository in our DB
  // We need to find which user owns this repo to attribute it correctly?
  // Or simply update it if it exists.
  // We'll search by githubRepoId.
  const repos = await db.repository.findMany({
    where: { githubRepoId: repository.id }
  });

  if (repos.length === 0) {
    console.log(`[Webhook] Repo ${repository.full_name} not found in DB. Skipping.`);
    return;
  }

  // Update for ALL users who track this repo
  for (const dbRepo of repos) {
    const prData = {
      githubPrId: pull_request.id,
      number: pull_request.number,
      title: pull_request.title,
      body: pull_request.body,
      state: pull_request.state === 'open' ? 'OPEN' : pull_request.merged ? 'MERGED' : 'CLOSED',
      authorLogin: pull_request.user.login,
      authorAvatarUrl: pull_request.user.avatar_url,
      createdAt: new Date(pull_request.created_at),
      updatedAt: new Date(pull_request.updated_at),
      closedAt: pull_request.closed_at ? new Date(pull_request.closed_at) : null,
      mergedAt: pull_request.merged_at ? new Date(pull_request.merged_at) : null,
      linesAdded: pull_request.additions ?? 0,
      linesDeleted: pull_request.deletions ?? 0,
      filesChanged: pull_request.changed_files ?? 0,
      commitsCount: pull_request.commits ?? 0,
    };

    await db.pullRequest.upsert({
      where: {
        repositoryId_number: {
          repositoryId: dbRepo.id,
          number: pull_request.number,
        },
      },
      create: {
        ...prData,
        repositoryId: dbRepo.id,
      },
      update: prData,
    });
    
    // Update repository lastSyncedAt
    await db.repository.update({
      where: { id: dbRepo.id },
      data: { lastSyncedAt: new Date() }
    });
  }
}
