import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { CHAT_BOT_USERNAMES } from '@/lib/chatList';
import { firstResolved } from '@/lib/requestBounds';

export const BOARD_WAIT_MS = 2_000;
export const BOARD_CACHE_MS = 15_000;

export type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarStyle: string;
  avatarSeed: string;
  favoriteNation: string | null;
  favoriteClub: string | null;
  overallRating: number;
};

export type BoardStats = {
  takes: number;
  cases: number;
  cards: number;
};

export type BoardSnapshot = {
  entries: LeaderboardEntry[];
  stats: BoardStats;
  degraded: boolean;
};

export function publicAvatarSeed(username: string, seed: string | null | undefined): string {
  const value = (seed || '').trim();
  if (!value || value.startsWith('data:') || value.length > 180) return username;
  return value;
}

const EMPTY: BoardSnapshot = {
  entries: [],
  stats: { takes: 0, cases: 0, cards: 0 },
  degraded: true,
};

let memo: { at: number; value: BoardSnapshot } | null = null;

async function loadProfiles(limit: number): Promise<Omit<LeaderboardEntry, 'rank'>[]> {
  const bots = Prisma.join(CHAT_BOT_USERNAMES.map((name) => Prisma.sql`${name}`));
  try {
    const rows = await prisma.$queryRaw<Omit<LeaderboardEntry, 'rank'>[]>`
      SELECT
        username,
        CASE WHEN "avatarStyle" LIKE 'data:%' THEN 'fun-emoji' ELSE "avatarStyle" END AS "avatarStyle",
        CASE
          WHEN "avatarSeed" LIKE 'data:%' OR length("avatarSeed") > 180 THEN username
          ELSE "avatarSeed"
        END AS "avatarSeed",
        "favoriteNation",
        "favoriteClub",
        "overallRating"
      FROM "FootballIQProfile"
      WHERE username NOT IN (${bots})
      ORDER BY "overallRating" DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch {
    const botsList = [...CHAT_BOT_USERNAMES];
    const profiles = await prisma.footballIQProfile.findMany({
      where: { username: { notIn: botsList } },
      orderBy: { overallRating: 'desc' },
      take: limit,
      select: {
        username: true,
        avatarStyle: true,
        avatarSeed: true,
        favoriteNation: true,
        favoriteClub: true,
        overallRating: true,
      },
    });
    return profiles.map((profile) => ({
      username: profile.username,
      avatarStyle: profile.avatarStyle.startsWith('data:') ? 'fun-emoji' : profile.avatarStyle,
      avatarSeed: publicAvatarSeed(profile.username, profile.avatarSeed),
      favoriteNation: profile.favoriteNation,
      favoriteClub: profile.favoriteClub,
      overallRating: Number(profile.overallRating) || 0,
    }));
  }
}

async function loadBoard(limit: number): Promise<BoardSnapshot> {
  const bots = [...CHAT_BOT_USERNAMES];
  const [profiles, cases, cards, takes] = await Promise.all([
    loadProfiles(limit),
    prisma.footballIQProfile.count({ where: { username: { notIn: bots } } }),
    prisma.matchCard.count(),
    prisma.hotTake.count(),
  ]);

  return {
    entries: profiles.map((profile, index) => ({
      rank: index + 1,
      username: profile.username,
      avatarStyle: profile.avatarStyle,
      avatarSeed: publicAvatarSeed(profile.username, profile.avatarSeed),
      favoriteNation: profile.favoriteNation,
      favoriteClub: profile.favoriteClub,
      overallRating: Number(profile.overallRating) || 0,
    })),
    stats: {
      takes,
      cases,
      cards,
    },
    degraded: false,
  };
}

export async function getBoardSnapshot(limit = 50): Promise<BoardSnapshot> {
  const now = Date.now();
  if (memo && now - memo.at < BOARD_CACHE_MS) return Promise.resolve(memo.value);

  const pending = loadBoard(limit)
    .then((value) => {
      memo = { at: Date.now(), value };
      return value;
    })
    .catch(() => memo?.value ?? EMPTY);

  return firstResolved(pending, BOARD_WAIT_MS, memo?.value ?? EMPTY);
}
