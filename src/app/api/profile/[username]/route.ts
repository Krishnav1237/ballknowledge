import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cleanShortText, expiredSessionCookieHeader, getSessionFromRequest, requireSession } from '@/lib/authSession';

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

    const session = getSessionFromRequest(request);

    try {
      profile = await prisma.footballIQProfile.findUnique({
        where: { username },
        include: {
          matchCards: true,
          predictions: {
            include: {
              hotTakes: true
            }
          }
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
      return NextResponse.json({
        success: false,
        degraded: true,
        error: 'Database is offline. Service temporarily degraded.',
        profile: null,
        cards: [],
        predictions: [],
      });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const isOwner = session?.profileId === profile.id;

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        avatarStyle: profile.avatarStyle,
        avatarSeed: profile.avatarSeed,
        inputImage: isOwner ? profile.inputImage : null,
        email: isOwner ? profile.email : null,
        name: isOwner ? profile.name : null,
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
      cards,
      predictions: isOwner ? profile.predictions : []
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
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    const body = await request.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    const { username: routeUsername } = await params;
    const requestedUsername = routeUsername ? decodeURIComponent(routeUsername) : '';
    if (requestedUsername && requestedUsername !== auth.session.username) {
      return NextResponse.json({ error: 'Cannot sync another manager profile.' }, { status: 403 });
    }

    let dbProfile = null;

    try {
      const existing = await prisma.footballIQProfile.findUnique({
        where: { id: auth.session.profileId },
        include: {
          matchCards: true,
          predictions: { include: { hotTakes: true } },
        },
      });

      if (existing) {
        dbProfile = await prisma.footballIQProfile.update({
          where: { id: existing.id },
          data: {
            avatarStyle: profile.avatarStyle || undefined,
            avatarSeed: profile.avatarSeed || undefined,
            inputImage: profile.inputImage !== undefined ? profile.inputImage : undefined,
            name: profile.name !== undefined ? cleanShortText(profile.name, 120) : undefined,
            favoriteClub: profile.favoriteClub !== undefined ? cleanShortText(profile.favoriteClub, 80) : undefined,
            favoriteNation: profile.favoriteNation !== undefined ? cleanShortText(profile.favoriteNation, 80) : undefined,
          },
          include: {
            matchCards: true,
            predictions: { include: { hotTakes: true } },
          }
        });
      } else {
        return NextResponse.json({ error: 'Authenticated profile not found.' }, { status: 404 });
      }
    } catch (dbError) {
      console.warn('Prisma Database Offline. POST /api/profile/[username] failed:', dbError);
    }

    const finalProfile = dbProfile || profile;
    const cards = dbProfile ? dbProfile.matchCards : [];
    const predictions = dbProfile ? dbProfile.predictions : [];

    return NextResponse.json({
      success: true,
      profile: {
        id: finalProfile.id,
        username: finalProfile.username,
        avatarStyle: finalProfile.avatarStyle,
        avatarSeed: finalProfile.avatarSeed,
        inputImage: finalProfile.inputImage,
        email: finalProfile.email,
        name: finalProfile.name,
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
      predictions,
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
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (decodeURIComponent(username) !== auth.session.username) {
      return NextResponse.json({ error: 'Cannot delete another manager profile.' }, { status: 403 });
    }

    try {
      const profile = await prisma.footballIQProfile.findUnique({
        where: { id: auth.session.profileId }
      });

      if (profile) {
        await prisma.footballIQProfile.delete({
          where: { id: auth.session.profileId }
        });
      }
    } catch (dbError) {
      console.warn('Prisma Database Offline. DELETE /api/profile/[username] failed:', dbError);
      return NextResponse.json({ error: 'Database offline' }, { status: 503 });
    }

    const response = NextResponse.json({ success: true, message: 'Profile deleted successfully' });
    response.headers.append('Set-Cookie', expiredSessionCookieHeader());
    return response;
  } catch (error) {
    console.error('Error in DELETE /api/profile/[username]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
