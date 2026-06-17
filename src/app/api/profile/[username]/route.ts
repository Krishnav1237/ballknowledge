import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
        tacticalRating: profile.tacticalRating,
        communityRating: profile.communityRating,
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
