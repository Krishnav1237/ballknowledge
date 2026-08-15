import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { getPremierLeagueClubs } from './premierLeagueData';
import { getRosterForTeam, isPlayerAllowedForSlot, type Player } from './roster';
import {
  calculateHOT,
  calculateMGR,
  calculateOVR,
  calculatePRD,
  calculateRSTFromActivity,
} from './scoring';

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
