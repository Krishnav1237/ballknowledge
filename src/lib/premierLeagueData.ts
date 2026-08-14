/**
 * Premier League 2026/27 fixture and club loaders.
 * Authoritative live source for /api/matches and /api/teams.
 * Does not call worldcup26.ir or overlay World Cup SofaScore cache.
 */

import clubs from '@/lib/premierleague/clubs.json';
import matches from '@/lib/premierleague/matches.json';

export type PremierLeagueClub = {
  id: string;
  name_en: string;
  name_fa?: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
  stadium?: string;
};

export type PremierLeagueMatch = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string;
  finished: string;
  time_elapsed: string;
  type: string;
  stadium_id: string;
  home_team_name_en: string;
  away_team_name_en: string;
  home_team_label?: string;
  away_team_label?: string;
};

export const PREMIER_LEAGUE_SEASON = 'Premier League 2026/27';
export const PREMIER_LEAGUE_OPENING_DATE = '08/21/2026 20:00';
export const PREMIER_LEAGUE_OPENING_HOME = 'Arsenal';
export const PREMIER_LEAGUE_OPENING_AWAY = 'Coventry City';

export function getPremierLeagueClubs(): PremierLeagueClub[] {
  return clubs as PremierLeagueClub[];
}

export function getPremierLeagueMatches(): PremierLeagueMatch[] {
  return matches as PremierLeagueMatch[];
}

export async function fetchPremierLeagueTeams(): Promise<PremierLeagueClub[]> {
  return getPremierLeagueClubs();
}

export async function fetchPremierLeagueMatches(): Promise<PremierLeagueMatch[]> {
  return getPremierLeagueMatches();
}
