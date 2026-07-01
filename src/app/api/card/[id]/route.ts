import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    let card = null;
    let isDbOffline = false;

    try {
      card = await prisma.matchCard.findUnique({
        where: { id },
        include: {
          profile: true
        }
      });
    } catch (dbError) {
      console.warn('Prisma Database Offline. GET /api/card/[id] failed:', dbError);
      isDbOffline = true;
    }

    if (isDbOffline) {
      return NextResponse.json({
        success: false,
        degraded: true,
        error: 'Database is offline. Service temporarily degraded.',
        card: null,
        profile: null,
      });
    }

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      card: {
        id: card.id,
        matchId: card.matchId,
        rating: card.rating,
        verdict: card.verdict,
        charge: card.charge,
        evidence: card.evidence,
        sentence: card.sentence,
        rarity: card.rarity,
        cardTheme: card.cardTheme,
        aiImageUrl: card.aiImageUrl,
        statsJson: card.statsJson,
        createdAt: card.createdAt
      },
      profile: {
        username: card.profile.username,
        avatarStyle: card.profile.avatarStyle,
        avatarSeed: card.profile.avatarSeed,
        favoriteClub: card.profile.favoriteClub,
        favoriteNation: card.profile.favoriteNation
      }
    });

  } catch (error) {
    console.error('Error in GET /api/card/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
