/** Viral share lines. Ego first. No tribunal lecture. */

export function cardShareText(input: {
  ovr: number | string | null | undefined;
  verdict?: string | null;
  fixture?: string | null;
  username?: string | null;
  firstPerson?: boolean;
}): string {
  const ovr = String(input.ovr ?? '').trim() || '—';
  const who = input.firstPerson === false && input.username
    ? `${input.username} is`
    : "I'm";
  const fixture = input.fixture?.trim() ? ` ${input.fixture.trim()}.` : '';
  const verdict = input.verdict?.trim() ? ` ${input.verdict.trim().toUpperCase()}.` : '';
  return `${who} ${ovr} OVR on BallKnowledge.${fixture}${verdict} Beat me.`;
}

export function deckShareText(input: {
  ovr: number | string | null | undefined;
  username?: string | null;
  firstPerson?: boolean;
}): string {
  const ovr = String(input.ovr ?? '').trim() || '—';
  const who = input.firstPerson === false && input.username
    ? `${input.username} is`
    : "I'm";
  return `${who} ${ovr} OVR on BallKnowledge. Come take the card.`;
}

export const SITE_TAGLINE =
  'Prove you know ball. Get the card. Make them look at your OVR.';
