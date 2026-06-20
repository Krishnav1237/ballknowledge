/**
 * World Cup 2026 data service.
 *
 * The remote worldcup26.ir API is permanently unreachable (returns empty body,
 * always aborts). The local JSON files are the authoritative data source —
 * they contain every real group-stage result with actual scorers.
 *
 * This module reads directly from disk on first access, then caches the parsed
 * objects in module-level singletons for the lifetime of the Node process
 * (no repeated disk I/O on subsequent requests).
 */

import fs from 'fs';
import path from 'path';

// Module-level singletons — populated once per process.
let matchesData: any[] | null = null;
let teamsData: any[] | null = null;

function getDataPath(filename: string): string {
  return path.join(process.cwd(), 'src/lib/worldcup2026', filename);
}

function readJsonFile(filename: string): any[] {
  const filePath = getDataPath(filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  return Array.isArray(json) ? json : json.games || json.teams || [];
}

/**
 * Returns all World Cup 2026 matches.
 * Reads from disk once per process lifetime, cached in memory thereafter.
 */
export async function fetchWorldCupMatches(): Promise<any[]> {
  if (!matchesData) {
    matchesData = readJsonFile('football.matches.json');
  }
  return matchesData;
}

/**
 * Returns all World Cup 2026 teams.
 * Reads from disk once per process lifetime, cached in memory thereafter.
 */
export async function fetchWorldCupTeams(): Promise<any[]> {
  if (!teamsData) {
    teamsData = readJsonFile('football.teams.json');
  }
  return teamsData;
}

/**
 * Returns a single match by ID. Efficient — no full array allocation beyond
 * the first call which populates the module-level cache.
 */
export async function fetchMatchById(matchId: string): Promise<any | null> {
  const matches = await fetchWorldCupMatches();
  return matches.find((m) => m.id === matchId) ?? null;
}
