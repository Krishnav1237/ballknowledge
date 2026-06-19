import fs from 'fs';
import path from 'path';

const MATCHES_URL = 'https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.matches.json';
const TEAMS_URL = 'https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.teams.json';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

interface Cache<T> {
  data: T | null;
  lastFetched: number;
}

let matchesCache: Cache<any[]> = { data: null, lastFetched: 0 };
let teamsCache: Cache<any[]> = { data: null, lastFetched: 0 };

// Helper to get local fallback path
function getFallbackPath(filename: string): string {
  return path.join(process.cwd(), 'src/lib/worldcup2026', filename);
}

// Fetch matches with caching and local fallback
export async function fetchWorldCupMatches(): Promise<any[]> {
  const now = Date.now();
  
  if (matchesCache.data && (now - matchesCache.lastFetched < CACHE_TTL)) {
    return matchesCache.data;
  }

  try {
    const res = await fetch(MATCHES_URL, {
      next: { revalidate: 300 } // Next.js level caching fallback
    });
    
    if (res.ok) {
      const data = await res.json();
      matchesCache = { data, lastFetched: now };
      return data;
    }
    throw new Error(`Failed to fetch matches: status ${res.status}`);
  } catch (error) {
    console.warn('Matches remote fetch failed, falling back to local dataset:', error);
    
    try {
      const filePath = getFallbackPath('football.matches.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        // Do not update timestamp so we retry remote fetch on next request
        matchesCache.data = data;
        return data;
      }
    } catch (fsErr) {
      console.error('Failed to read local matches fallback file:', fsErr);
    }
  }

  return matchesCache.data || [];
}

// Fetch teams with caching and local fallback
export async function fetchWorldCupTeams(): Promise<any[]> {
  const now = Date.now();

  if (teamsCache.data && (now - teamsCache.lastFetched < CACHE_TTL)) {
    return teamsCache.data;
  }

  try {
    const res = await fetch(TEAMS_URL, {
      next: { revalidate: 300 }
    });

    if (res.ok) {
      const data = await res.json();
      teamsCache = { data, lastFetched: now };
      return data;
    }
    throw new Error(`Failed to fetch teams: status ${res.status}`);
  } catch (error) {
    console.warn('Teams remote fetch failed, falling back to local dataset:', error);

    try {
      const filePath = getFallbackPath('football.teams.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        teamsCache.data = data;
        return data;
      }
    } catch (fsErr) {
      console.error('Failed to read local teams fallback file:', fsErr);
    }
  }

  return teamsCache.data || [];
}
