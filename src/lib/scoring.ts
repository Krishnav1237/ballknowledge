/**
 * Shipped PRD / MGR / HOT / RST / OVR formulas.
 * resolve-match imports these — do not duplicate the math in routes or tests.
 */

import { TEAM_ROSTERS } from '@/lib/roster';
import { GRADE_DEADLINE_MS } from '@/lib/requestBounds';

const PLAYER_RATING_MAP: Record<string, number> = {
  'l. messi': 9.5, 'messi': 9.5,
  'cristiano ronaldo': 9.2, 'ronaldo': 9.2,
  'k. mbappe': 9.3, 'mbappe': 9.3,
  'vinicius jr': 9.1, 'vinicius': 9.1,
  'erling haaland': 9.2, 'haaland': 9.2,
  'jude bellingham': 8.9, 'bellingham': 8.9,
  'rodri': 8.8,
  'bukayo saka': 8.5, 'saka': 8.5,
  'harry kane': 8.7, 'kane': 8.7,
  'r. lewandowski': 8.6, 'lewandowski': 8.6,
  'lautaro martinez': 8.5, 'martinez': 8.2,
  'virgil van dijk': 8.4, 'van dijk': 8.4,
  'bruno fernandes': 8.3, 'b. fernandes': 8.3,
  'bernardo silva': 8.3, 'casemiro': 8.2,
  'declan rice': 8.1, 'rice': 8.1,
  'cole palmer': 8.3, 'palmer': 8.3,
  'v. gyokeres': 8.5, 'gyokeres': 8.5,
  'a. isak': 8.2, 'isak': 8.2,
  'marquinhos': 7.9, 'alisson': 8.0,
  'thibaut courtois': 8.0, 'courtois': 8.0,
  'pedri': 8.5, 'gavi': 8.0,
  'phil foden': 8.2, 'foden': 8.2,
  'rafael leao': 8.0, 'leao': 8.0,
};

const CONFIDENCE_MULTIPLIER: Record<number, number> = {
  1: 0.80, 2: 0.90, 3: 1.00, 4: 1.10, 5: 1.20,
};

function getPlayerRating(playerName: string): number {
  const lower = playerName.toLowerCase().trim();
  for (const [key, rating] of Object.entries(PLAYER_RATING_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return rating;
  }
  return 7.0;
}

function getPlayerTeamGlobal(playerName: string): string | null {
  const lower = playerName.toLowerCase().trim();
  if (!lower || lower === 'none') return null;

  for (const [teamName, roster] of Object.entries(TEAM_ROSTERS)) {
    const found = roster.some(p => {
      const pName = p.name.toLowerCase().trim();
      return pName === lower || pName.includes(lower) || lower.includes(pName);
    });
    if (found) return teamName;
  }
  return null;
}

function getPlayerTeamName(playerName: string, homeTeam: string, awayTeam: string): string | null {
  const team = getPlayerTeamGlobal(playerName);
  if (team) return team;

  const lowerName = playerName.toLowerCase().trim();
  const lowerHome = homeTeam.toLowerCase().trim();
  const lowerAway = awayTeam.toLowerCase().trim();

  if (lowerName.includes(lowerHome)) return homeTeam;
  if (lowerName.includes(lowerAway)) return awayTeam;

  return null;
}

function isStrongPlayer(playerName: string): boolean {
  const rating = getPlayerRating(playerName);
  if (rating >= 8.2) return true;

  const lower = playerName.toLowerCase().trim();
  for (const roster of Object.values(TEAM_ROSTERS)) {
    for (const p of roster) {
      const pName = p.name.toLowerCase().trim();
      if (pName === lower || pName.includes(lower) || lower.includes(pName)) {
        if (p.rating >= 82) return true;
      }
    }
  }

  return false;
}

function getPlayerRatingFromRoster(playerName: string): number {
  const lower = playerName.toLowerCase().trim();

  for (const [key, rating] of Object.entries(PLAYER_RATING_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return rating;
  }

  for (const roster of Object.values(TEAM_ROSTERS)) {
    for (const p of roster) {
      const pName = p.name.toLowerCase().trim();
      if (pName === lower || pName.includes(lower) || lower.includes(pName)) {
        return p.rating / 10;
      }
    }
  }

  return 7.0;
}

function getTakeBaseScore(grade: string): number {
  if (grade === 'CORRECT')           return 100;
  if (grade === 'PARTIALLY_CORRECT') return  50;
  return 0;
}

export function calculatePRD(params: {
  predHome: number; predAway: number;
  actualHome: number; actualAway: number;
  predMotm: string; actualMotm: string;
  predScorer: string; actualScorer: string;
  actualScorers: string[];
  homeTeamName: string;
  awayTeamName: string;
}): number {
  const { predHome, predAway, actualHome, actualAway, predMotm, actualMotm, predScorer, actualScorer, actualScorers, homeTeamName, awayTeamName } = params;

  const predOutcome   = predHome   > predAway   ? 1 : predHome   < predAway   ? -1 : 0;
  const actualOutcome = actualHome > actualAway ? 1 : actualHome < actualAway ? -1 : 0;
  let outcomePoints: number;
  if (predOutcome === actualOutcome) {
    outcomePoints = predOutcome === 0 ? 35 : 30;
  } else {
    outcomePoints = 0;
  }

  const homeDiff   = Math.abs(predHome - actualHome);
  const homePoints = homeDiff === 0 ? 15 : homeDiff === 1 ? 10 : homeDiff === 2 ? 5 : 0;

  const awayDiff   = Math.abs(predAway - actualAway);
  const awayPoints = awayDiff === 0 ? 15 : awayDiff === 1 ? 10 : awayDiff === 2 ? 5 : 0;

  let motmPoints = 0;
  const pm = (predMotm || '').toLowerCase().trim();
  const am = (actualMotm || '').toLowerCase().trim();
  if (pm && pm !== 'none') {
    if (am === 'none' || am === '') {
      motmPoints = 0;
    } else if (pm === am || am.includes(pm) || pm.includes(am)) {
      motmPoints = 20;
    } else {
      const predTeam   = getPlayerTeamName(predMotm, homeTeamName, awayTeamName);
      const actualTeam = getPlayerTeamName(actualMotm, homeTeamName, awayTeamName);
      if (predTeam && actualTeam && predTeam === actualTeam) {
        motmPoints = isStrongPlayer(predMotm) ? 12 : 7;
      } else {
        motmPoints = 0;
      }
    }
  } else if (!pm || pm === 'none') {
    motmPoints = (am === 'none' || am === '') ? 20 : 0;
  }

  let scorerPoints = 0;
  const ps = (predScorer || '').toLowerCase().trim();
  const as = (actualScorer || '').toLowerCase().trim();
  const allScorersLower = actualScorers.map(s => s.toLowerCase());

  if (ps && ps !== 'none') {
    if (as === 'none' || as === '') {
      scorerPoints = 0;
    } else if (ps === as || as.includes(ps) || ps.includes(as)) {
      scorerPoints = 15;
    } else {
      const predTeam   = getPlayerTeamName(predScorer, homeTeamName, awayTeamName);
      const actualTeam = getPlayerTeamName(actualScorer, homeTeamName, awayTeamName);
      if (predTeam && actualTeam && predTeam === actualTeam) {
        const scoredLater = allScorersLower.some(s => s.includes(ps) || ps.includes(s));
        scorerPoints = scoredLater ? 10 : isStrongPlayer(predScorer) ? 5 : 0;
      } else {
        scorerPoints = 0;
      }
    }
  } else if (!ps || ps === 'none') {
    scorerPoints = (as === 'none' || as === '') ? 15 : 0;
  }

  return Math.max(0, Math.min(100, outcomePoints + homePoints + awayPoints + motmPoints + scorerPoints));
}

export function calculateMGR(
  lineup: Record<string, any>,
  playerMatchRatings: Record<string, number>,
  hasRealSofaScoreData = false
): number {
  const players = Object.values(lineup).filter(p => p && p.name);
  if (!players.length) return 50;

  const normRatings: Record<string, number> = {};
  for (const [k, v] of Object.entries(playerMatchRatings)) {
    normRatings[k.toLowerCase().trim()] = v;
  }

  let sumScore   = 0;
  let totalWeight = 0;

  for (const p of players) {
    const pNorm = p.name.toLowerCase().trim();

    let rawRating: number | undefined =
      normRatings[pNorm] ??
      Object.entries(normRatings).find(([k]) => pNorm.includes(k) || k.includes(pNorm))?.[1];

    if (rawRating === undefined) {
      rawRating = getPlayerRatingFromRoster(p.name);
    }

    let score: number;
    if (hasRealSofaScoreData) {
      score = Math.round(Math.max(0, Math.min(99, ((rawRating - 6.0) / 4.0) * 99)));
    } else {
      score = Math.round(Math.max(30, Math.min(90, ((rawRating - 6.0) / 3.5) * 60 + 30)));
    }

    const weight = p.isCaptain ? 2.0 : p.isViceCaptain ? 1.5 : 1.0;
    sumScore    += score * weight;
    totalWeight += weight;
  }

  return Math.max(0, Math.min(99, Math.round(sumScore / totalWeight)));
}

export function calculateHOT(gradedTakes: Array<{ grade: string; confidence: number }>): number {
  if (!gradedTakes.length) return 50;
  const values = gradedTakes.map(t => {
    const base = getTakeBaseScore(t.grade);
    const conf = Math.max(1, Math.min(5, t.confidence));
    const multiplier = CONFIDENCE_MULTIPLIER[conf] ?? 1.0;
    return base * multiplier;
  });
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.max(0, Math.min(100, Math.round(avg)));
}

export function calculateRSTFromActivity(messageCount: number, upvotes: number): number {
  const raw = Math.sqrt(messageCount * 8 + upvotes * 4) * 10;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function calculateOVR(prd: number, mgr: number, hot: number, rst: number): number {
  const raw = (0.35 * prd) + (0.25 * mgr) + (0.25 * hot) + (0.15 * rst);
  return Math.max(1, Math.min(99, Math.round(raw)));
}

export type HotTakeGrade = {
  grade: string;
  ovr: number;
  verdict: string;
  charge: string;
  sentence: string;
};

export function heuristicGradeHotTake(statement: string): HotTakeGrade {
  const lower = statement.toLowerCase().trim();
  const isElite = lower.includes('messi') || lower.includes('best world cup') || lower.includes('greatest');
  const isDelusion = lower.includes('antony') || lower.includes('maguire') || lower.length < 10;
  const ovr = isElite ? 85 : isDelusion ? 20 : 55;
  return {
    grade: isElite ? 'CORRECT' : isDelusion ? 'INCORRECT' : 'PARTIALLY_CORRECT',
    ovr,
    verdict: isElite ? 'CERTIFIED COOKING' : isDelusion ? 'SUPREME DELUSION' : 'MID TAKE GRADED',
    charge: 'Local heuristic tribunal verdict.',
    sentence: isDelusion ? 'Banned from tactical discussions for 48 hours.' : 'Sentenced to watch more football.',
  };
}

export async function gradeWithFallback(
  statement: string,
  callers: Array<() => Promise<HotTakeGrade>>,
  deadlineMs = GRADE_DEADLINE_MS,
): Promise<HotTakeGrade> {
  const deadlineAt = Date.now() + deadlineMs;
  for (const caller of callers) {
    const remaining = deadlineAt - Date.now();
    if (remaining <= 0) break;
    try {
      return await Promise.race([
        caller(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('grade deadline')), remaining);
        }),
      ]);
    } catch {
      continue;
    }
  }
  return heuristicGradeHotTake(statement);
}
