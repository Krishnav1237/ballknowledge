/** Fallback SofaScore payload when the scraper is slow or down. */

export function normalizeTeamName(name: string | undefined | null): string {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
}

export function sofaScoreMappingFitsFixture(
  mapEntry: { sofascoreHome?: string; sofascoreAway?: string; homeTeam?: string; awayTeam?: string } | null | undefined,
  fixture: { home_team_name_en?: string; away_team_name_en?: string } | null | undefined,
): boolean {
  if (!mapEntry || !fixture) return false;
  const mapHome = normalizeTeamName(mapEntry.sofascoreHome || mapEntry.homeTeam);
  const mapAway = normalizeTeamName(mapEntry.sofascoreAway || mapEntry.awayTeam);
  const home = normalizeTeamName(fixture.home_team_name_en);
  const away = normalizeTeamName(fixture.away_team_name_en);
  return Boolean(mapHome && mapAway && home && away && mapHome === home && mapAway === away);
}

export function generateFallbackData(matchId: string, mapEntry: { homeTeam?: string; awayTeam?: string } | null | undefined) {
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

export function sofaScoreFallbackResponse(matchId: string, sofascoreEventId: number, mapEntry: { homeTeam?: string; awayTeam?: string } | null | undefined) {
  return {
    success: true,
    matchId,
    sofascoreEventId,
    data: generateFallbackData(matchId, mapEntry),
    cached: false,
    fallback: true,
  };
}
