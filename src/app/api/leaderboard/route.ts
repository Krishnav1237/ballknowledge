import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarStyle: string;
  avatarSeed: string;
  favoriteNation: string | null;
  favoriteClub: string | null;
  overallRating: number;
  predictionRating: number;
  hotTakeRating: number;
  role: string;
  matchesPlayed: number;
  cardsEarned: number;
  legendaryCards: number;
  updatedAt: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sort') || 'overall'; // overall | prediction | hottake
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);

  try {
    const orderField =
      sortBy === 'prediction'
        ? { predictionRating: 'desc' as const }
        : sortBy === 'hottake'
        ? { hotTakeRating: 'desc' as const }
        : { overallRating: 'desc' as const };

    const profiles = await prisma.footballIQProfile.findMany({
      orderBy: orderField,
      take: limit,
      select: {
        username: true,
        avatarStyle: true,
        avatarSeed: true,
        favoriteNation: true,
        favoriteClub: true,
        overallRating: true,
        predictionRating: true,
        hotTakeRating: true,
        role: true,
        updatedAt: true,
        _count: {
          select: {
            predictions: true,
            matchCards: true,
          },
        },
        matchCards: {
          select: { rarity: true },
        },
      },
    });

    const entries: LeaderboardEntry[] = profiles.map((p, i) => ({
      rank: i + 1,
      username: p.username,
      avatarStyle: p.avatarStyle,
      avatarSeed: p.avatarSeed,
      favoriteNation: p.favoriteNation,
      favoriteClub: p.favoriteClub,
      overallRating: p.overallRating,
      predictionRating: p.predictionRating,
      hotTakeRating: p.hotTakeRating,
      role: p.role,
      matchesPlayed: p._count.predictions,
      cardsEarned: p._count.matchCards,
      legendaryCards: p.matchCards.filter((c) => c.rarity === 'LEGENDARY').length,
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ entries, total: entries.length, sortBy });
  } catch (error) {
    console.error('[Leaderboard API] DB error:', error);
    return NextResponse.json({ entries: [], total: 0, sortBy, error: 'Database error (offline mode)' });
  }
}
