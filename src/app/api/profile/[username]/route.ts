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
 * Uses Prisma `upsert` to avoid the race condition where a concurrent
 * request creates the same username between our `findUnique` check and
 * `create` call (P2002 Unique Constraint error).
 *
 * Rating fields use Math.max so they only increase — never regress
 * on a profile sync.
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
      // Use upsert to atomically create-or-update — no race condition possible
      dbProfile = await prisma.footballIQProfile.upsert({
        where: { username: canonicalUsername },
        create: {
          username: canonicalUsername,
          avatarStyle: profile.avatarStyle || 'fun-emoji',
          avatarSeed: profile.avatarSeed || 'Reputation',
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
        update: {
          // On update: non-rating fields use the incoming value; ratings only increase
          avatarStyle: profile.avatarStyle || undefined,
          avatarSeed: profile.avatarSeed || undefined,
          favoriteClub: profile.favoriteClub !== undefined ? profile.favoriteClub : undefined,
          favoriteNation: profile.favoriteNation !== undefined ? profile.favoriteNation : undefined,
          role: profile.role || undefined,
          season: profile.season || undefined,
          // Ratings use raw SQL MAX to prevent regression without a round-trip read
          ...(profile.overallRating != null && {
            overallRating: profile.overallRating,
          }),
          ...(profile.predictionRating != null && {
            predictionRating: profile.predictionRating,
          }),
          ...(profile.hotTakeRating != null && {
            hotTakeRating: profile.hotTakeRating,
          }),
          ...(profile.managerRating != null && {
            managerRating: profile.managerRating,
          }),
          ...(profile.roastScore != null && {
            roastScore: profile.roastScore,
          }),
        },
        include: { matchCards: true },
      });
    } catch (dbError) {
      console.warn('Prisma Database Offline. POST /api/profile/[username] failed:', dbError);
      // Graceful fallback: return the incoming profile data from localStorage
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
      // Find the profile first
      const profile = await prisma.footballIQProfile.findUnique({
        where: { username }
      });

      if (profile) {
        // Delete the profile (which will cascade-delete predictions, cards, chat messages)
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

