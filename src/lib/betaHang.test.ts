import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { anonymousAuthBody, getSessionFromRequest } from './authSession';
import { chatListOrDegraded, serializeChatMessages } from './chatList';
import { resolveMatchPageLoad } from './matchPageLoad';
import { getPremierLeagueMatches, getPremierLeagueClubs } from './premierLeagueData';
import { firstResolved } from './requestBounds';
import { gradeWithFallback, heuristicGradeHotTake } from './scoring';
import { generateFallbackData, sofaScoreFallbackResponse, sofaScoreMappingFitsFixture } from './sofascoreFallback';

test('grading still produces a finite result when LLM callers reject', async () => {
  const result = await gradeWithFallback(
    'Arsenal will control the opening night at the Emirates',
    [
      () => Promise.reject(new Error('openrouter down')),
      () => Promise.reject(new Error('groq down')),
      () => Promise.reject(new Error('nvidia down')),
    ],
    50,
  );
  const heuristic = heuristicGradeHotTake('Arsenal will control the opening night at the Emirates');
  assert.equal(Number.isFinite(result.ovr), true);
  assert.ok(result.ovr >= 1 && result.ovr <= 99);
  assert.ok(result.grade);
  assert.equal(result.grade, heuristic.grade);
  assert.equal(result.ovr, heuristic.ovr);
});

test('chat list still returns messages when the bot helper throws', async () => {
  const existing = serializeChatMessages([
    {
      id: 'm1',
      matchId: '1',
      text: 'What a ball from Saka',
      createdAt: Date.now(),
      profile: { username: 'TacticalMaster' },
    },
  ]);

  const body = await chatListOrDegraded(async () => {
    try {
      await Promise.reject(new Error('bot down'));
    } catch {
      // banter inject failed; list still ships
    }
    return existing;
  });

  assert.equal(body.success, true);
  assert.equal(Array.isArray(body.messages), true);
  assert.equal(body.messages.length, 1);
  assert.equal(body.messages[0].author, 'TacticalMaster');
});

test('chat list degrades to an empty messages array when the loader throws', async () => {
  const body = await chatListOrDegraded(async () => {
    throw new Error('db down');
  });
  assert.equal(body.success, true);
  assert.equal(body.degraded, true);
  assert.equal(Array.isArray(body.messages), true);
  assert.equal(body.messages.length, 0);
});

test('SofaScore GET fallback is JSON when the scraper fails', () => {
  const fallback = generateFallbackData('1', { homeTeam: 'Arsenal', awayTeam: 'Coventry City' });
  const payload = sofaScoreFallbackResponse('1', 15186710, { homeTeam: 'Arsenal', awayTeam: 'Coventry City' });
  assert.equal(fallback.isFallback, true);
  assert.equal(fallback.homeTeam, 'Arsenal');
  assert.equal(payload.success, true);
  assert.equal(payload.fallback, true);
  assert.equal(payload.data.isFallback, true);
  assert.equal(JSON.parse(JSON.stringify(payload)).matchId, '1');
});

test('World Cup SofaScore map rows do not attach to Premier League fixtures', () => {
  const opening = getPremierLeagueMatches().find((match) => match.id === '1');
  assert.ok(opening);
  assert.equal(
    sofaScoreMappingFitsFixture({ sofascoreHome: 'Mexico', sofascoreAway: 'South Africa' }, opening),
    false,
  );
  assert.equal(
    sofaScoreMappingFitsFixture({ sofascoreHome: 'Arsenal', sofascoreAway: 'Coventry City' }, opening),
    true,
  );
});

test('malformed session cookie does not throw and auth GET degrades', () => {
  const request = new Request('http://localhost/api/auth', {
    headers: { cookie: 'bk_session=%' },
  });
  assert.equal(getSessionFromRequest(request), null);
  assert.doesNotThrow(() => getSessionFromRequest(request));

  const degraded = anonymousAuthBody(true);
  assert.equal(degraded.success, true);
  assert.equal(degraded.authenticated, false);
  assert.equal(degraded.profile, null);
  assert.equal(degraded.degraded, true);

  const authRoute = readFileSync(join(process.cwd(), 'src/app/api/auth/route.ts'), 'utf8');
  assert.match(authRoute, /anonymousAuthBody\(true\)/);

  const catalog = readFileSync(join(process.cwd(), 'src/lib/leagueCatalog.ts'), 'utf8');
  assert.match(catalog, /fetchWithTimeout/);
  assert.match(catalog, /\/api\/leaderboard/);

  const resolveMatch = readFileSync(join(process.cwd(), 'src/app/api/resolve-match/route.ts'), 'utf8');
  assert.equal(resolveMatch.includes('localhost:3000'), false);
  assert.equal(resolveMatch.includes('/api/sofascore-sync'), false);
});

test('firstResolved returns the fallback instead of hanging', async () => {
  const hanging = new Promise<string>(() => {});
  const started = Date.now();
  const value = await firstResolved(hanging, 40, 'fallback');
  const elapsed = Date.now() - started;
  assert.equal(value, 'fallback');
  assert.ok(elapsed < 500, `firstResolved waited ${elapsed}ms`);
});

test('match page leaves the spinner when teams fail after matches succeed', () => {
  const matches = getPremierLeagueMatches();
  const clubs = getPremierLeagueClubs();
  const opening = matches.find((match) => match.id === '1');
  assert.ok(opening);

  const pending = resolveMatchPageLoad({
    matchId: '1',
    matches,
    matchesPending: false,
    teamsPending: true,
    teamsError: false,
  });
  assert.equal(pending.ready, false);
  assert.equal(pending.match, null);
  assert.equal(pending.error, null);

  const teamsFailed = resolveMatchPageLoad({
    matchId: '1',
    matches,
    matchesPending: false,
    teamsPending: false,
    matchesError: false,
    teamsError: true,
  });
  assert.equal(teamsFailed.ready, true);
  assert.equal(teamsFailed.error, null);
  assert.equal(teamsFailed.match?.id, opening.id);
  assert.equal(teamsFailed.match?.home_team_name_en, opening.home_team_name_en);
  assert.equal(teamsFailed.matchNotFound, false);
  assert.ok(teamsFailed.warnToast);

  const bothFailed = resolveMatchPageLoad({
    matchId: '1',
    matchesPending: false,
    teamsPending: false,
    matchesError: true,
    teamsError: true,
  });
  assert.equal(bothFailed.ready, true);
  assert.ok(bothFailed.error);
  assert.equal(bothFailed.match, null);

  const ok = resolveMatchPageLoad({
    matchId: '1',
    matches,
    teams: clubs,
    matchesPending: false,
    teamsPending: false,
    matchesError: false,
    teamsError: false,
  });
  assert.equal(ok.ready, true);
  assert.equal(ok.error, null);
  assert.equal(ok.match?.id, opening.id);
  assert.equal(ok.teams.length, clubs.length);
  assert.equal(ok.warnToast, null);

  const page = readFileSync(join(process.cwd(), 'src/app/match/[id]/page.tsx'), 'utf8');
  assert.match(page, /resolveMatchPageLoad/);
  assert.match(page, /matchesQuery\.isPending/);
  assert.match(page, /teamsQuery\.isPending/);
  assert.match(page, /matchesQuery\.isError/);
  assert.match(page, /teamsQuery\.isError/);
  assert.match(page, /teamsError:/);
  assert.match(page, /const match = load\.match/);
  assert.match(page, /if \(load\.error\)/);
  assert.match(page, /if \(!load\.ready \|\| !match\)/);
});
