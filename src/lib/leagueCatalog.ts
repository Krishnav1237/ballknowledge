import { getPremierLeagueClubs, getPremierLeagueMatches, type PremierLeagueClub, type PremierLeagueMatch } from '@/lib/premierLeagueData';
import { fetchWithTimeout } from '@/lib/requestBounds';
import type { BoardSnapshot, LeaderboardEntry } from '@/lib/boardSnapshot';

export const leagueKeys = {
  matches: ['premier-league-matches'] as const,
  teams: ['premier-league-teams'] as const,
  board: ['board'] as const,
  leaderboard: ['leaderboard'] as const,
  stats: ['stats'] as const,
};

export const catalogMatches = getPremierLeagueMatches;
export const catalogTeams = getPremierLeagueClubs;

export async function fetchLeagueMatches(): Promise<PremierLeagueMatch[]> {
  const res = await fetchWithTimeout('/api/matches');
  if (!res.ok) throw new Error('Failed to load matches');
  const data = await res.json();
  return Array.isArray(data) ? data : data.matches || [];
}

export async function fetchLeagueTeams(): Promise<PremierLeagueClub[]> {
  const res = await fetchWithTimeout('/api/teams');
  if (!res.ok) throw new Error('Failed to load teams');
  const data = await res.json();
  return Array.isArray(data) ? data : data.teams || [];
}

export async function fetchLeagueBoard(): Promise<BoardSnapshot> {
  const res = await fetchWithTimeout('/api/board');
  if (!res.ok) throw new Error('Failed to load board');
  const data = await res.json();
  return {
    entries: Array.isArray(data?.entries) ? (data.entries as LeaderboardEntry[]) : [],
    stats: {
      takes: Number(data?.stats?.takes) || 0,
      cases: Number(data?.stats?.cases) || 0,
      cards: Number(data?.stats?.cards) || 0,
    },
    degraded: Boolean(data?.degraded),
  };
}
