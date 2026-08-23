import { getMatchClockStatus, parseLocalDate, type MatchClockStatus } from './matchUtils';

export type MatchdayFixture = {
  id: string;
  matchday: string;
  local_date: string;
  stadium_id?: string;
  finished?: string;
  home_team_id: string;
  away_team_id: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
};

function sortByKickoff<T extends MatchdayFixture>(matches: T[]): T[] {
  return [...matches].sort(
    (a, b) =>
      parseLocalDate(a.local_date, a.stadium_id).getTime() -
      parseLocalDate(b.local_date, b.stadium_id).getTime(),
  );
}

export function pickFeaturedMatch<T extends MatchdayFixture>(matches: T[], nowMs: number): T | null {
  if (matches.length === 0) return null;
  const ordered = sortByKickoff(matches);
  const live = ordered.find((match) => getMatchClockStatus(match, nowMs) === 'LIVE');
  if (live) return live;
  const upcoming = ordered.find((match) => getMatchClockStatus(match, nowMs) === 'UPCOMING');
  if (upcoming) return upcoming;
  return ordered[ordered.length - 1] ?? null;
}

export function listMatchQueue<T extends MatchdayFixture>(
  matches: T[],
  featuredId: string | undefined,
  nowMs: number,
  limit = 4,
): T[] {
  return sortByKickoff(matches)
    .filter((match) => match.id !== featuredId && getMatchClockStatus(match, nowMs) !== 'COMPLETED')
    .slice(0, limit);
}

export function matchActionLabel(status: MatchClockStatus, locked: boolean): string {
  if (status === 'LIVE') return 'Enter live';
  if (status === 'COMPLETED') return locked ? 'Get card' : 'Grade it';
  return locked ? 'Edit call' : 'Enter match';
}
