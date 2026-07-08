/**
 * World Cup 2026 data service.
 *
 * Primary source: local JSON files (football.matches.json, football.teams.json).
 * These files are the authoritative source — they contain every real match result
 * with actual goal scorers verified from FIFA.com, Al Jazeera, Sky Sports, and
 * Olympics.com.
 *
 * The worldcup26.ir remote API is attempted on every request; if it succeeds,
 * the authoritative local overrides are applied on top to correct any stale remote
 * data, and the merged result is written back to disk as the new cache.
 * On any network failure, the app falls back silently to the local JSON.
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

function saveJsonFile(filename: string, data: any) {
  try {
    const filePath = getDataPath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[worldcupData] Failed to write back ${filename}:`, err);
  }
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
  };

  return matches.map(match => {
    const patch = VERIFIED[match.id];
    if (!patch) return match;
    return { ...match, ...patch };
  });
}

/**
 * Returns all World Cup 2026 matches.
 * Attempts to fetch live data from worldcup26.ir API, applies verified overrides on top,
 * then writes back to disk cache. Falls back silently to local JSON on timeout or errors.
 */
export async function fetchWorldCupMatches(): Promise<any[]> {
  try {
    const apiData = await fetchFromApi('/get/games');
    if (apiData && (Array.isArray(apiData.games) || Array.isArray(apiData))) {
      const rawGames = apiData.games || apiData;
      const games = applyMatchOverrides(rawGames);
      // Write corrected data back to disk cache
      saveJsonFile('football.matches.json', games);
      return games;
    }
  } catch (err) {
    console.warn('[worldcupData] Failed to fetch live matches, falling back to disk cache:', (err as Error).message);
  }
  // Serve from local cache — overrides still applied for consistency
  const localGames = readJsonFile('football.matches.json');
  return applyMatchOverrides(localGames);
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
