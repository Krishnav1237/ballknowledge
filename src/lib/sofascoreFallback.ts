/** Fallback SofaScore payload when the scraper is slow or down. */

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
