import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { getPremierLeagueClubs, getPremierLeagueMatches } from './premierLeagueData';
import { getMatchClockStatus, parseLocalDate } from './matchUtils';
import { getRosterForTeam, isPlayerAllowedForSlot, type Player } from './roster';
import {
  calculateHOT,
  calculateMGR,
  calculateOVR,
  calculatePRD,
  calculateRSTFromActivity,
} from './scoring';
import { cardShareText, deckShareText } from './shareCopy';
import { listMatchQueue, matchActionLabel, pickFeaturedMatch } from './matchday';

const FORMATION_SLOTS = ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'CDM', 'RCM', 'LW', 'ST', 'RW'] as const;

function legalLineup(players: Player[]): Record<string, Player> {
  const used = new Set<string>();
  const lineup: Record<string, Player> = {};
  for (const slot of FORMATION_SLOTS) {
    const pick = players.find((player) => isPlayerAllowedForSlot(player, slot) && !used.has(player.name));
    assert.ok(pick, `no eligible player for ${slot}`);
    used.add(pick.name);
    lineup[slot] = pick;
  }
  return lineup;
}

test('shipped match clock status uses fixture kickoff from the live loaders', () => {
  const opening = getPremierLeagueMatches().find((match) => match.id === '1');
  assert.ok(opening);
  const kickoff = parseLocalDate(opening.local_date, opening.stadium_id).getTime();
  assert.equal(getMatchClockStatus(opening, kickoff - 1), 'UPCOMING');
  assert.equal(getMatchClockStatus({ ...opening, finished: 'FALSE' }, kickoff + 1), 'LIVE');
  assert.equal(getMatchClockStatus({ ...opening, finished: 'TRUE' }, kickoff + 1), 'COMPLETED');
  assert.equal(getMatchClockStatus({ ...opening, finished: 'FALSE' }, kickoff + 3 * 60 * 60 * 1000), 'COMPLETED');
});

test('every live club roster fills a legal 4-3-3 and rejects illegal slots', () => {
  const clubs = getPremierLeagueClubs();
  assert.equal(clubs.length, 20);

  for (const club of clubs) {
    const roster = getRosterForTeam(club.name_en, club.flag);
    assert.ok(roster.length >= 11, `${club.name_en} roster size`);
    const lineup = legalLineup(roster);
    assert.equal(Object.keys(lineup).length, 11);

    const striker = lineup.ST;
    assert.equal(isPlayerAllowedForSlot(striker, 'ST'), true);
    assert.equal(isPlayerAllowedForSlot(striker, 'GK'), false);
    const keeper = lineup.GK;
    assert.equal(isPlayerAllowedForSlot(keeper, 'LW'), false);
  }
});

test('shipped scoring returns finite PRD and OVR on a representative prediction', () => {
  const clubs = getPremierLeagueClubs();
  const home = clubs.find((club) => club.name_en === 'Arsenal');
  const away = clubs.find((club) => club.name_en === 'Coventry City');
  assert.ok(home && away);

  const homeRoster = getRosterForTeam(home.name_en, home.flag);
  const lineup = legalLineup(homeRoster);
  lineup.ST = { ...lineup.ST, isCaptain: true };

  const accurate = calculatePRD({
    predHome: 2,
    predAway: 1,
    actualHome: 2,
    actualAway: 1,
    predMotm: lineup.RW.name,
    actualMotm: lineup.RW.name,
    predScorer: lineup.ST.name,
    actualScorer: lineup.ST.name,
    actualScorers: [lineup.ST.name],
    homeTeamName: home.name_en,
    awayTeamName: away.name_en,
  });
  const missed = calculatePRD({
    predHome: 0,
    predAway: 3,
    actualHome: 2,
    actualAway: 1,
    predMotm: 'Nobody',
    actualMotm: lineup.RW.name,
    predScorer: 'Nobody',
    actualScorer: lineup.ST.name,
    actualScorers: [lineup.ST.name],
    homeTeamName: home.name_en,
    awayTeamName: away.name_en,
  });

  assert.equal(Number.isFinite(accurate), true);
  assert.equal(Number.isFinite(missed), true);
  assert.ok(accurate >= 0 && accurate <= 100);
  assert.ok(missed >= 0 && missed <= 100);
  assert.ok(accurate > missed);

  const mgr = calculateMGR(lineup, {});
  const hot = calculateHOT([{ grade: 'CORRECT', confidence: 3 }]);
  const rst = calculateRSTFromActivity(2, 1);
  const ovr = calculateOVR(accurate, mgr, hot, rst);
  const worseOvr = calculateOVR(missed, mgr, hot, rst);

  assert.equal(Number.isFinite(mgr), true);
  assert.equal(Number.isFinite(hot), true);
  assert.equal(Number.isFinite(rst), true);
  assert.equal(Number.isFinite(ovr), true);
  assert.ok(mgr >= 0 && mgr <= 99);
  assert.ok(hot >= 0 && hot <= 100);
  assert.ok(rst >= 0 && rst <= 100);
  assert.ok(ovr >= 1 && ovr <= 99);
  assert.ok(ovr > worseOvr);
});

test('primary pages stay on the dark shell and Navbar points at live destinations', () => {
  const shells = [
    'src/app/page.tsx',
    'src/app/premier-league/page.tsx',
    'src/app/match/[id]/page.tsx',
    'src/app/leaderboard/page.tsx',
    'src/app/football-iq/page.tsx',
    'src/app/profile/page.tsx',
  ];
  const lightShell = /\b(?:bg-white(?!\/)|bg-slate-50|text-gray-900)\b/;
  for (const rel of shells) {
    const text = readFileSync(join(process.cwd(), rel), 'utf8');
    assert.equal(lightShell.test(text), false, `${rel} still has a light product shell class`);
    assert.match(text, /#030712|#0B0F19|#0A0A0A|bg-background/);
  }

  const nav = readFileSync(join(process.cwd(), 'src/components/Navbar.tsx'), 'utf8');
  for (const href of ['href="/"', 'href: \'/premier-league\'', 'href: \'/leaderboard\'', 'href: \'/football-iq\'', 'href: \'/profile\'']) {
    assert.ok(nav.includes(href), `Navbar missing ${href}`);
  }

  const matchPage = readFileSync(join(process.cwd(), 'src/app/match/[id]/page.tsx'), 'utf8');
  assert.match(matchPage, /MatchLiveChat/);
  assert.match(matchPage, /getRosterForTeam/);
  assert.match(matchPage, /isPlayerAllowedForSlot/);
});

test('share copy flexes OVR and dares the reader', () => {
  const mine = cardShareText({ ovr: 94, verdict: 'legendary', fixture: 'Arsenal vs Coventry 2-0' });
  assert.equal(mine, "I'm 94 OVR on BallKnowledge. Arsenal vs Coventry 2-0. LEGENDARY. Beat me.");

  const theirs = cardShareText({
    ovr: 88,
    verdict: 'knows ball',
    username: 'Chef',
    firstPerson: false,
  });
  assert.equal(theirs, 'Chef is 88 OVR on BallKnowledge. KNOWS BALL. Beat me.');

  assert.equal(deckShareText({ ovr: 91 }), "I'm 91 OVR on BallKnowledge. Come take the card.");
});

test('matchday HQ picks live first, then next kickoff', () => {
  const opening = getPremierLeagueMatches().find((match) => match.id === '1');
  assert.ok(opening);
  const kickoff = parseLocalDate(opening.local_date, opening.stadium_id).getTime();
  const slate = getPremierLeagueMatches().slice(0, 8);

  const before = pickFeaturedMatch(slate, kickoff - 1);
  assert.equal(before?.id, '1');

  const live = pickFeaturedMatch(slate, kickoff + 1);
  assert.equal(live?.id, '1');

  const queue = listMatchQueue(slate, '1', kickoff - 1, 3);
  assert.equal(queue.length, 3);
  assert.ok(queue.every((match) => match.id !== '1'));
  assert.equal(matchActionLabel('UPCOMING', false), 'Enter match');
  assert.equal(matchActionLabel('LIVE', false), 'Enter live');
});

test('home boots into matchday instead of a sales landing', () => {
  const home = readFileSync(join(process.cwd(), 'src/app/page.tsx'), 'utf8');
  assert.doesNotMatch(home, /THE LOOP/);
  assert.doesNotMatch(home, /Ride or die/);
  assert.doesNotMatch(home, /HOW IT WORKS/);
  assert.doesNotMatch(home, /landingData/);
  assert.match(home, /pickFeaturedMatch/);
  assert.match(home, /\/match\//);
});
