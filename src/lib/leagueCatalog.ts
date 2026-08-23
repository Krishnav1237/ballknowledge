import { getPremierLeagueClubs, getPremierLeagueMatches, type PremierLeagueClub, type PremierLeagueMatch } from '@/lib/premierLeagueData';
import { fetchWithTimeout } from '@/lib/requestBounds';
import type { LeaderboardEntry } from '@/app/api/leaderboard/route';

export const leagueKeys = {
  matches: ['premier-league-matches'] as const,
  teams: ['premier-league-teams'] as const,
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

export async function fetchLeagueLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const res = await fetchWithTimeout(`/api/leaderboard?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load board');
  const data = await res.json();
  return Array.isArray(data?.entries) ? data.entries : [];
}

export type LeagueStats = { takes: number; cases: number; cards: number; degraded?: boolean };

export async function fetchLeagueStats(): Promise<LeagueStats> {
  const res = await fetchWithTimeout('/api/stats');
  if (!res.ok) throw new Error('Failed to load stats');
  const data = await res.json();
  return {
    takes: Number(data.takes) || 0,
    cases: Number(data.cases) || 0,
    cards: Number(data.cards) || 0,
    degraded: Boolean(data.degraded),
  };
}
