/**
 * Shared match utilities — single source of truth.
 * Previously copy-pasted across match/[id]/page.tsx, world-cup-hub/page.tsx,
 * u/[username]/page.tsx, and api/resolve-match/route.ts.
 */

/**
 * Parses a date string in the format "MM/DD/YYYY HH:MM" (local time, no timezone)
 * into a JavaScript Date object in the browser/server's local timezone.
 */
export function parseLocalDate(localDateStr: string): Date {
  const [datePart, timePart] = localDateStr.split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * Derives a deterministic (fake) match result from the match ID and team names.
 * Used for completed matches until real results are integrated from the data source.
 */
export function getDeterministicMatchResult(
  matchId: string,
  homeTeamName: string,
  awayTeamName: string
) {
  let hash = 0;
  const str = matchId + homeTeamName + awayTeamName;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const homeScore = Math.abs((hash >> 4) % 4); // 0–3
  const awayScore = Math.abs((hash >> 8) % 3); // 0–2

  const scorers = [
    'Messi', 'Mbappe', 'Ronaldo', 'Bellingham', 'Vinicius',
    'Kane', 'Musiala', 'Yamal', 'Haaland', 'Griezmann',
  ];
  const firstGoalscorer = scorers[Math.abs(hash % scorers.length)];
  const motm = scorers[Math.abs((hash >> 2) % scorers.length)];
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
  return '🏳️';
}
