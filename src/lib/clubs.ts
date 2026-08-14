import { getPremierLeagueClubs } from '@/lib/premierLeagueData';

const clubs = getPremierLeagueClubs();

const CREST_BY_NAME: Record<string, string> = {};
const CODE_BY_NAME: Record<string, string> = {};
for (const club of clubs) {
  CREST_BY_NAME[club.name_en.toLowerCase()] = club.flag;
  CODE_BY_NAME[club.name_en.toLowerCase()] = club.fifa_code;
}

function lookup<T>(name: string, table: Record<string, T>): T | undefined {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  if (table[needle]) return table[needle];
  for (const [key, value] of Object.entries(table)) {
    if (needle.includes(key) || key.includes(needle)) return value;
  }
  return undefined;
}

export function getClubCrestUrl(name: string): string {
  return lookup(name, CREST_BY_NAME) || '';
}

export function getClubCode(name: string): string {
  return lookup(name, CODE_BY_NAME) || name.trim().slice(0, 3).toUpperCase();
}

export function isPremierLeagueClub(name: string): boolean {
  return Boolean(lookup(name, CODE_BY_NAME));
}
