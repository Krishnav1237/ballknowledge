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
  managerRating: number;
  roastScore: number;
  role: string;
  matchesPlayed: number;
  cardsEarned: number;
  legendaryCards: number;
  updatedAt: string;
};

// ─── Mock entries for early launch / empty DB ─────────────────────────────────
// These are shown when the real database has fewer than 3 real users.
const MOCK_ENTRIES: Omit<LeaderboardEntry, 'rank'>[] = [
  { username: 'TacticoMessi',    avatarStyle: 'fun-emoji', avatarSeed: 'TacticoMessi',    favoriteNation: 'Argentina', favoriteClub: 'Barcelona',  overallRating: 94, predictionRating: 98, hotTakeRating: 95, managerRating: 88, roastScore: 91, role: 'PREMIUM',  matchesPlayed: 12, cardsEarned: 10, legendaryCards: 4, updatedAt: new Date().toISOString() },
  { username: 'BanterKing99',    avatarStyle: 'fun-emoji', avatarSeed: 'BanterKing99',    favoriteNation: 'England',   favoriteClub: 'Man City',   overallRating: 89, predictionRating: 87, hotTakeRating: 94, managerRating: 82, roastScore: 99, role: 'PREMIUM',  matchesPlayed: 11, cardsEarned: 9,  legendaryCards: 3, updatedAt: new Date().toISOString() },
  { username: 'ElClasico_Chad',  avatarStyle: 'fun-emoji', avatarSeed: 'ElClasico_Chad',  favoriteNation: 'Spain',     favoriteClub: 'Real Madrid',overallRating: 86, predictionRating: 91, hotTakeRating: 84, managerRating: 80, roastScore: 78, role: 'PREMIUM',  matchesPlayed: 10, cardsEarned: 8,  legendaryCards: 2, updatedAt: new Date().toISOString() },
  { username: 'SambaTechnico',   avatarStyle: 'fun-emoji', avatarSeed: 'SambaTechnico',   favoriteNation: 'Brazil',    favoriteClub: 'Flamengo',   overallRating: 83, predictionRating: 80, hotTakeRating: 88, managerRating: 79, roastScore: 82, role: 'PREMIUM',  matchesPlayed: 9,  cardsEarned: 7,  legendaryCards: 2, updatedAt: new Date().toISOString() },
  { username: 'VarGodOkay',      avatarStyle: 'fun-emoji', avatarSeed: 'VarGodOkay',      favoriteNation: 'France',    favoriteClub: 'PSG',        overallRating: 80, predictionRating: 78, hotTakeRating: 85, managerRating: 75, roastScore: 80, role: 'FREE',    matchesPlayed: 8,  cardsEarned: 6,  legendaryCards: 1, updatedAt: new Date().toISOString() },
  { username: 'HighPressFC',     avatarStyle: 'fun-emoji', avatarSeed: 'HighPressFC',     favoriteNation: 'Germany',   favoriteClub: 'Bayern',     overallRating: 77, predictionRating: 82, hotTakeRating: 74, managerRating: 74, roastScore: 71, role: 'FREE',    matchesPlayed: 8,  cardsEarned: 6,  legendaryCards: 1, updatedAt: new Date().toISOString() },
  { username: 'NedvedLoyalist',  avatarStyle: 'fun-emoji', avatarSeed: 'NedvedLoyalist',  favoriteNation: 'Portugal',  favoriteClub: 'Juventus',   overallRating: 74, predictionRating: 76, hotTakeRating: 72, managerRating: 72, roastScore: 70, role: 'FREE',    matchesPlayed: 7,  cardsEarned: 5,  legendaryCards: 0, updatedAt: new Date().toISOString() },
  { username: 'AtlasLion_MAR',   avatarStyle: 'fun-emoji', avatarSeed: 'AtlasLion_MAR',   favoriteNation: 'Morocco',   favoriteClub: 'Wydad AC',   overallRating: 72, predictionRating: 70, hotTakeRating: 78, managerRating: 68, roastScore: 74, role: 'FREE',    matchesPlayed: 7,  cardsEarned: 5,  legendaryCards: 0, updatedAt: new Date().toISOString() },
  { username: 'CatenaccioKing',  avatarStyle: 'fun-emoji', avatarSeed: 'CatenaccioKing',  favoriteNation: 'Italy',     favoriteClub: 'Inter',      overallRating: 68, predictionRating: 72, hotTakeRating: 65, managerRating: 65, roastScore: 66, role: 'FREE',    matchesPlayed: 6,  cardsEarned: 4,  legendaryCards: 0, updatedAt: new Date().toISOString() },
  { username: 'RoofTopFanatic',  avatarStyle: 'fun-emoji', avatarSeed: 'RoofTopFanatic',  favoriteNation: 'Argentina', favoriteClub: 'River Plate', overallRating: 65, predictionRating: 68, hotTakeRating: 62, managerRating: 60, roastScore: 64, role: 'FREE',   matchesPlayed: 6,  cardsEarned: 4,  legendaryCards: 0, updatedAt: new Date().toISOString() },
  { username: 'ThreeLions_Mad',  avatarStyle: 'fun-emoji', avatarSeed: 'ThreeLions_Mad',  favoriteNation: 'England',   favoriteClub: 'Arsenal',    overallRating: 62, predictionRating: 60, hotTakeRating: 66, managerRating: 58, roastScore: 62, role: 'FREE',    matchesPlayed: 5,  cardsEarned: 3,  legendaryCards: 0, updatedAt: new Date().toISOString() },
  { username: 'Rookie_Tactician',avatarStyle: 'fun-emoji', avatarSeed: 'Reputation',      favoriteNation: 'Brazil',    favoriteClub: 'VAR FC',     overallRating: 50, predictionRating: 50, hotTakeRating: 50, managerRating: 50, roastScore: 50, role: 'FREE',    matchesPlayed: 1,  cardsEarned: 0,  legendaryCards: 0, updatedAt: new Date().toISOString() },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sort') || 'overall'; // overall | prediction | hottake
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
  const showMocks = searchParams.get('showMocks') === 'true';

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

    const realEntries: LeaderboardEntry[] = profiles.map((p, i) => ({
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

    // Only inject mocks if explicitly requested or if database is completely empty and developer desires bootstrapping
    let combinedEntries: Omit<LeaderboardEntry, 'rank'>[] = realEntries;
    if (showMocks && realEntries.length < 3) {
      const sortedMocks = [...MOCK_ENTRIES].sort((a, b) => {
        if (sortBy === 'prediction') return b.predictionRating - a.predictionRating;
        if (sortBy === 'hottake') return b.hotTakeRating - a.hotTakeRating;
        return b.overallRating - a.overallRating;
      });

      const realUsernames = new Set(realEntries.map(e => e.username.toLowerCase()));
      const filteredMocks = sortedMocks.filter(m => !realUsernames.has(m.username.toLowerCase()));
      combinedEntries = [...realEntries, ...filteredMocks].slice(0, limit);
    }

    const entries: LeaderboardEntry[] = combinedEntries.map((e, i) => ({ ...e, rank: i + 1 }));
    return NextResponse.json({ entries, total: entries.length, sortBy });

  } catch (error) {
    console.error('[Leaderboard API] DB error:', error);
    if (showMocks) {
      const sortedMocks = [...MOCK_ENTRIES].sort((a, b) => {
        if (sortBy === 'prediction') return b.predictionRating - a.predictionRating;
        if (sortBy === 'hottake') return b.hotTakeRating - a.hotTakeRating;
        return b.overallRating - a.overallRating;
      });
      const mockEntries = sortedMocks.slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 }));
      return NextResponse.json({ entries: mockEntries, total: mockEntries.length, sortBy, isMock: true });
    }
    return NextResponse.json({ entries: [], total: 0, sortBy, degraded: true, error: 'Database is temporarily unavailable.' });
  }
}
