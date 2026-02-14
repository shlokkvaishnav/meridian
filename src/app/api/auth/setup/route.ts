import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import { Octokit } from 'octokit';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'GitHub token is required' },
        { status: 400 }
      );
    }

    // Validate token by fetching user info
    const octokit = new Octokit({ auth: token });

    let githubUser;
    try {
      const { data } = await octokit.rest.users.getAuthenticated();
      githubUser = data;
    } catch {
      return NextResponse.json(
        { error: 'Invalid GitHub token. Please check and try again.' },
        { status: 401 }
      );
    }

    // Encrypt the token
    const encryptedToken = encrypt(token);

    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Create or update settings
    await db.appSettings.create({
      data: {
        sessionId,
        encryptedToken,
        tokenCreatedAt: new Date(),
        githubLogin: githubUser.login,
        githubUserId: githubUser.id,
        email: githubUser.email,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
      },
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        login: githubUser.login,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
      },
    });

    // Set secure session cookie
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to save token. Please try again.' },
      { status: 500 }
    );
  }
}
