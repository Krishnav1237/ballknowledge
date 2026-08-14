/**
 * Compatibility loaders used by existing API routes.
 * Live competition is Premier League 2026/27 — World Cup remote API is not used.
 */

export {
  fetchPremierLeagueMatches as fetchWorldCupMatches,
  fetchPremierLeagueTeams as fetchWorldCupTeams,
} from '@/lib/premierLeagueData';

export { getPremierLeagueClubs, getPremierLeagueMatches } from '@/lib/premierLeagueData';
