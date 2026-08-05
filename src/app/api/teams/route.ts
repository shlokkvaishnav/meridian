import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { apiError } from '@/lib/api-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/teams - Get all teams for the current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teams = await db.team.findMany({
      where: {
        ownerId: session.settings.id,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    return apiError(error, 'Failed to fetch teams');
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, memberLogins } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const team = await db.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || null,
        memberLogins: memberLogins || [],
        ownerId: session.settings.id,
      },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    return apiError(error, 'Failed to create team');
  }
}

// PATCH /api/teams/[id] - Update a team
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Verify ownership
    const existingTeam = await db.team.findFirst({
      where: {
        id: teamId,
        ownerId: session.settings.id,
      },
    });

    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const team = await db.team.update({
      where: { id: teamId },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.color !== undefined && { color: body.color || null }),
        ...(body.memberLogins !== undefined && { memberLogins: body.memberLogins }),
      },
    });

    return NextResponse.json({ team });
  } catch (error) {
    return apiError(error, 'Failed to update team');
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingTeam = await db.team.findFirst({
      where: {
        id: teamId,
        ownerId: session.settings.id,
      },
    });

    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    await db.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Failed to delete team');
  }
}
