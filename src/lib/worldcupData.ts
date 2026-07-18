/**
 * World Cup 2026 data service.
 *
 * Data pipeline (highest priority wins):
 * 1. SofaScore live cache (sofascore_cache.json) — real-time scores, goals, and player ratings
 *    fetched by the Python scraper (src/lib/sofascore_scraper.py) on demand.
 * 2. Authoritative local overrides (VERIFIED table below) — manually verified results.
 * 3. worldcup26.ir remote API — base fixture data, falls back to local JSON cache.
 *
 * The sofascore_map.json file maps worldcup26.ir match IDs to SofaScore event IDs.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

function getDataPath(filename: string): string {
  return path.join(process.cwd(), 'src/lib/worldcup2026', filename);
}

function readJsonFile(filename: string): any[] {
  try {
    const filePath = getDataPath(filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json : json.games || json.teams || [];
  } catch {
    return []; // Gracefully return empty on missing file or parse error
  }
}

function readJsonObject(filename: string): Record<string, any> {
  try {
    const filePath = getDataPath(filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    return typeof json === 'object' && !Array.isArray(json) ? json : {};
  } catch {
    return {};
  }
}

function saveJsonFile(filename: string, data: any) {
  try {
    const filePath = getDataPath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[worldcupData] Failed to write back ${filename}:`, err);
  }
}

/**
 * Returns the SofaScore event ID for a given worldcup26.ir match ID.
 * Returns null if no mapping exists.
 */
export function getSofaScoreEventId(matchId: string): number | null {
  const map = readJsonObject('sofascore_map.json');
  return map[matchId]?.sofascoreEventId ?? null;
}

/**
 * Formats a SofaScore goal list into worldcup26.ir scorer string format:
 * e.g. '{"Lionel Messi 80\'","Lautaro Martínez 31\' (P)"}'
 */
function formatSofaScorers(goals: Array<{player: string; minute: number; isPenalty?: boolean; isOwnGoal?: boolean}>): string {
  if (!goals || goals.length === 0) return 'null';
  const entries = goals.map(g => {
    const suffix = g.isPenalty ? ` (P)` : g.isOwnGoal ? ` (OG)` : '';
    return `"${g.player} ${g.minute}'${suffix}"`;
  });
  return `{${entries.join(',')}}`;
}

/**
 * Overlays SofaScore live/finished match data on top of the base match array.
 * Reads from sofascore_cache.json (populated by the Python scraper via /api/sofascore-sync).
 * Only overlays matches that have valid cached data.
 */
function applySofaScoreOverrides(matches: any[]): any[] {
  const cache = readJsonObject('sofascore_cache.json');
  if (!cache || Object.keys(cache).length === 0) return matches;

  return matches.map(match => {
    const entry = cache[String(match.id)];
    if (!entry?.data) return match;

    const d = entry.data;

    // Only overlay if the SofaScore data is actually meaningful
    if (!d.isFinished && !d.isLive) return match;

    const patch: Record<string, any> = {};

    // Scores
    patch.home_score = String(d.homeScore ?? match.home_score);
    patch.away_score = String(d.awayScore ?? match.away_score);

    // Status
    if (d.isFinished) {
      patch.finished = 'TRUE';
      patch.time_elapsed = 'finished';
    } else if (d.isLive) {
      patch.finished = 'FALSE';
      patch.time_elapsed = d.timeElapsed || 'LIVE';
    }

    // Goal scorers — only overlay if SofaScore has goal data
    if (d.homeGoals && Array.isArray(d.homeGoals)) {
      patch.home_scorers = formatSofaScorers(d.homeGoals);
    }
    if (d.awayGoals && Array.isArray(d.awayGoals)) {
      patch.away_scorers = formatSofaScorers(d.awayGoals);
    }

    // First goalscorer + MOTM (used by resolution engine)
    if (d.firstGoalscorer && d.firstGoalscorer !== 'None') {
      patch.sofascore_firstGoalscorer = d.firstGoalscorer;
    }
    if (d.motm && d.motm !== 'None') {
      patch.sofascore_motm = d.motm;
    }

    // Player ratings map (used by getPlayerMatchRatings)
    if (d.ratingsMap && Object.keys(d.ratingsMap).length > 0) {
      patch.sofascore_ratings = d.ratingsMap;
    }

    return { ...match, ...patch };
  });
}

// Keyless online live score fetch with timeout handling
function fetchFromApi(pathName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'worldcup26.ir',
      path: pathName,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 3000 // Fast 3-second timeout to keep the app responsive
    };

    const req = https.get(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`API responded with status code ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('API request timed out'));
    });
  });
}

/**
 * Applies verified real-world match results on top of any remote API data.
 * The remote worldcup26.ir API sometimes returns stale or partially incorrect data.
 * These overrides reflect the ground truth as verified from FIFA.com and major outlets.
 * Only completed matches with known results are patched here.
 */
function applyMatchOverrides(matches: any[]): any[] {
  // Verified results — sources: FIFA.com, Al Jazeera, Sky Sports, Olympics.com
  // Normalise any remote API casing inconsistencies (e.g. "Finished" vs "finished")
  const VERIFIED: Record<string, Partial<Record<string, string>>> = {
    // R32 matches — all completed
    '73': { // South Africa 0-1 Canada
      home_score: '0', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: 'null',
      away_scorers: '{"Stephen Eustáquio 92\'"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '74': { // Germany 1-1 Paraguay (Paraguay win pens 4-3)
      home_score: '1', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Kai Havertz 54\'"}',
      away_scorers: '{"Julio Enciso 42\'"}',
      home_penalty_score: '3', away_penalty_score: '4',
      home_penalty_misses: '{"Jonathan Tah"}',
      home_penalty_scorers: '{"Joshua Kimmich","Jamal Musiala","Nadiem Amiri"}',
      away_penalty_misses: '{"Antonio Sanabria","Fabian Balbuena"}',
      away_penalty_scorers: '{"Matías Galarza","Gustavo Gómez","Kanel Domínguez","José Canale"}',
    },
    '75': { // Netherlands 1-1 Morocco (Morocco win pens 3-2)
      home_score: '1', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Cody Gakpo 72\'"}',
      away_scorers: '{"Issa Diop 90+1\'"}',
      home_penalty_score: '2', away_penalty_score: '3',
      home_penalty_misses: '{"Justin Kluivert","Crysencio Summerville"}',
      home_penalty_scorers: '{"Ton Koopmeiners","Wout Weghorst"}',
      away_penalty_misses: '{"Neil El Aynaoui","Achraf Hakimi"}',
      away_penalty_scorers: '{"Soufiane Rahimi","Shamseddin Talbi","Ismael Saibari"}',
    },
    '76': { // Brazil 2-1 Japan
      home_score: '2', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Casemiro 56\'","Gabriel Martinelli 90+5\'"}',
      away_scorers: '{"Kaishu Sano 29\'"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '77': { // France 3-0 Sweden
      home_score: '3', away_score: '0', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Kylian Mbappé 45\'","Bradley Barcola 53\'","Kylian Mbappé 74\'"}',
      away_scorers: 'null',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '78': { // Ivory Coast 1-2 Norway
      home_score: '1', away_score: '2', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Amad Diallo 74\'"}',
      away_scorers: '{"Antonio Nusa 39\'","Erling Haaland 86\'"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '79': { // Mexico 2-0 Ecuador
      home_score: '2', away_score: '0', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Julián Quiñones 22\'","Raúl Jiménez 31\'"}',
      away_scorers: 'null',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '80': { // England 2-1 Congo DR
      home_score: '2', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Harry Kane 75\'","Harry Kane 86\'"}',
      away_scorers: '{"Brian Cipenga 7\'"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '81': { // USA 2-0 Bosnia and Herzegovina
      home_score: '2', away_score: '0', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Folarin Balogun 45\'","Malik Tillman 82\'"}',
      away_scorers: 'null',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '82': { // Belgium 3-2 Senegal (AET)
      home_score: '3', away_score: '2', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Romelu Lukaku 86\'","Youri Tielemans 89\'","Youri Tielemans 120+5\' (P)"}',
      away_scorers: '{"Habib Diarra 24\'","Ismaïla Sarr 51\'"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '83': { // Portugal 2-1 Croatia
      home_score: '2', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Cristiano Ronaldo 68\' (P)","Gonçalo Ramos 94\'"}',
      away_scorers: '{"Ivan Perišić 53\'"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '84': { // Spain 3-0 Austria
      home_score: '3', away_score: '0', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Mikel Oyarzabal 36\'","Pedro Porro 66\'","Mikel Oyarzabal 89\'"}',
      away_scorers: 'null',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '85': { // Switzerland 2-0 Algeria
      home_score: '2', away_score: '0', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Breel Embolo 10\'","Dan Ndoye 46\'"}',
      away_scorers: 'null',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '86': { // Argentina 3-2 Cape Verde (AET)
      home_score: '3', away_score: '2', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Lionel Messi 29\'","Lautaro Martínez 92\'","Diney Borges 111\' (OG)"}',
      away_scorers: '{"Deroy Duarte 59\'","Sidny Lopes Cabral 103\'"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '87': { // Colombia 1-0 Ghana
      home_score: '1', away_score: '0', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Jhon Arias 14\'"}',
      away_scorers: 'null',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '88': { // Australia 1-1 Egypt (Egypt win pens 4-2)
      home_score: '1', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Mohamed Hany 55\' (OG)"}',
      away_scorers: '{"Emam Ashour 13\'"}',
      home_penalty_score: '2', away_penalty_score: '4',
      home_penalty_misses: '{"Harry Souttar","Lucas Herrington"}',
      home_penalty_scorers: '{"Nestory Irankunda","Jordan Bos"}',
      away_penalty_misses: 'null',
      away_penalty_scorers: '{"Mohamed Salah","Emam Ashour","Mahmoud Trezeguet","Hossam Abdelmaguid"}',
    },
    // R16 matches — completed
    '89': { // Paraguay 0-1 France (Mbappé pen 70')
      home_score: '0', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: 'null',
      away_scorers: '{"Kylian Mbappé 70\' (P)"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
      home_penalty_misses: 'null', away_penalty_misses: 'null',
      home_penalty_scorers: 'null', away_penalty_scorers: 'null',
    },
    '90': { // Canada 0-3 Morocco (Ounahi 50', 82', Rahimi 90+8')
      home_score: '0', away_score: '3', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: 'null',
      away_scorers: '{"Azzedine Ounahi 50\'","Azzedine Ounahi 82\'","Soufiane Rahimi 90+8\'"}',
      home_penalty_score: 'null', away_penalty_score: 'null',
      home_penalty_misses: 'null', away_penalty_misses: 'null',
      home_penalty_scorers: 'null', away_penalty_scorers: 'null',
    },
    // QF (matches 97-100) — sources verified
    '97': { // France 1-0 Switzerland (QF1, Barcola 37')
      home_score: '1', away_score: '0', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: '{"Bradley Barcola 37\'"}',
      away_scorers: 'null',
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    '98': { // Morocco 0-1 Norway (QF2, Haaland 89')
      home_score: '0', away_score: '1', finished: 'TRUE', time_elapsed: 'finished',
      home_scorers: 'null',
      away_scorers: '{\'Erling Haaland 89\'\'}'  ,
      home_penalty_score: 'null', away_penalty_score: 'null',
    },
    // SF1 (match 102) and beyond: data comes from SofaScore live cache, no manual override needed
  };

  return matches.map(match => {
    const patch = VERIFIED[match.id];
    // Normalise inconsistent time_elapsed casing from remote API
    const normalised = { ...match };
    if (typeof normalised.time_elapsed === 'string') {
      normalised.time_elapsed = normalised.time_elapsed.toLowerCase() === 'finished' ? 'finished' : normalised.time_elapsed;
    }
    if (!patch || Object.keys(patch).length === 0) return normalised;
    return { ...normalised, ...patch };
  });
}

/**
 * Returns all World Cup 2026 matches.
 * Attempts to fetch live data from worldcup26.ir API, applies verified overrides on top,
 * then writes back to disk cache. Falls back silently to local JSON on timeout or errors.
 */
export async function fetchWorldCupMatches(): Promise<any[]> {
  let games: any[];
  try {
    const apiData = await fetchFromApi('/get/games');
    if (apiData && (Array.isArray(apiData.games) || Array.isArray(apiData))) {
      const rawGames = apiData.games || apiData;
      games = applyMatchOverrides(rawGames);
      // Write corrected data back to disk cache
      saveJsonFile('football.matches.json', games);
    } else {
      throw new Error('Unexpected API shape');
    }
  } catch (err) {
    console.warn('[worldcupData] Failed to fetch live matches, falling back to disk cache:', (err as Error).message);
    const localGames = readJsonFile('football.matches.json');
    games = applyMatchOverrides(localGames);
  }

  // Layer SofaScore live/finished data on top for maximum accuracy
  return applySofaScoreOverrides(games);
}

/**
 * Returns all World Cup 2026 teams.
 * Attempts to fetch live data from worldcup26.ir API, then synchronizes it to local storage.
 * Falls back silently to local JSON on timeout or connection failures.
 */
export async function fetchWorldCupTeams(): Promise<any[]> {
  try {
    const apiData = await fetchFromApi('/get/teams');
    if (apiData && (Array.isArray(apiData.teams) || Array.isArray(apiData))) {
      const teams = apiData.teams || apiData;
      // Asynchronously update local database cache
      saveJsonFile('football.teams.json', teams);
      return teams;
    }
  } catch (err) {
    console.warn('[worldcupData] Failed to fetch live teams, falling back to disk cache:', (err as Error).message);
  }
  return readJsonFile('football.teams.json');
}
