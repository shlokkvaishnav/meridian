import { cookies } from 'next/headers';
import { db } from './db';

export type SessionData = {
  settings: {
    id: string;
    sessionId: string;
    encryptedToken: string;
    githubLogin: string | null;
    githubUserId: number | null;
    name: string | null;
    avatarUrl: string | null;
    lastSyncedAt: Date | null;
  };
};

/**
 * Get the current user session from the session_id cookie.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) return null;

  const settings = await db.appSettings.findUnique({
    where: { sessionId },
    select: {
      id: true,
      sessionId: true,
      encryptedToken: true,
      githubLogin: true,
      githubUserId: true,
      name: true,
      avatarUrl: true,
      lastSyncedAt: true,
    },
  });

  if (!settings) return null;

  return { settings };
}

/**
 * Require a valid session. Throws if not authenticated.
 */
export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
