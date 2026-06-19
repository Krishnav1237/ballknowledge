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

const MOCK_PROFILES = [
  {
    username: 'TacticoMaestro',
    avatarStyle: 'adventurer',
    avatarSeed: 'Felix',
    favoriteNation: 'Spain',
    favoriteClub: 'Real Madrid',
    overallRating: 94,
    predictionRating: 96,
    hotTakeRating: 92,
    role: 'PREMIUM',
    matchesPlayed: 24,
    cardsEarned: 18,
    legendaryCards: 4,
  },
  {
    username: 'GoalOracle',
    avatarStyle: 'fun-emoji',
    avatarSeed: 'Leo',
    favoriteNation: 'Brazil',
    favoriteClub: 'Barcelona',
    overallRating: 91,
    predictionRating: 94,
    hotTakeRating: 88,
    role: 'PREMIUM',
    matchesPlayed: 20,
    cardsEarned: 15,
    legendaryCards: 3,
  },
  {
    username: 'BanterKing',
    avatarStyle: 'bottts',
    avatarSeed: 'Milo',
    favoriteNation: 'England',
    favoriteClub: 'Arsenal',
    overallRating: 88,
    predictionRating: 84,
    hotTakeRating: 92,
    role: 'COMMON',
    matchesPlayed: 18,
    cardsEarned: 12,
    legendaryCards: 2,
  },
  {
    username: 'GafferInsights',
    avatarStyle: 'avataaars',
    avatarSeed: 'Jack',
    favoriteNation: 'Germany',
    favoriteClub: 'Bayern Munich',
    overallRating: 85,
    predictionRating: 88,
    hotTakeRating: 82,
    role: 'COMMON',
    matchesPlayed: 16,
    cardsEarned: 9,
    legendaryCards: 1,
  },
  {
    username: 'XG_Wizard',
    avatarStyle: 'pixel-art',
    avatarSeed: 'Oliver',
    favoriteNation: 'France',
    favoriteClub: 'PSG',
    overallRating: 82,
    predictionRating: 86,
    hotTakeRating: 78,
    role: 'COMMON',
    matchesPlayed: 22,
    cardsEarned: 11,
    legendaryCards: 1,
  },
  {
    username: 'KopiteConnor',
    avatarStyle: 'big-ears',
    avatarSeed: 'Connor',
    favoriteNation: 'Ireland',
    favoriteClub: 'Liverpool',
    overallRating: 78,
    predictionRating: 76,
    hotTakeRating: 80,
    role: 'COMMON',
    matchesPlayed: 12,
    cardsEarned: 6,
    legendaryCards: 0,
  },
  {
    username: 'PibeDeOro',
    avatarStyle: 'lorelei',
    avatarSeed: 'Diego',
    favoriteNation: 'Argentina',
    favoriteClub: 'Boca Juniors',
    overallRating: 75,
    predictionRating: 73,
    hotTakeRating: 77,
    role: 'COMMON',
    matchesPlayed: 10,
    cardsEarned: 5,
    legendaryCards: 0,
  },
  {
    username: 'AzzurriMindset',
    avatarStyle: 'miniavs',
    avatarSeed: 'Enzo',
    favoriteNation: 'Italy',
    favoriteClub: 'Juventus',
    overallRating: 72,
    predictionRating: 71,
    hotTakeRating: 73,
    role: 'COMMON',
    matchesPlayed: 9,
    cardsEarned: 4,
    legendaryCards: 0,
  },
  {
    username: 'JogaBonito99',
    avatarStyle: 'identicon',
    avatarSeed: 'Cris',
    favoriteNation: 'Portugal',
    favoriteClub: 'Manchester United',
    overallRating: 68,
    predictionRating: 66,
    hotTakeRating: 70,
    role: 'COMMON',
    matchesPlayed: 8,
    cardsEarned: 3,
    legendaryCards: 0,
  },
  {
    username: 'TikiTakaTony',
    avatarStyle: 'personas',
    avatarSeed: 'Tony',
    favoriteNation: 'Netherlands',
    favoriteClub: 'Ajax',
    overallRating: 65,
    predictionRating: 63,
    hotTakeRating: 67,
    role: 'COMMON',
    matchesPlayed: 7,
    cardsEarned: 2,
    legendaryCards: 0,
  },
  {
    username: 'ParkTheBus',
    avatarStyle: 'micah',
    avatarSeed: 'Jose',
    favoriteNation: 'Belgium',
    favoriteClub: 'Chelsea',
    overallRating: 62,
    predictionRating: 59,
    hotTakeRating: 65,
    role: 'COMMON',
    matchesPlayed: 6,
    cardsEarned: 3,
    legendaryCards: 0,
  },
  {
    username: 'FalseNine',
    avatarStyle: 'thumbs',
    avatarSeed: 'Luka',
    favoriteNation: 'Croatia',
    favoriteClub: 'Real Madrid',
    overallRating: 58,
    predictionRating: 56,
    hotTakeRating: 60,
    role: 'COMMON',
    matchesPlayed: 5,
    cardsEarned: 1,
    legendaryCards: 0,
  },
  {
    username: 'MeazzaMagic',
    avatarStyle: 'rings',
    avatarSeed: 'Sandro',
    favoriteNation: 'Switzerland',
    favoriteClub: 'Inter Milan',
    overallRating: 55,
    predictionRating: 53,
    hotTakeRating: 57,
    role: 'COMMON',
    matchesPlayed: 4,
    cardsEarned: 1,
    legendaryCards: 0,
  },
  {
    username: 'RegistaRuler',
    avatarStyle: 'shapes',
    avatarSeed: 'Fede',
    favoriteNation: 'Uruguay',
    favoriteClub: 'AC Milan',
    overallRating: 52,
    predictionRating: 49,
    hotTakeRating: 55,
    role: 'COMMON',
    matchesPlayed: 3,
    cardsEarned: 0,
    legendaryCards: 0,
  },
  {
    username: 'SweeperKeeper',
    avatarStyle: 'glass',
    avatarSeed: 'Manu',
    favoriteNation: 'USA',
    favoriteClub: 'LA Galaxy',
    overallRating: 48,
    predictionRating: 45,
    hotTakeRating: 51,
    role: 'COMMON',
    matchesPlayed: 2,
    cardsEarned: 0,
    legendaryCards: 0,
  }
];

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

    let entries: LeaderboardEntry[] = [];

    if (profiles.length > 0) {
      entries = profiles.map((p, i) => ({
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
    } else {
      // Sort the mock profiles according to the requested sort field
      const sortedMocks = [...MOCK_PROFILES].sort((a, b) => {
        if (sortBy === 'prediction') {
          return b.predictionRating - a.predictionRating;
        } else if (sortBy === 'hottake') {
          return b.hotTakeRating - a.hotTakeRating;
        } else {
          return b.overallRating - a.overallRating;
        }
      });

      entries = sortedMocks.map((p, i) => ({
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
        matchesPlayed: p.matchesPlayed,
        cardsEarned: p.cardsEarned,
        legendaryCards: p.legendaryCards,
        updatedAt: new Date().toISOString(),
      }));
    }

    return NextResponse.json({ entries, total: entries.length, sortBy });
  } catch (error) {
    console.error('[Leaderboard API] DB error:', error);
    // Return sorted mock profiles on DB error so the app remains visual/usable
    const sortedMocks = [...MOCK_PROFILES].sort((a, b) => {
      if (sortBy === 'prediction') {
        return b.predictionRating - a.predictionRating;
      } else if (sortBy === 'hottake') {
        return b.hotTakeRating - a.hotTakeRating;
      } else {
        return b.overallRating - a.overallRating;
      }
    });

    const entries = sortedMocks.map((p, i) => ({
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
      matchesPlayed: p.matchesPlayed,
      cardsEarned: p.cardsEarned,
      legendaryCards: p.legendaryCards,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ entries, total: entries.length, sortBy });
  }
}
