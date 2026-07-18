import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { requireSession } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);

const CACHE_DIR = path.join(process.cwd(), 'src/lib/worldcup2026');
const CACHE_FILE = path.join(CACHE_DIR, 'sofascore_cache.json');
const MAP_FILE = path.join(CACHE_DIR, 'sofascore_map.json');
const SCRAPER_PATH = path.join(process.cwd(), 'src/lib/sofascore_scraper.py');

// Cache TTL: 30 seconds for live matches, 24 hours for finished
const LIVE_TTL_SECONDS = 30;
const FINISHED_TTL_SECONDS = 24 * 60 * 60;

interface SofaScoreCache {
  [matchId: string]: {
    data: any;
    fetchedAt: number;
    sofascoreEventId: number;
  };
}

// ── In-Memory Cache (Global Process State) ──────────────────────────────────
// To avoid disk I/O bottlenecks and race conditions on high-frequency polling.
let memoryCache: SofaScoreCache | null = null;

// ── Request Coalescing (Single-Flight Promise Registry) ─────────────────────
// Ensures that multiple concurrent API requests for the same match ID wait on
// a single scraper execution instead of spawning multiple processes.
const activePromises = new Map<string, Promise<any>>();

// ── Process Concurrency Limit Queue ─────────────────────────────────────────
// Limits how many scraper processes can run concurrently system-wide (max 2).
let activeProcessCount = 0;
const processQueue: Array<{
  eventId: number;
  resolve: (data: any) => void;
  reject: (err: any) => void;
}> = [];

function readCache(): SofaScoreCache {
  if (memoryCache) return memoryCache;
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    memoryCache = JSON.parse(raw);
    return memoryCache || {};
  } catch {
    return {};
  }
}

function writeCache(cache: SofaScoreCache) {
  memoryCache = cache;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (err) {
    console.error('[sofascore-sync] Failed to write cache to disk:', err);
  }
}

function readMap(): Record<string, any> {
  try {
    const raw = fs.readFileSync(MAP_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function isCacheStale(entry: { fetchedAt: number; data: any }): boolean {
  const now = Math.floor(Date.now() / 1000);
  const age = now - entry.fetchedAt;
  if (entry.data?.isFinished) {
    return age > FINISHED_TTL_SECONDS;
  }
  return age > LIVE_TTL_SECONDS;
}

// Process runner with strict concurrency queuing
async function runScraperInstance(eventId: number): Promise<any> {
  if (activeProcessCount >= 2) {
    if (processQueue.length >= 10) {
      throw new Error('Server busy (sync queue full). Please try again in a few seconds.');
    }
    // Queue the request
    return new Promise((resolve, reject) => {
      processQueue.push({ eventId, resolve, reject });
    });
  }

  activeProcessCount++;
  try {
    const { stdout } = await execFileAsync('python3', [SCRAPER_PATH, 'fetch', String(eventId)], {
      timeout: 15_000, // 15 second timeout limit
      maxBuffer: 5 * 1024 * 1024, // 5MB
    });
    return JSON.parse(stdout.trim());
  } catch (err: any) {
    console.error(`[sofascore-sync] Scraper process failed for event ${eventId}:`, err?.message || err);
    return null;
  } finally {
    activeProcessCount--;
    // Run next queued scraper if available
    const next = processQueue.shift();
    if (next) {
      runScraperInstance(next.eventId).then(next.resolve).catch(next.reject);
    }
  }
}

/**
 * Executes a sync for the given match ID. Coalesces concurrent calls.
 */
async function syncMatchData(matchId: string, eventId: number): Promise<any> {
  const cacheKey = String(matchId);
  if (activePromises.has(cacheKey)) {
    return activePromises.get(cacheKey);
  }

  const syncPromise = (async () => {
    try {
      const freshData = await runScraperInstance(eventId);
      activePromises.delete(cacheKey);
      return freshData;
    } catch (err: any) {
      activePromises.delete(cacheKey);
      return { error: err?.message || 'Sync failed' };
    }
  })();

  activePromises.set(cacheKey, syncPromise);
  return syncPromise;
}

/**
 * Generates a structured fallback response based on basic match info.
 * Prevents page crashes if the scraper fails and there is no cache history.
 */
function generateFallbackData(matchId: string, mapEntry: any) {
  const homeName = mapEntry?.homeTeam || 'Home Team';
  const awayName = mapEntry?.awayTeam || 'Away Team';
  return {
    matchId: String(matchId),
    status: 'Scheduled',
    homeTeam: homeName,
    awayTeam: awayName,
    homeScore: 0,
    awayScore: 0,
    isLive: false,
    isFinished: false,
    timeElapsed: 'notstarted',
    firstGoalscorer: 'None',
    motm: 'None',
    ratingsMap: {},
    homeGoals: [],
    awayGoals: [],
    fetchedAt: Math.floor(Date.now() / 1000),
    isFallback: true,
  };
}

/**
 * GET /api/sofascore-sync?matchId=102
 * Returns the cached/fresh SofaScore data for a given worldcup26.ir match ID.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');

  if (!matchId) {
    return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
  }

  const map = readMap();
  const mapEntry = map[matchId];

  if (!mapEntry || !mapEntry.sofascoreEventId) {
    return NextResponse.json({ error: `No SofaScore mapping for match ${matchId}` }, { status: 404 });
  }

  const sofascoreEventId = mapEntry.sofascoreEventId;
  const cache = readCache();
  const cacheKey = String(matchId);

  // Return cached data if fresh
  if (cache[cacheKey] && !isCacheStale(cache[cacheKey])) {
    return NextResponse.json({
      success: true,
      matchId,
      sofascoreEventId,
      data: cache[cacheKey].data,
      cached: true,
      cachedAt: cache[cacheKey].fetchedAt,
    });
  }

  // Fetch fresh data from SofaScore (using request coalescing)
  const freshData = await syncMatchData(matchId, sofascoreEventId);
  if (!freshData || freshData.error) {
    const isQueueFull = freshData?.error?.includes('queue full');

    // Return stale cache if available
    if (cache[cacheKey]) {
      return NextResponse.json({
        success: true,
        matchId,
        sofascoreEventId,
        data: cache[cacheKey].data,
        cached: true,
        stale: true,
        rateLimited: isQueueFull,
        cachedAt: cache[cacheKey].fetchedAt,
      });
    }

    if (isQueueFull) {
      return NextResponse.json({ error: freshData.error }, { status: 429 });
    }

    // No cache & Scraper failed: generate clean fallback instead of HTTP 502 error
    const fallback = generateFallbackData(matchId, mapEntry);
    return NextResponse.json({
      success: true,
      matchId,
      sofascoreEventId,
      data: fallback,
      cached: false,
      fallback: true,
    });
  }

  // Update cache
  cache[cacheKey] = {
    data: freshData,
    fetchedAt: freshData.fetchedAt || Math.floor(Date.now() / 1000),
    sofascoreEventId,
  };
  writeCache(cache);

  return NextResponse.json({
    success: true,
    matchId,
    sofascoreEventId,
    data: freshData,
    cached: false,
  });
}

/**
 * POST /api/sofascore-sync
 * Body: { matchIds: string[] }
 * Batch sync multiple matches. Admin only.
 */
export async function POST(request: Request) {
  const auth = requireSession(request);
  if (auth.response || !auth.session) return auth.response;
  if (auth.session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const matchIds: string[] = Array.isArray(body?.matchIds) ? body.matchIds : [];
  if (!matchIds.length) {
    return NextResponse.json({ error: 'matchIds array is required' }, { status: 400 });
  }

  const map = readMap();
  const cache = readCache();
  const results: Record<string, any> = {};

  for (const matchId of matchIds.slice(0, 20)) { // Cap at 20 per request
    const mapEntry = map[String(matchId)];
    if (!mapEntry?.sofascoreEventId) {
      results[matchId] = { error: 'No SofaScore mapping' };
      continue;
    }

    const sofascoreEventId = mapEntry.sofascoreEventId;
    const cacheKey = String(matchId);

    // Skip if cache is fresh
    if (cache[cacheKey] && !isCacheStale(cache[cacheKey])) {
      results[matchId] = { cached: true, isFinished: cache[cacheKey].data?.isFinished };
      continue;
    }

    // Use coalesced process trigger
    const freshData = await syncMatchData(matchId, sofascoreEventId);
    if (freshData && !freshData.error) {
      cache[cacheKey] = {
        data: freshData,
        fetchedAt: freshData.fetchedAt || Math.floor(Date.now() / 1000),
        sofascoreEventId,
      };
      results[matchId] = { success: true, isFinished: freshData.isFinished, isLive: freshData.isLive };
    } else {
      results[matchId] = { error: freshData?.error || 'Scraper failed' };
    }
  }

  writeCache(cache);

  return NextResponse.json({ success: true, results });
}
