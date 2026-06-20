/**
 * Shared match utilities — single source of truth.
 * Previously copy-pasted across match/[id]/page.tsx, world-cup-hub/page.tsx,
 * u/[username]/page.tsx, and api/resolve-match/route.ts.
 */

function getStadiumUTCOffset(stadiumId?: string): number {
  if (!stadiumId) return -4; // Default to EDT (New York)
  switch (stadiumId.trim()) {
    // Eastern Daylight Time (EDT / UTC-4)
    case '7':  // Atlanta
    case '8':  // Miami
    case '9':  // Boston
    case '10': // Philadelphia
    case '11': // New York/New Jersey
    case '12': // Toronto
      return -4;

    // Central Daylight Time (CDT / UTC-5)
    case '4':  // Dallas
    case '5':  // Houston
    case '6':  // Kansas City
      return -5;

    // Mexico Central Standard Time (CST / UTC-6)
    case '1':  // Mexico City
    case '2':  // Guadalajara
    case '3':  // Monterrey
      return -6;

    // Pacific Daylight Time (PDT / UTC-7)
    case '13': // Vancouver
    case '14': // Seattle
    case '15': // San Francisco
    case '16': // Los Angeles
      return -7;

    default:
      return -4;
  }
}

/**
 * Parses a date string in the format "MM/DD/YYYY HH:MM" (stadium local time, no timezone)
 * into a JavaScript Date object resolved to the correct absolute UTC moment.
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
 * Helper to check if two dates fall on the same UTC calendar day.
 * Eliminates client/server timezone hydration mismatches.
 */
export function isSameUTCDate(d1: Date, d2: Date): boolean {
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
         d1.getUTCMonth() === d2.getUTCMonth() &&
         d1.getUTCDate() === d2.getUTCDate();
}

/**
 * Derives a deterministic (fake) match result from the match ID and team names.
 * Used for completed matches until real results are integrated from the data source.
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

  const hasRealScores = match && 
                        match.home_score !== 'null' && 
                        match.home_score !== undefined &&
                        match.away_score !== 'null' && 
                        match.away_score !== undefined &&
                        match.time_elapsed !== 'notstarted';

  if (hasRealScores) {
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

    let hash = 0;
    const str = matchId + homeTeamName + awayTeamName;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    if (allGoals.length > 0) {
      firstGoalscorer = allGoals[0].player;
      motm = allGoals[Math.abs(hash % allGoals.length)].player;
    } else if (homeScore === 0 && awayScore === 0) {
      firstGoalscorer = 'None';
      motm = 'Goalkeeper';
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
 * Maps a country name to a Unicode flag emoji.
 * Used in pages that render flag emojis (profile card preview, FUT card, etc.)
 * where the CDN FlagImage component is not appropriate (SVG canvas context).
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
  if (n.includes('uru')) return '🇺🇾';
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
  if (n.includes('wal') || n.includes('wales')) return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
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
