
import fs from 'fs';
import path from 'path';

if (typeof window === 'undefined') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const MATCHES_URL = 'https://worldcup26.ir/get/games';
const TEAMS_URL = 'https://worldcup26.ir/get/teams';

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

// Helper fetch with timeout to prevent slow remote fetches from blocking page renders
async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Fetch matches with caching and local fallback
export async function fetchWorldCupMatches(): Promise<any[]> {
  const now = Date.now();
  
  if (matchesCache.data && (now - matchesCache.lastFetched < CACHE_TTL)) {
    return matchesCache.data;
  }

  try {
    const res = await fetchWithTimeout(MATCHES_URL, {
      next: { revalidate: 300 } // Next.js level caching fallback
    });
    
    if (res.ok) {
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json.games || []);
      matchesCache = { data, lastFetched: now };
      return data;
    }
    throw new Error(`Failed to fetch matches: status ${res.status}`);
  } catch (error) {
    console.warn('Matches remote fetch failed, attempting cache/local fallback:', error);
    
    // 1. In-memory cache fallback (even if expired)
    if (matchesCache.data) {
      console.warn('Returning expired in-memory matches cache.');
      return matchesCache.data;
    }

    // 2. Read local fallback file (packaged with build)
    try {
      const filePath = getFallbackPath('football.matches.json');
      if (fs.existsSync(filePath)) {
        console.warn('Returning local matches JSON fallback.');
        const raw = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(raw);
        const data = Array.isArray(json) ? json : (json.games || []);
        // Save in cache (without updating lastFetched so we keep attempting remote fetch next time)
        matchesCache.data = data;
        return data;
      }
    } catch (fsErr) {
      console.error('Failed to read local matches fallback file:', fsErr);
    }

    throw error;
  }
}

// Fetch teams with caching and local fallback
export async function fetchWorldCupTeams(): Promise<any[]> {
  const now = Date.now();

  if (teamsCache.data && (now - teamsCache.lastFetched < CACHE_TTL)) {
    return teamsCache.data;
  }

  try {
    const res = await fetchWithTimeout(TEAMS_URL, {
      next: { revalidate: 300 }
    });

    if (res.ok) {
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json.teams || []);
      teamsCache = { data, lastFetched: now };
      return data;
    }
    throw new Error(`Failed to fetch teams: status ${res.status}`);
  } catch (error) {
    console.warn('Teams remote fetch failed, attempting cache/local fallback:', error);

    // 1. In-memory cache fallback (even if expired)
    if (teamsCache.data) {
      console.warn('Returning expired in-memory teams cache.');
      return teamsCache.data;
    }

    // 2. Read local fallback file (packaged with build)
    try {
      const filePath = getFallbackPath('football.teams.json');
      if (fs.existsSync(filePath)) {
        console.warn('Returning local teams JSON fallback.');
        const raw = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(raw);
        const data = Array.isArray(json) ? json : (json.teams || []);
        // Save in cache
        teamsCache.data = data;
        return data;
      }
    } catch (fsErr) {
      console.error('Failed to read local teams fallback file:', fsErr);
    }

    throw error;
  }
}
