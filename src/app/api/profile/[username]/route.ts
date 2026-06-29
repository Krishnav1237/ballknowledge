import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    let profile = null;
    let cards: any[] = [];
    let isDbOffline = false;

    try {
      profile = await prisma.footballIQProfile.findUnique({
        where: { username },
        include: {
          matchCards: true
        }
      });
      
      if (profile) {
        cards = profile.matchCards;
      }
    } catch (dbError) {
      console.warn('Prisma Database Offline. GET /api/profile/[username] failed:', dbError);
      isDbOffline = true;
    }

    if (isDbOffline) {
      return NextResponse.json({ error: 'Database is offline. Service temporarily degraded.' }, { status: 503 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        avatarStyle: profile.avatarStyle,
        avatarSeed: profile.avatarSeed,
        inputImage: profile.inputImage,
        favoriteClub: profile.favoriteClub,
        favoriteNation: profile.favoriteNation,
        overallRating: profile.overallRating,
        predictionRating: profile.predictionRating,
        hotTakeRating: profile.hotTakeRating,
        managerRating: profile.managerRating,
        roastScore: profile.roastScore,
        role: profile.role,
        season: profile.season,
        createdAt: profile.createdAt
      },
      cards
    });

  } catch (error) {
    console.error('Error in GET /api/profile/[username]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/profile/[username]
 *
 * Upserts (create-or-update) a FootballIQProfile atomically.
 * Performs a read-before-write check to preserve the highest rating values,
 * preventing outdated local storage syncs from regressing database overall ratings.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: routeUsername } = await params;
    const body = await request.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    // Resolve the canonical username: prefer body → URL param → fallback
    const canonicalUsername =
      profile.username ||
      (routeUsername ? decodeURIComponent(routeUsername) : null) ||
      'Rookie_Tactician';

    let dbProfile = null;

    try {
      const existing = await prisma.footballIQProfile.findUnique({
        where: { username: canonicalUsername }
      });

      if (existing) {
        dbProfile = await prisma.footballIQProfile.update({
          where: { id: existing.id },
          data: {
            avatarStyle: profile.avatarStyle || undefined,
            avatarSeed: profile.avatarSeed || undefined,
            inputImage: profile.inputImage !== undefined ? profile.inputImage : undefined,
            favoriteClub: profile.favoriteClub !== undefined ? profile.favoriteClub : undefined,
            favoriteNation: profile.favoriteNation !== undefined ? profile.favoriteNation : undefined,
            role: profile.role || undefined,
            season: profile.season || undefined,
            overallRating: Math.max(existing.overallRating, profile.overallRating || 0),
            predictionRating: Math.max(existing.predictionRating, profile.predictionRating || 0),
            hotTakeRating: Math.max(existing.hotTakeRating, profile.hotTakeRating || 0),
            managerRating: Math.max(existing.managerRating, profile.managerRating || 0),
            roastScore: Math.max(existing.roastScore, profile.roastScore || 0),
          },
          include: { matchCards: true }
        });
      } else {
        dbProfile = await prisma.footballIQProfile.create({
          data: {
            username: canonicalUsername,
            avatarStyle: profile.avatarStyle || 'fun-emoji',
            avatarSeed: profile.avatarSeed || 'Reputation',
            inputImage: profile.inputImage || null,
            favoriteClub: profile.favoriteClub || null,
            favoriteNation: profile.favoriteNation || null,
            overallRating: profile.overallRating || 50,
            predictionRating: profile.predictionRating || 50,
            hotTakeRating: profile.hotTakeRating || 50,
            managerRating: profile.managerRating || 50,
            roastScore: profile.roastScore || 50,
            role: profile.role || 'FREE',
            season: profile.season || 'World Cup 2026',
          },
          include: { matchCards: true }
        });
      }
    } catch (dbError) {
      console.warn('Prisma Database Offline. POST /api/profile/[username] failed:', dbError);
    }

    const finalProfile = dbProfile || profile;
    const cards = dbProfile ? dbProfile.matchCards : [];

    return NextResponse.json({
      success: true,
      profile: {
        id: finalProfile.id,
        username: finalProfile.username,
        avatarStyle: finalProfile.avatarStyle,
        avatarSeed: finalProfile.avatarSeed,
        inputImage: finalProfile.inputImage,
        favoriteClub: finalProfile.favoriteClub,
        favoriteNation: finalProfile.favoriteNation,
        overallRating: finalProfile.overallRating,
        predictionRating: finalProfile.predictionRating,
        hotTakeRating: finalProfile.hotTakeRating,
        managerRating: finalProfile.managerRating,
        roastScore: finalProfile.roastScore,
        role: finalProfile.role,
        season: finalProfile.season,
        createdAt: finalProfile.createdAt,
      },
      cards,
    });

  } catch (error) {
    console.error('Error in POST /api/profile/[username]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    try {
      const profile = await prisma.footballIQProfile.findUnique({
        where: { username }
      });

      if (profile) {
        await prisma.footballIQProfile.delete({
          where: { username }
        });
      }
    } catch (dbError) {
      console.warn('Prisma Database Offline. DELETE /api/profile/[username] failed:', dbError);
      return NextResponse.json({ error: 'Database offline' }, { status: 503 });
    }

    return NextResponse.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/profile/[username]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
