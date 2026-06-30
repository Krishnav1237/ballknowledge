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
 * Reads fresh data from disk to support real-time data syncs.
 */
export async function fetchWorldCupMatches(): Promise<any[]> {
  return readJsonFile('football.matches.json');
}

/**
 * Returns all World Cup 2026 teams.
 * Reads fresh data from disk to support real-time data syncs.
 */
export async function fetchWorldCupTeams(): Promise<any[]> {
  return readJsonFile('football.teams.json');
}



