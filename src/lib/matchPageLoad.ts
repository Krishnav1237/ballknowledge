/** Settles the match page so a partial API failure cannot leave the spinner up. */

export type MatchPageLoad<M extends { id: string }, T> = {
  ready: boolean;
  error: string | null;
  match: M | null;
  teams: T[];
  matchNotFound: boolean;
  warnToast: string | null;
};

export function resolveMatchPageLoad<M extends { id: string }, T>(input: {
  matchId: string;
  matches?: M[];
  teams?: T[];
  matchesPending: boolean;
  teamsPending: boolean;
  matchesError?: boolean;
  teamsError?: boolean;
}): MatchPageLoad<M, T> {
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
