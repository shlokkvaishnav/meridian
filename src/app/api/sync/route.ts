import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SyncService } from '@/features/sync';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.appSettings.findUnique({
      where: { sessionId },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      // Use SyncService to perform the sync
      const results = await SyncService.syncUser(settings.id);

      // Complete sync job
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
          repositories: results.repos,
          pullRequests: results.prs,
          reviews: results.reviews,
        },
      });
    } catch (error: unknown) {
      // Fail the sync job
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
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Get sync status
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.appSettings.findUnique({
      where: { sessionId },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Filter sync jobs by user? Currently SyncJob is global.
    // We will just show latest job for now, or filter if we added ownerId.
    const latestJob = await db.syncJob.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      lastSync: settings.lastSyncedAt,
      latestJob,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
