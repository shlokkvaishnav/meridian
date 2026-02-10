import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import { Octokit } from 'octokit';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
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
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid GitHub token. Please check and try again.' },
        { status: 401 }
      );
    }

    // Encrypt the token
    const encryptedToken = await encrypt(token);

    // Check if settings already exist
    const existing = await db.appSettings.findFirst();

    if (existing) {
      // Update existing settings
      await db.appSettings.update({
        where: { id: existing.id },
        data: {
          encryptedToken,
          tokenCreatedAt: new Date(),
          githubLogin: githubUser.login,
          githubUserId: githubUser.id,
          email: githubUser.email,
          name: githubUser.name,
          avatarUrl: githubUser.avatar_url,
        },
      });
    } else {
      // Create new settings
      await db.appSettings.create({
        data: {
          encryptedToken,
          tokenCreatedAt: new Date(),
          githubLogin: githubUser.login,
          githubUserId: githubUser.id,
          email: githubUser.email,
          name: githubUser.name,
          avatarUrl: githubUser.avatar_url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        login: githubUser.login,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to save token. Please try again.' },
      { status: 500 }
    );
  }
}
