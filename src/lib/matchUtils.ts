/**
 * @file matchUtils.ts
 * @description Shared match utilities providing a single source of truth for date parsing,
 * deterministic result simulation, timezone offset normalization, and flag mapping.
 * Avoid duplicate code by importing from this file.
 */

import { TEAM_ROSTERS } from './roster';

/**
 * Maps a stadium ID to its standard UTC offset during Daylight Saving Time (summer).
 * Used to translate stadium-local kickoff dates into uniform UTC Date objects.
 * 
 * @param {string} [stadiumId] - The ID of the stadium.
 * @returns {number} The UTC offset in hours (e.g., -4 for EDT, -7 for PDT).
 */
function getStadiumUTCOffset(stadiumId?: string): number {
  if (!stadiumId) return -4; // Default to EDT (New York)
  switch (stadiumId.trim()) {
    // Eastern Daylight Time (EDT / UTC-4)
    case '7':  // Atlanta (Mercedes-Benz Stadium)
    case '8':  // Miami (Hard Rock Stadium)
    case '9':  // Boston (Gillette Stadium)
    case '10': // Philadelphia (Lincoln Financial Field)
    case '11': // New York/New Jersey (MetLife Stadium)
    case '12': // Toronto (BMO Field)
      return -4;

    // Central Daylight Time (CDT / UTC-5)
    case '4':  // Dallas (AT&T Stadium)
    case '5':  // Houston (NRG Stadium)
    case '6':  // Kansas City (GEHA Field at Arrowhead Stadium)
      return -5;

    // Mexico Central Standard Time (CST / UTC-6)
    case '1':  // Mexico City (Estadio Azteca)
    case '2':  // Guadalajara (Estadio Akron)
    case '3':  // Monterrey (Estadio BBVA)
      return -6;

    // Pacific Daylight Time (PDT / UTC-7)
    case '13': // Vancouver (BC Place)
    case '14': // Seattle (Lumen Field)
    case '15': // San Francisco (Levi's Stadium)
    case '16': // Los Angeles (SoFi Stadium)
      return -7;

    default:
      return -4;
  }
}

/**
 * Parses a date string in the format "MM/DD/YYYY HH:MM" (stadium local time, no timezone info)
 * and resolves it to a JavaScript Date object representing the absolute UTC moment.
 * This ensures consistency across client/server environments and avoids hydration mismatches.
 * 
 * @param {string} localDateStr - The raw date string (e.g., "06/15/2026 18:00").
 * @param {string} [stadiumId] - The ID of the stadium to identify the local timezone.
 * @returns {Date} The parsed Date object representing the absolute UTC timestamp.
 */
export function parseLocalDate(localDateStr: string, stadiumId?: string): Date {
  const [datePart, timePart] = localDateStr.split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  const offset = getStadiumUTCOffset(stadiumId);
  // local time = UTC + offset, so UTC = local time - offset
  const utcMillis = Date.UTC(year, month - 1, day, hours, minutes) - offset * 60 * 60 * 1000;
  return new Date(utcMillis);
}

/**
 * Checks if two Date objects fall on the same UTC calendar day.
 * Used for filtering matches by day, avoiding local timezone displacement.
 * 
 * @param {Date} d1 - First date.
 * @param {Date} d2 - Second date.
 * @returns {boolean} True if both dates fall on the same UTC calendar day.
 */
export function isSameUTCDate(d1: Date, d2: Date): boolean {
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
         d1.getUTCMonth() === d2.getUTCMonth() &&
         d1.getUTCDate() === d2.getUTCDate();
}

/**
 * Resolves a team name to its matching key inside TEAM_ROSTERS.
 * Handles sub-strings and exact case-insensitive matches.
 * 
 * @param {string} teamName - The name of the country/team (e.g. "Argentina").
 * @returns {string|undefined} The normalized key for TEAM_ROSTERS, or undefined.
 */
function findTeamRosterKey(teamName: string): string | undefined {
  const normalized = teamName.toLowerCase().trim();
  let found = Object.keys(TEAM_ROSTERS).find(k => k.toLowerCase() === normalized);
  if (found) return found;

  found = Object.keys(TEAM_ROSTERS).find(k => {
    const keyNorm = k.toLowerCase();
    return keyNorm.includes(normalized) || normalized.includes(keyNorm);
  });
  return found;
}

/**
 * Derives a realistic match result from completed match records.
 * If the match has not been played or is still open, but the current time has passed
 * the kickoff threshold + 2 hours, it deterministically simulates the result.
 * 
 * Simulation algorithm:
 * 1. Creates a pseudo-random seed using the match ID.
 * 2. Fetches home/away team ratings based on the player rosters.
 * 3. Calculates expected goal counts using a Poisson-like threshold distribution.
 * 4. Selects goalscorers using weighted player ratings (strikers weighted 1.5x).
 * 5. Selects the Man of the Match based on top goalscoring contribution or goalkeeper rating (for 0-0).
 * 
 * @param {string} matchId - The unique match identifier.
 * @param {string} homeTeamName - English name of the home team.
 * @param {string} awayTeamName - English name of the away team.
 * @param {any} [match] - Optional raw match object containing actual scores/scorers.
 * @returns {Object} The derived or simulated match result (scores, scorers, MOTM, winner).
 */
export function getDeterministicMatchResult(
  matchId: string,
  homeTeamName: string,
  awayTeamName: string,
  match?: any
) {
  let homeScore = 0;
  let awayScore = 0;
  let firstGoalscorer = 'None';
  let motm = 'None';

  const kickoff = match?.local_date ? parseLocalDate(match.local_date, match.stadium_id) : null;
  const hasEndedByTime = kickoff && (new Date().getTime() - kickoff.getTime() >= 2 * 60 * 60 * 1000);

  const hasRealScores = match && 
                        match.home_score !== 'null' && 
                        match.home_score !== undefined &&
                        match.away_score !== 'null' && 
                        match.away_score !== undefined &&
                        match.time_elapsed !== 'notstarted';

  if (hasRealScores) {
    // Case A: The match has real results registered in the database/JSON source.
    homeScore = Number(match.home_score);
    awayScore = Number(match.away_score);

    const parseScorersWithMinutes = (scorersStr: string) => {
      if (!scorersStr || scorersStr === 'null' || scorersStr === 'undefined') return [];
      const clean = scorersStr.replace(/[{}"“”]/g, '').trim();
      if (!clean) return [];
      return clean.split(',').map(s => {
        const matchGroup = s.trim().match(/^([^0-9]+)\s+(\d+)'/);
        if (matchGroup) {
          return { player: matchGroup[1].trim(), minute: parseInt(matchGroup[2], 10) };
        }
        return { player: s.trim().replace(/\s+\d+'.*$/, ''), minute: 90 };
      });
    };

    const homeGoals = parseScorersWithMinutes(match.home_scorers);
    const awayGoals = parseScorersWithMinutes(match.away_scorers);
    const allGoals = [
      ...homeGoals.map(g => ({ ...g, team: 'home' })),
      ...awayGoals.map(g => ({ ...g, team: 'away' }))
    ].sort((a, b) => a.minute - b.minute);

    if (allGoals.length > 0) {
      firstGoalscorer = allGoals[0].player;
      
      // Determine MOTM: player who scored the most goals. If tied, pick the one who scored first.
      const goalCounts: Record<string, number> = {};
      const firstGoalTime: Record<string, number> = {};
      allGoals.forEach((g) => {
        goalCounts[g.player] = (goalCounts[g.player] || 0) + 1;
        if (firstGoalTime[g.player] === undefined) {
          firstGoalTime[g.player] = g.minute;
        }
      });
      
      let bestPlayer = allGoals[0].player;
      let maxGoals = 0;
      Object.keys(goalCounts).forEach((player) => {
        const goals = goalCounts[player];
        if (goals > maxGoals) {
          maxGoals = goals;
          bestPlayer = player;
        } else if (goals === maxGoals) {
          if (firstGoalTime[player] < firstGoalTime[bestPlayer]) {
            bestPlayer = player;
          }
        }
      });
      motm = bestPlayer;
    } else if (homeScore === 0 && awayScore === 0) {
      firstGoalscorer = 'None';
      
      // Get home/away goalkeeper for MOTM in a 0-0 draw
      const homeKey = findTeamRosterKey(homeTeamName);
      const awayKey = findTeamRosterKey(awayTeamName);
      const homeRoster = homeKey ? TEAM_ROSTERS[homeKey] : [];
      const awayRoster = awayKey ? TEAM_ROSTERS[awayKey] : [];
      const homeGk = homeRoster.find(p => p.position === 'GK');
      const awayGk = awayRoster.find(p => p.position === 'GK');
      
      if (homeGk && awayGk) {
        motm = homeGk.rating >= awayGk.rating ? homeGk.name : awayGk.name;
      } else {
        motm = homeGk?.name || awayGk?.name || 'Goalkeeper';
      }
    }
  } else if (hasEndedByTime) {
    // Case B: Match duration elapsed but no real result registered yet. Run deterministic simulation.
    // Determine simulated results deterministically using matchId as a seed.
    let seed = 0;
    for (let i = 0; i < matchId.length; i++) {
      seed = matchId.charCodeAt(i) + ((seed << 5) - seed);
    }
    // LCG-style deterministic random generator bound to the match ID seed
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const homeKey = findTeamRosterKey(homeTeamName);
    const awayKey = findTeamRosterKey(awayTeamName);
    const homeRoster = homeKey ? TEAM_ROSTERS[homeKey] : [];
    const awayRoster = awayKey ? TEAM_ROSTERS[awayKey] : [];

    // Calculate overall team squad ratings from rosters (fallback: 75)
    const homeRating = homeRoster.length > 0 ? (homeRoster.reduce((sum, p) => sum + p.rating, 0) / homeRoster.length) : 75;
    const awayRating = awayRoster.length > 0 ? (awayRoster.reduce((sum, p) => sum + p.rating, 0) / awayRoster.length) : 75;

    // Expected goals based on rating differential + home advantage modifier
    const homeExpected = 1.3 + (homeRating - awayRating) * 0.1 + 0.2;
    const awayExpected = 1.1 + (awayRating - homeRating) * 0.1;

    // Poisson-like distribution algorithm for goal tally
    const getGoalsCount = (expected: number) => {
      const r = random();
      if (r < Math.exp(-expected)) return 0;
      if (r < Math.exp(-expected) * (1 + expected)) return 1;
      if (r < Math.exp(-expected) * (1 + expected + expected * expected / 2)) return 2;
      if (r < Math.exp(-expected) * (1 + expected + expected * expected / 2 + expected * expected * expected / 6)) return 3;
      return 4;
    };

    homeScore = getGoalsCount(homeExpected);
    awayScore = getGoalsCount(awayExpected);

    // Pick scorers from roster weighted by position (Forwards have 1.5x rating multiplier)
    const getScorers = (roster: any[], count: number, team: 'home' | 'away') => {
      if (roster.length === 0) return [];
      const pool = roster.filter(p => p.position === 'FWD' || p.position === 'MID');
      const activePool = pool.length > 0 ? pool : roster;
      
      const goalsList: { player: string; minute: number; team: 'home' | 'away' }[] = [];
      for (let i = 0; i < count; i++) {
        const totalWeight = activePool.reduce((sum, p) => sum + (p.position === 'FWD' ? p.rating * 1.5 : p.rating), 0);
        let r = random() * totalWeight;
        let selectedPlayer = activePool[0];
        for (const p of activePool) {
          const weight = p.position === 'FWD' ? p.rating * 1.5 : p.rating;
          if (r <= weight) {
            selectedPlayer = p;
            break;
          }
          r -= weight;
        }
        
        const minute = Math.floor(random() * 90) + 1;
        goalsList.push({ player: selectedPlayer.name, minute, team });
      }
      return goalsList;
    };

    const homeGoals = getScorers(homeRoster, homeScore, 'home');
    const awayGoals = getScorers(awayRoster, awayScore, 'away');
    const allGoals = [...homeGoals, ...awayGoals].sort((a, b) => a.minute - b.minute);

    if (allGoals.length > 0) {
      firstGoalscorer = allGoals[0].player;
      
      // Determine simulated MOTM based on goal count
      const goalCounts: Record<string, number> = {};
      const firstGoalTime: Record<string, number> = {};
      allGoals.forEach((g) => {
        goalCounts[g.player] = (goalCounts[g.player] || 0) + 1;
        if (firstGoalTime[g.player] === undefined) {
          firstGoalTime[g.player] = g.minute;
        }
      });
      
      let bestPlayer = allGoals[0].player;
      let maxGoals = 0;
      Object.keys(goalCounts).forEach((player) => {
        const goals = goalCounts[player];
        if (goals > maxGoals) {
          maxGoals = goals;
          bestPlayer = player;
        } else if (goals === maxGoals) {
          if (firstGoalTime[player] < firstGoalTime[bestPlayer]) {
            bestPlayer = player;
          }
        }
      });
      motm = bestPlayer;
    } else {
      firstGoalscorer = 'None';
      const homeGk = homeRoster.find(p => p.position === 'GK');
      const awayGk = awayRoster.find(p => p.position === 'GK');
      if (homeGk && awayGk) {
        motm = homeGk.rating >= awayGk.rating ? homeGk.name : awayGk.name;
      } else {
        motm = homeGk?.name || awayGk?.name || 'Goalkeeper';
      }
    }
  }

  const possessionWinner =
    homeScore > awayScore
      ? homeTeamName
      : awayScore > homeScore
      ? awayTeamName
      : 'Draw';

  return { homeScore, awayScore, firstGoalscorer, motm, possessionWinner };
}

/**
 * Maps a country English name/identifier to its Unicode flag emoji.
 * Ideal for canvas drawings or server contexts where loading external images is slow.
 * 
 * @param {string} countryName - The name of the country.
 * @returns {string} The matching flag emoji, or 🏳️ if unknown.
 */
export function getFlagEmoji(countryName: string): string {
  const n = countryName.trim().toLowerCase();
  if (n.includes('arg')) return '🇦🇷';
  if (n.includes('bra') || n.includes('brasil')) return '🇧🇷';
  if (n.includes('por')) return '🇵🇹';
  if (n.includes('fra')) return '🇫🇷';
  if (n.includes('eng') || n.includes('gbr')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (n.includes('ger') || n.includes('deu') || n.includes('deutsch')) return '🇩🇪';
  if (n.includes('spa') || n.includes('esp')) return '🇪🇸';
  if (n.includes('net') || n.includes('hol') || n.includes('nld') || n.includes('nether')) return '🇳🇱';
  if (n.includes('uru')) return '🇺🇾';
  if (n.includes('mar') || n.includes('mor')) return '🇲🇦';
  if (n.includes('jap') || n.includes('jpn')) return '🇯🇵';
  if (n.includes('sau') || n.includes('ksa') || n.includes('saudi')) return '🇸🇦';
  if (n.includes('usa') || n.includes('united states') || n.includes('america')) return '🇺🇸';
  if (n.includes('can')) return '🇨🇦';
  if (n.includes('mex')) return '🇲🇽';
  if (n.includes('ita')) return '🇮🇹';
  if (n.includes('cro')) return '🇭🇷';
  if (n.includes('bel')) return '🇧🇪';
  if (n.includes('sen')) return '🇸🇳';
  if (n.includes('swe')) return '🇸🇪';
  if (n.includes('tun')) return '🇹🇳';
  if (n.includes('egy')) return '🇪🇬';
  if (n.includes('irn') || n.includes('iran')) return '🇮🇷';
  if (n.includes('nzl') || n.includes('new zealand')) return '🇳🇿';
  if (n.includes('aus')) return '🇦🇺';
  if (n.includes('qat')) return '🇶🇦';
  if (n.includes('kor') || n.includes('korea')) return '🇰🇷';
  if (n.includes('col')) return '🇨🇴';
  if (n.includes('pol')) return '🇵🇱';
  if (n.includes('den') || n.includes('dnk')) return '🇩🇰';
  if (n.includes('swi') || n.includes('sui') || n.includes('swiss')) return '🇨🇭';
  if (n.includes('ser') || n.includes('srb')) return '🇷🇸';
  if (n.includes('aut')) return '🇦🇹';
  if (n.includes('jor')) return '🇯🇴';
  if (n.includes('ven')) return '🇻🇪';
  if (n.includes('ecu')) return '🇪🇨';
  if (n.includes('par') || n.includes('pry')) return '🇵🇾';
  if (n.includes('bol')) return '🇧🇴';
  if (n.includes('per') || n.includes('pru')) return '🇵🇪';
  if (n.includes('chi') || n.includes('chl')) return '🇨🇱';
  if (n.includes('nigeria') || n.includes('nga')) return '🇳🇬';
  if (n.includes('ghana') || n.includes('gha')) return '🇬🇭';
  if (n.includes('cameroon') || n.includes('cmr')) return '🇨🇲';
  if (n.includes('south africa') || n.includes('rsa')) return '🇿🇦';
  if (n.includes('ivory') || n.includes('cote')) return '🇨🇮';
  if (n.includes('tur') || n.includes('turkey')) return '🇹🇷';
  if (n.includes('ukr')) return '🇺🇦';
  if (n.includes('wal') || n.includes('wales')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (n.includes('scot')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (n.includes('indonesia') || n.includes('idn')) return '🇮🇩';
  if (n.includes('iraq') || n.includes('irq')) return '🇮🇶';
  if (n.includes('uae') || n.includes('united arab')) return '🇦🇪';
  if (n.includes('uzb')) return '🇺🇿';
  if (n.includes('hon') || n.includes('hnd')) return '🇭🇳';
  if (n.includes('pan') || n.includes('pnm')) return '🇵🇦';
  if (n.includes('costa')) return '🇨🇷';
  if (n.includes('jam')) return '🇯🇲';
  if (n.includes('bosnia') || n.includes('bih')) return '🇧🇦';
  if (n.includes('congo') || n.includes('cod')) return '🇨🇩';
  return '🏳️';
}
