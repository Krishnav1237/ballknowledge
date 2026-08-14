import type { PremierLeagueClub, PremierLeagueMatch } from '@/lib/premierLeagueData';

export type LeagueStanding = {
  teamId: string;
  name: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

function numericScore(raw: string | undefined): number | null {
  if (raw === undefined || raw === null || raw === '' || raw === 'null') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function getMatchweek(match: PremierLeagueMatch): number {
  const n = parseInt(String(match.matchday), 10);
  return Number.isFinite(n) ? n : 0;
}

export function listMatchweeks(matches: PremierLeagueMatch[]): number[] {
  const weeks = new Set<number>();
  for (const match of matches) {
    const week = getMatchweek(match);
    if (week > 0) weeks.add(week);
  }
  return [...weeks].sort((a, b) => a - b);
}

export function matchesForMatchweek(matches: PremierLeagueMatch[], week: number): PremierLeagueMatch[] {
  return matches.filter((match) => getMatchweek(match) === week);
}

/**
 * Single-table Premier League standings: 3 pts win, 1 draw, 0 loss.
 * Only finished matches with numeric scores are counted.
 */
export function computeLeagueTable(
  matches: PremierLeagueMatch[],
  clubs: PremierLeagueClub[],
): LeagueStanding[] {
  const rows = new Map<string, LeagueStanding>();
  for (const club of clubs) {
    rows.set(club.id, {
      teamId: club.id,
      name: club.name_en,
      flag: club.flag,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.finished !== 'TRUE') continue;
    const homeGoals = numericScore(match.home_score);
    const awayGoals = numericScore(match.away_score);
    if (homeGoals === null || awayGoals === null) continue;
    const home = rows.get(match.home_team_id);
    const away = rows.get(match.away_team_id);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.gf += homeGoals;
    home.ga += awayGoals;
    away.gf += awayGoals;
    away.ga += homeGoals;
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;

    if (homeGoals > awayGoals) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (homeGoals < awayGoals) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return [...rows.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

export function findClubByName(clubs: PremierLeagueClub[], name: string): PremierLeagueClub | undefined {
  const needle = name.trim().toLowerCase();
  return clubs.find((club) => {
    const hay = club.name_en.toLowerCase();
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
}
