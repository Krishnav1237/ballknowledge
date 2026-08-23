import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CHAT_BOT_USERNAMES } from '@/lib/chatList';

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
  managerRating: number;
  roastScore: number;
  role: string;
  matchesPlayed: number;
  cardsEarned: number;
  legendaryCards: number;
  updatedAt: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sort') || 'overall'; // overall | prediction | hottake
  let limitVal = parseInt(searchParams.get('limit') || '100', 10);
  if (isNaN(limitVal) || limitVal < 1) {
    limitVal = 100;
  }
  const limit = Math.min(limitVal, 100);

  try {
    const orderField =
      sortBy === 'prediction'
        ? { predictionRating: 'desc' as const }
        : sortBy === 'hottake'
        ? { hotTakeRating: 'desc' as const }
        : { overallRating: 'desc' as const };

    const profiles = await prisma.footballIQProfile.findMany({
      where: { username: { notIn: [...CHAT_BOT_USERNAMES] } },
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
        managerRating: true,
        roastScore: true,
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
      managerRating: p.managerRating,
      roastScore: p.roastScore,
      role: p.role,
      matchesPlayed: p._count.predictions,
      cardsEarned: p._count.matchCards,
      legendaryCards: p.matchCards.filter((c) => c.rarity === 'LEGENDARY').length,
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ entries, total: entries.length, sortBy });

  } catch (error) {
    console.error('[Leaderboard API] DB error:', error);
    return NextResponse.json({ entries: [], total: 0, sortBy, degraded: true, error: 'Database is temporarily unavailable.' });
  }
}
