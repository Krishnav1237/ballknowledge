import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  getPremierLeagueClubs,
  getPremierLeagueMatches,
  PREMIER_LEAGUE_OPENING_AWAY,
  PREMIER_LEAGUE_OPENING_DATE,
  PREMIER_LEAGUE_OPENING_HOME,
} from './premierLeagueData';
import { computeLeagueTable, listMatchweeks } from './premierLeagueUtils';

test('shipped Premier League loaders expose 20 clubs and 380 fixtures', () => {
  const clubs = getPremierLeagueClubs();
  const matches = getPremierLeagueMatches();
  const names = clubs.map((club) => club.name_en);

  assert.equal(clubs.length, 20);
  assert.equal(new Set(names).size, 20);
  for (const required of ['Coventry City', 'Ipswich Town', 'Hull City']) {
    assert.ok(names.includes(required), `missing promoted club ${required}`);
  }
  for (const relegated of ['West Ham', 'Burnley', 'Wolves', 'Wolverhampton']) {
    assert.ok(!names.some((name) => name.includes(relegated)), `relegated club still present: ${relegated}`);
  }

  assert.equal(matches.length, 380);
  assert.deepEqual(listMatchweeks(matches), Array.from({ length: 38 }, (_, i) => i + 1));

  const opening = matches.find((match) => match.id === '1') ?? matches[0];
  assert.equal(opening.home_team_name_en, PREMIER_LEAGUE_OPENING_HOME);
  assert.equal(opening.away_team_name_en, PREMIER_LEAGUE_OPENING_AWAY);
  assert.equal(opening.local_date, PREMIER_LEAGUE_OPENING_DATE);
  assert.ok(opening.local_date.startsWith('08/21/2026'));

  for (const club of clubs) {
    const home = matches.filter((match) => match.home_team_id === club.id);
    const away = matches.filter((match) => match.away_team_id === club.id);
    assert.equal(home.length, 19, `${club.name_en} home count`);
    assert.equal(away.length, 19, `${club.name_en} away count`);
    assert.equal(home.length + away.length, 38, `${club.name_en} total`);
  }

  const table = computeLeagueTable(matches, clubs);
  assert.equal(table.length, 20);
  assert.ok(table.every((row) => row.played === 0 && row.points === 0));

  const clubIds = new Set(clubs.map((club) => club.id));
  const nameById = new Map(clubs.map((club) => [club.id, club.name_en]));
  const directed = new Set<string>();
  for (const match of matches) {
    assert.notEqual(match.home_team_id, match.away_team_id, `self-play ${match.id}`);
    assert.ok(clubIds.has(match.home_team_id), `orphan home ${match.id}`);
    assert.ok(clubIds.has(match.away_team_id), `orphan away ${match.id}`);
    assert.equal(match.home_team_name_en, nameById.get(match.home_team_id));
    assert.equal(match.away_team_name_en, nameById.get(match.away_team_id));
    directed.add(`${match.home_team_id}-${match.away_team_id}`);
  }
  assert.equal(directed.size, 380);
  for (const home of clubIds) {
    for (const away of clubIds) {
      if (home === away) continue;
      assert.ok(directed.has(`${home}-${away}`), `missing pair ${home} v ${away}`);
    }
  }
});

test('computeLeagueTable uses 3/1/0 from shipped match objects', () => {
  const clubs = getPremierLeagueClubs();
  const matches = getPremierLeagueMatches();
  const sample = {
    ...matches[0],
    finished: 'TRUE',
    home_score: '2',
    away_score: '0',
  };
  const table = computeLeagueTable([sample], clubs);
  const home = table.find((row) => row.teamId === sample.home_team_id);
  const away = table.find((row) => row.teamId === sample.away_team_id);
  assert.equal(home?.points, 3);
  assert.equal(home?.won, 1);
  assert.equal(away?.points, 0);
  assert.equal(away?.lost, 1);
});

test('live UI source does not advertise World Cup 2026 knockout identity', () => {
  const files = [
    'src/app/page.tsx',
    'src/app/leaderboard/page.tsx',
    'src/app/u/[username]/page.tsx',
    'src/app/football-iq/page.tsx',
    'src/app/card/[id]/page.tsx',
    'src/app/card/[id]/CardDetailClient.tsx',
    'src/app/profile/page.tsx',
    'src/components/Navbar.tsx',
    'src/app/layout.tsx',
    'src/app/premier-league/page.tsx',
    'src/app/match/[id]/page.tsx',
    'src/components/Footer.tsx',
    'src/lib/shareCopy.ts',
    'src/lib/matchday.ts',
    'src/components/GameBoard.tsx',
  ];
  const banned = [
    /WORLD CUP 2026/i,
    /ROUND OF 32 · 32 NATIONS/,
    /Pick your nation/,
    /32 nations who qualified/,
    /The Tournament is Active/,
    /WORLD CUP 2026 DOSSIER/,
    /2026 tournament/,
    /Argentina vs France/,
    /National Allegiance/,
    /Supporting Country/,
    /TOURNAMENT DECK/,
    /FULL TOURNAMENT DECK/,
    /Tournament Deck/,
    /Tournament Manager/,
    /Overall Tournament/,
    /world_cup_stadium/,
    /world_cup_hub_bg/,
    /AI FIFA Card/,
    /AI VAR Tribunal/i,
    /Reputation Arena/i,
    /Locker Room Login/,
    /Stockley Park/,
    /35% PRD/,
    /Portugal will secure/,
    /VAR Tribunal: Grade Match/,
    /Can you beat my Football IQ/,
    /Check out my VAR Verdict Card/,
    /Editor's Desk/,
    /ACCESS GATE/,
    /Enter Premier League Hub/,
  ];
  for (const rel of files) {
    const text = readFileSync(join(process.cwd(), rel), 'utf8');
    for (const pattern of banned) {
      assert.equal(pattern.test(text), false, `${rel} still matches ${pattern}`);
    }
  }
});
