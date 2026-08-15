/** Settles the match page so a partial API failure cannot leave the spinner up. */

export type MatchPageRecord = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  local_date: string;
  finished: string;
  stadium_id: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
};

export type TeamPageRecord = {
  id: string;
  name_en: string;
  flag: string;
  fifa_code?: string;
  groups?: string;
};

export type MatchPageLoad = {
  ready: boolean;
  error: string | null;
  match: MatchPageRecord | null;
  teams: TeamPageRecord[];
  matchNotFound: boolean;
  warnToast: string | null;
};

export function resolveMatchPageLoad(input: {
  matchId: string;
  matches?: MatchPageRecord[];
  teams?: TeamPageRecord[];
  matchesPending: boolean;
  teamsPending: boolean;
  matchesError?: boolean;
  teamsError?: boolean;
}): MatchPageLoad {
  if (input.matchesPending || input.teamsPending) {
    return {
      ready: false,
      error: null,
      match: null,
      teams: [],
      matchNotFound: false,
      warnToast: null,
    };
  }

  if (!input.matches || input.matchesError) {
    return {
      ready: true,
      error: 'Failed to fetch real-time match details. Please verify your internet connection.',
      match: null,
      teams: [],
      matchNotFound: false,
      warnToast: null,
    };
  }

  const match = input.matches.find((item) => item.id === input.matchId) || null;
  return {
    ready: true,
    error: null,
    match,
    teams: input.teams || [],
    matchNotFound: !match,
    warnToast: input.teamsError || !input.teams
      ? 'Connection interrupted. Viewing offline match cache.'
      : null,
  };
}
