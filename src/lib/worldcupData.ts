
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

// Helper fetch with timeout to prevent slow remote fetches from blocking page renders
async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 8000): Promise<Response> {
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
    console.error('Matches remote fetch failed:', error);
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
    console.error('Teams remote fetch failed:', error);
    throw error;
  }
}
