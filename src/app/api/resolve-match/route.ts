import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { fetchWorldCupMatches, fetchWorldCupTeams } from '@/lib/worldcupData';
import { getDeterministicMatchResult, getPlayerMatchRatings } from '@/lib/matchUtils';
import { TEAM_ROSTERS } from '@/lib/roster';
import { requireSession } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

// ─── AI Grading Prompt ────────────────────────────────────────────────────────
/**
 * System prompt instructing the LLM to grade a user's hot take.
 * Demands a structured JSON output with OVR grading, funny title (verdict),
 * specific bias charge, and humorous punishment (sentence).
 */
const EVALUATE_TAKE_PROMPT = `You are the Stockley Park VAR Grader. Evaluate this football hot take.

Determine if the statement is:
- CORRECT: Visionary, genuinely insightful, or factually sound take (75-99 OVR)
- PARTIALLY_CORRECT: Has some merit but also flawed/debatable (36-74 OVR)
- INCORRECT: Delusional, factually wrong, or hilariously bad take (1-35 OVR)

Return ONLY valid JSON:
{
  "grade": "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT",
  "ovr": number (1-99),
  "verdict": "string (funny meme title, e.g. 'CERTIFIED COOKING', 'DELUSION MERCHANT', 'TACTICAL FRAUD')",
  "charge": "string (brief description of the bias or delusion)",
  "sentence": "string (funny football punishment)"
}

Be direct, cynical, and funny. One sentence max for charge and sentence.`;

// ─── AI Caller Chain ─────────────────────────────────────────────────────────

/**
 * Invokes OpenRouter API using llama-3.3-70b-instruct.
 * Primary choice for grading hot takes.
 * 
 * @param {string} userPrompt - User hot take prompt.
 * @returns {Promise<Object>} JSON response containing the LLM grade.
 */
function cleanAndParseJSON(rawContent: string) {
  let cleaned = rawContent.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

function parseAndNormalizeGrading(rawContent: string): { grade: string; ovr: number; verdict: string; charge: string; sentence: string } {
  const result = cleanAndParseJSON(rawContent);
  
  let ovr = Number(result.ovr || result.overall || 50);
  if (isNaN(ovr)) ovr = 50;
  ovr = Math.max(1, Math.min(99, Math.round(ovr)));

  let grade = String(result.grade || '').toUpperCase().trim();
  if (grade !== 'CORRECT' && grade !== 'PARTIALLY_CORRECT' && grade !== 'INCORRECT') {
    grade = ovr >= 75 ? 'CORRECT' : ovr >= 36 ? 'PARTIALLY_CORRECT' : 'INCORRECT';
  }

  return {
    grade,
    ovr,
    verdict: String(result.verdict || 'MID TAKE GRADED').trim(),
    charge: String(result.charge || 'VAR reviewed details.').trim(),
    sentence: String(result.sentence || 'Sentenced to watch more football.').trim()
  };
}

/**
 * Invokes OpenRouter API using llama-3.3-70b-instruct.
 * Primary choice for grading hot takes.
 * 
 * @param {string} userPrompt - User hot take prompt.
 * @returns {Promise<Object>} JSON response containing the LLM grade.
 */
async function callOpenRouter(userPrompt: string) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('No OpenRouter key');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.live',
      'X-Title': 'BallKnowledge World Cup 2026',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: EVALUATE_TAKE_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 256,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error('OpenRouter failed');
  const data = await response.json();
  return parseAndNormalizeGrading(data.choices[0].message.content);
}

/**
 * Invokes Groq API using llama-3.3-70b-specdec.
 * First fallback choice if OpenRouter is rate-limited or fails.
 * 
 * @param {string} userPrompt - User hot take prompt.
 * @returns {Promise<Object>} JSON response containing the LLM grade.
 */
async function callGroq(userPrompt: string) {
  if (!process.env.GROQ_API_KEY) throw new Error('No Groq key');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-specdec',
      messages: [
        { role: 'system', content: EVALUATE_TAKE_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 256,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Groq failed');
  const data = await response.json();
  return parseAndNormalizeGrading(data.choices[0].message.content);
}

/**
 * Invokes Nvidia NIM API using llama-3.1-70b-instruct.
 * Second fallback choice if both OpenRouter and Groq fail.
 * 
 * @param {string} userPrompt - User hot take prompt.
 * @returns {Promise<Object>} JSON response containing the LLM grade.
 */
async function callNvidia(userPrompt: string) {
  if (!process.env.NVIDIA_API_KEY) throw new Error('No Nvidia key');
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [
        { role: 'system', content: EVALUATE_TAKE_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 256,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Nvidia failed');
  const data = await response.json();
  return parseAndNormalizeGrading(data.choices[0].message.content);
}

/**
 * Grades a single hot take statement using the LLM chain of priority.
 * Fallback chain order:
 * 1. OpenRouter (Llama 3.3 70B Instruct)
 * 2. Groq (Llama 3.3 70B Speculative Decoding)
 * 3. Nvidia NIM (Llama 3.1 70B Instruct)
 * 4. Local Heuristic Fallback (deterministic parser fallback if all keys fail or timeout)
 * 
 * @param {string} statement - The hot take text submitted by the user.
 * @returns {Promise<Object>} JSON containing grade, ovr, verdict, charge, and sentence.
 */
async function gradeHotTake(statement: string): Promise<{ grade: string; ovr: number; verdict: string; charge: string; sentence: string }> {
  const prompt = `Grade this football hot take: "${statement}"`;

  // Try each provider in order of priority
  const attempts = [
    () => process.env.OPENROUTER_API_KEY ? callOpenRouter(prompt) : Promise.reject(new Error('No key')),
    () => process.env.GROQ_API_KEY ? callGroq(prompt) : Promise.reject(new Error('No key')),
    () => process.env.NVIDIA_API_KEY ? callNvidia(prompt) : Promise.reject(new Error('No key')),
  ];

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      return result;
    } catch {
      // try next provider on failure
    }
  }

  // Local heuristic fallback to prevent server crashes/timeout failures.
  // Performs lightweight string parsing to give realistic, humorous grades.
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


// ─── V1 Scoring Formulas ─────────────────────────────────────────────────────

// ─── V1 Scoring Formulas ─────────────────────────────────────────────────────

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

/**
 * PRD — Predictor Score (0–100)
 * Calculates accuracy of user prediction metrics:
 * 1. Outcome (35 pts): Match outcome (Draw=35, Correct Winner=30, Wrong Outcome=15).
 * 2. Home Goals (15 pts): Home team goal accuracy (Exact=15, Off-by-1=10, Off-by-2=5, Off-by-3+=0).
 * 3. Away Goals (15 pts): Away team goal accuracy (Exact=15, Off-by-1=10, Off-by-2=5, Off-by-3+=0).
 * 4. Man of the Match (20 pts): Selected MOTM accuracy (Exact=20, Same Team/Strong performance=12, Same Team=8, Wrong=4).
 * 5. First Goalscorer (15 pts): Selected goalscorer accuracy (Correct First=15, Same/Strong=10, Same=6, Wrong=2).
 * 
 * Maximum score is capped at 100.
 */
function calculatePRD(params: {
  predHome: number; predAway: number;
  actualHome: number; actualAway: number;
  predMotm: string; actualMotm: string;
  predScorer: string; actualScorer: string;
  actualScorers: string[]; // all scorers in the match
  homeTeamName: string;
  awayTeamName: string;
}): number {
  const { predHome, predAway, actualHome, actualAway, predMotm, actualMotm, predScorer, actualScorer, actualScorers, homeTeamName, awayTeamName } = params;

  // 1. Outcome (35 pts)
  const predOutcome = predHome > predAway ? 1 : predHome < predAway ? -1 : 0;
  const actualOutcome = actualHome > actualAway ? 1 : actualHome < actualAway ? -1 : 0;
  let outcomePoints: number;
  if (predOutcome === actualOutcome) {
    outcomePoints = predOutcome === 0 ? 35 : 30; // Draw=35, Correct Winner=30
  } else {
    outcomePoints = 15; // Wrong
  }

  // 2. Home goals (15 pts)
  const homeDiff = Math.abs(predHome - actualHome);
  const homePoints = homeDiff === 0 ? 15 : homeDiff === 1 ? 10 : homeDiff === 2 ? 5 : 0;

  // 3. Away goals (15 pts)
  const awayDiff = Math.abs(predAway - actualAway);
  const awayPoints = awayDiff === 0 ? 15 : awayDiff === 1 ? 10 : awayDiff === 2 ? 5 : 0;

  // 4. MOTM (20 pts)
  let motmPoints = 4; // default wrong
  if (predMotm && predMotm.trim()) {
    const pm = predMotm.toLowerCase().trim();
    const am = actualMotm.toLowerCase().trim();
    if (pm === 'none' || pm === '') {
      if (am === 'none' || am === '') {
        motmPoints = 20; // Correct
      } else {
        motmPoints = 4;
      }
    } else if (am === 'none' || am === '') {
      motmPoints = 4;
    } else if (pm === am || am.includes(pm) || pm.includes(am)) {
      motmPoints = 20;
    } else {
      const predTeam = getPlayerTeamName(predMotm, homeTeamName, awayTeamName);
      const actualTeam = getPlayerTeamName(actualMotm, homeTeamName, awayTeamName);
      if (predTeam && actualTeam && predTeam === actualTeam) {
        motmPoints = isStrongPlayer(predMotm) ? 12 : 8;
      } else {
        motmPoints = 4;
      }
    }
  } else {
    const am = actualMotm.toLowerCase().trim();
    if (am === 'none' || am === '') {
      motmPoints = 20;
    } else {
      motmPoints = 4;
    }
  }

  // 5. First Goalscorer (15 pts)
  let scorerPoints = 2; // default wrong
  if (predScorer && predScorer.trim()) {
    const ps = predScorer.toLowerCase().trim();
    const as = actualScorer.toLowerCase().trim();
    const allScorersLower = actualScorers.map(s => s.toLowerCase());

    if (ps === 'none' || ps === '') {
      if (as === 'none' || as === '') {
        scorerPoints = 15; // Correct
      } else {
        scorerPoints = 2;
      }
    } else if (as === 'none' || as === '') {
      scorerPoints = 2;
    } else if (ps === as || as.includes(ps) || ps.includes(as)) {
      scorerPoints = 15; // correct first goalscorer
    } else {
      const predTeam = getPlayerTeamName(predScorer, homeTeamName, awayTeamName);
      const actualTeam = getPlayerTeamName(actualScorer, homeTeamName, awayTeamName);
      if (predTeam && actualTeam && predTeam === actualTeam) {
        const scoredLater = allScorersLower.some(s => s.includes(ps) || ps.includes(s));
        if (scoredLater || isStrongPlayer(predScorer)) {
          scorerPoints = 10;
        } else {
          scorerPoints = 6;
        }
      } else {
        scorerPoints = 2;
      }
    }
  } else {
    const as = actualScorer.toLowerCase().trim();
    if (as === 'none' || as === '') {
      scorerPoints = 15;
    } else {
      scorerPoints = 2;
    }
  }

  return Math.min(100, outcomePoints + homePoints + awayPoints + motmPoints + scorerPoints);
}

/**
 * Static map of international football player ratings.
 * Serves as the basis for calculating the Manager Score (MGR).
 */
const PLAYER_RATING_MAP: Record<string, number> = {
  // 9.0–9.5: world-class
  'l. messi': 9.5, 'messi': 9.5,
  'cristiano ronaldo': 9.2, 'ronaldo': 9.2,
  'k. mbappe': 9.3, 'mbappe': 9.3,
  'vinicius jr': 9.1, 'vinicius': 9.1,
  'erling haaland': 9.2, 'haaland': 9.2,
  // 8.5–9.0
  'jude bellingham': 8.9, 'bellingham': 8.9,
  'rodri': 8.8,
  'bukayo saka': 8.5, 'saka': 8.5,
  'harry kane': 8.7, 'kane': 8.7,
  'r. lewandowski': 8.6, 'lewandowski': 8.6,
  'lautaro martinez': 8.5, 'martinez': 8.2,
  // 8.0–8.5
  'virgil van dijk': 8.4, 'van dijk': 8.4,
  'bruno fernandes': 8.3, 'b. fernandes': 8.3,
  'bernardo silva': 8.3, 'casemiro': 8.2,
  'declan rice': 8.1, 'rice': 8.1,
  'cole palmer': 8.3, 'palmer': 8.3,
  'v. gyokeres': 8.5, 'gyokeres': 8.5,
  'a. isak': 8.2, 'isak': 8.2,
  // 7.5–8.0
  'marquinhos': 7.9, 'alisson': 8.0,
  'thibaut courtois': 8.0, 'courtois': 8.0,
  'pedri': 8.5, 'gavi': 8.0,
  'phil foden': 8.2, 'foden': 8.2,
  'rafael leao': 8.0, 'leao': 8.0,
};

/**
 * Look up a single player's rating from the reputation dictionary.
 * 
 * @param {string} playerName - Player's name.
 * @returns {number} Rating (fallback: 7.0 for standard international players).
 */
function getPlayerRating(playerName: string): number {
  const lower = playerName.toLowerCase().trim();
  for (const [key, rating] of Object.entries(PLAYER_RATING_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return rating;
  }
  return 7.0; // default solid international player
}

/**
 * MGR — Manager Score (10–99)
 * Calculates the quality of the selected tactical Best XI formation.
 * Formula: Round(Average Player Rating × 10)
 * 
 * @param {Record<string, any>} lineup - Chosen lineup mapped by pitch slot ID.
 * @returns {number} Manager rating between 10 and 99 (default: 50 if empty).
 */
function calculateMGR(lineup: Record<string, any>, playerMatchRatings: Record<string, number>): number {
  const players = Object.values(lineup).filter(p => p && p.name);
  if (!players.length) return 50; // default if no lineup submitted

  const sumRatings = players.reduce((sum, p) => {
    const pName = p.name.toLowerCase().trim();
    const matchRating = playerMatchRatings[pName] || 
                        Object.entries(playerMatchRatings).find(([k]) => pName.includes(k) || k.includes(pName))?.[1] ||
                        getPlayerRatingFromRoster(p.name);
    return sum + matchRating;
  }, 0);

  const avgRating = sumRatings / players.length;
  return Math.max(10, Math.min(99, Math.round(avgRating * 10)));
}

/**
 * HOT — Hot Take Score (0–100)
 * Computes average hot take accuracy weighted by confidence levels.
 * Base values: CORRECT=100, PARTIALLY_CORRECT=75, INCORRECT=50.
 * Confidence multipliers: 1=0.8x, 2=0.9x, 3=1.0x, 4=1.1x, 5=1.2x.
 */
const CONFIDENCE_MULTIPLIER: Record<number, number> = {
  1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2
};

function getTakeBaseScore(grade: string): number {
  if (grade === 'CORRECT') return 100;
  if (grade === 'PARTIALLY_CORRECT') return 75;
  return 50; // INCORRECT
}

/**
 * Aggregates hot take evaluations.
 * 
 * @param {Array<{grade: string, confidence: number}>} gradedTakes - List of hot takes with grades/confidence.
 * @returns {number} Graded score between 0 and 100.
 */
function calculateHOT(gradedTakes: Array<{ grade: string; confidence: number }>): number {
  if (!gradedTakes.length) return 50;
  const values = gradedTakes.map(t => {
    const base = getTakeBaseScore(t.grade);
    const multiplier = CONFIDENCE_MULTIPLIER[Math.max(1, Math.min(5, t.confidence))] ?? 1.0;
    return base * multiplier;
  });
  return Math.max(0, Math.min(100, Math.round(values.reduce((a, b) => a + b, 0) / values.length)));
}

/**
 * RST — Roast Score (50–100)
 * Tallies community interaction inside the Match Live Banter Chat.
 * Formula: 50 + count(messages sent) + sum(upvote reactions).
 * 
 * @param {string} profileId - Database profile ID.
 * @param {string} matchId - Database match ID.
 * @returns {Promise<number>} Score capped between 50 and 100.
 */
async function calculateRST(profileId: string, matchId: string): Promise<number> {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { profileId, matchId },
      select: { upvotes: true }
    });
    const msgCount = messages.length;
    const reactions = messages.reduce((sum, m) => sum + (m.upvotes ?? 0), 0);
    return Math.max(50, Math.min(100, 50 + msgCount + reactions));
  } catch {
    return 50; // default if DB offline
  }
}

/**
 * Final Overall Rating (OVR)
 * Combines the four primary metrics using weighted contributions:
 * - 35% Predictor Score (PRD)
 * - 25% Manager Score (MGR)
 * - 25% Hot Take Score (HOT)
 * - 15% Roast Score (RST)
 * 
 * @returns {number} Score rounded between 1 and 99.
 */
function calculateOVR(prd: number, mgr: number, hot: number, rst: number): number {
  return Math.max(1, Math.min(99, Math.round(
    (0.35 * prd) + (0.25 * mgr) + (0.25 * hot) + (0.15 * rst)
  )));
}


// ─── Types ───────────────────────────────────────────────────────────────────

interface GradedTake {
  statement: string;
  confidence: number;
  grade: string;
  ovr: number;
  verdict: string;
  charge: string;
  sentence: string;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    const body = await request.json();
    const {
      syncOnly,
      matchId,
      homeScore: predHomeScore,
      awayScore: predAwayScore,
      firstGoalscorer: predScorer,
      motm: predMotm,
      hotTakes,  // Array of { statement: string, confidence: number }
      lineup,    // Record<string, Player>
      profile    // Current user profile object, display-only; identity comes from session
    } = body;

    // ── Sync-only mode (profile upsert) ──────────────────────────────────────
    if (syncOnly) {
      try {
        let dbProfile = await prisma.footballIQProfile.findUnique({
          where: { id: auth.session.profileId }
        });
        if (dbProfile) {
          dbProfile = await prisma.footballIQProfile.update({
            where: { id: dbProfile.id },
            data: {
              avatarStyle: profile?.avatarStyle || undefined,
              avatarSeed: profile?.avatarSeed || undefined,
            }
          });
        }
        return NextResponse.json({ success: true, profile: dbProfile || profile });
      } catch (dbError) {
        console.warn('Prisma Database Offline. SyncOnly failed:', dbError);
        return NextResponse.json({ success: true, profile });
      }
    }

    // ── Load match data ───────────────────────────────────────────────────────
    const [matches, teams] = await Promise.all([
      fetchWorldCupMatches(),
      fetchWorldCupTeams()
    ]);

    const match = matches.find((m: any) => m.id === matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found.' }, { status: 404 });
    }

    const homeTeamName = teams.find((t: any) => t.id === match.home_team_id)?.name_en || match.home_team_label || 'Home';
    const awayTeamName = teams.find((t: any) => t.id === match.away_team_id)?.name_en || match.away_team_label || 'Away';

    // Get deterministic completed result
    const result = getDeterministicMatchResult(matchId, homeTeamName, awayTeamName, match);

    // Parse all scorers from the match data
    const parseScorers = (raw: string): string[] => {
      if (!raw) return [];
      return raw.replace(/[{}]/g, '').split(',').map(s => s.trim().replace(/"/g, '').replace(/\d+['+]*$/, '').trim()).filter(Boolean);
    };
    const allScorers = [
      ...parseScorers(match.home_scorers || ''),
      ...parseScorers(match.away_scorers || '')
    ];

    // ── 1. PRD — Predictor Score ──────────────────────────────────────────────
    const prd = calculatePRD({
      predHome: predHomeScore ?? 0,
      predAway: predAwayScore ?? 0,
      actualHome: result.homeScore,
      actualAway: result.awayScore,
      predMotm: predMotm || '',
      actualMotm: result.motm || '',
      predScorer: predScorer || '',
      actualScorer: result.firstGoalscorer || '',
      actualScorers: allScorers,
      homeTeamName,
      awayTeamName,
    });

    // ── 2. MGR — Manager Score ────────────────────────────────────────────────
    const playerMatchRatings = getPlayerMatchRatings(matchId, homeTeamName, awayTeamName, match);
    const mgr = calculateMGR(lineup || {}, playerMatchRatings);

    // ── 3. HOT — Hot Take Score ───────────────────────────────────────────────
    const statements = hotTakes && hotTakes.length > 0
      ? hotTakes
      : [];

    // Free users: cap at 2 takes. Premium/Admin: up to 5.
    const role = auth.session.role || 'FREE';
    const maxTakes = role === 'FREE' ? 2 : 5;
    const takesToGrade = statements.slice(0, maxTakes);

    const gradedTakes: GradedTake[] = await Promise.all(
      takesToGrade.map(async (take: any) => {
        const grading = await gradeHotTake(take.statement);
        return {
          statement: take.statement,
          confidence: take.confidence,
          ...grading,
        };
      })
    );

    const hot = calculateHOT(gradedTakes.map(t => ({ grade: t.grade, confidence: t.confidence })));

    // Resolve profile ONCE at the beginning of DB section
    let dbProfile: any = null;
    try {
      dbProfile = await prisma.footballIQProfile.findUnique({
        where: { id: auth.session.profileId }
      });
    } catch (dbError) {
      console.warn('DB offline during profile resolve:', dbError);
    }

    // ── 4. RST — Roast Score ──────────────────────────────────────────────────
    let rst = 50;
    if (dbProfile) {
      try {
        rst = await calculateRST(dbProfile.id, matchId);
      } catch {
        rst = profile?.roastScore ?? 50;
      }
    } else if (profile) {
      rst = profile.roastScore ?? 50;
    }

    // ── 5. Final OVR ─────────────────────────────────────────────────────────
    const ovr = calculateOVR(prd, mgr, hot, rst);

    // ── 6. Card Rarity & Verdict ──────────────────────────────────────────────
    let rarity = 'COMMON';
    let verdictText = 'DELUSION MERCHANT';

    if (ovr >= 90) { rarity = 'LEGENDARY'; verdictText = 'CERTIFIED GOAT DISCUSSION'; }
    else if (ovr >= 75) { rarity = 'EPIC'; verdictText = 'BALL KNOWLEDGE SUPREME'; }
    else if (ovr >= 60) { rarity = 'RARE'; verdictText = 'MID TAKE APPROVED'; }
    else if (ovr >= 40) { rarity = 'COMMON'; verdictText = 'DELUSION MERCHANT'; }
    else { rarity = 'COMMON'; verdictText = 'FOOTBALL TERRORIST'; }

    // Use the best-graded take's verdict for charm
    const bestTake = gradedTakes.sort((a, b) => b.ovr - a.ovr)[0];
    if (bestTake && bestTake.verdict) verdictText = bestTake.verdict;

    const cardId = crypto.randomUUID();
    const cardPayload = {
      id: cardId,
      matchId,
      rating: ovr,
      verdict: verdictText,
      charge: `Predicted: ${predHomeScore ?? '?'}-${predAwayScore ?? '?'} | Actual: ${result.homeScore}-${result.awayScore}`,
      evidence: bestTake ? `"${bestTake.statement}" — ${bestTake.charge}` : 'No evidence submitted.',
      sentence: bestTake?.sentence || 'Sentenced to watch highlight edits on repeat.',
      rarity,
      cardTheme: 'gold',
      statsJson: { prd, mgr, hot, rst, ovr }
    };

    // ── 7. Persist to DB ──────────────────────────────────────────────────────
    let persistedCard: any = null;
    try {
      if (dbProfile) {
          // Update: take best-ever score per metric (never decrease)
          dbProfile = await prisma.footballIQProfile.update({
            where: { id: dbProfile.id },
            data: {
              overallRating: Math.max(dbProfile.overallRating, ovr),
              predictionRating: Math.max(dbProfile.predictionRating, prd),
              hotTakeRating: Math.max(dbProfile.hotTakeRating, hot),
              managerRating: Math.max(dbProfile.managerRating, mgr),
              roastScore: Math.max(dbProfile.roastScore, rst),
            }
          });

        // Upsert Match Prediction
        const dbPrediction = await prisma.matchPrediction.upsert({
          where: { profileId_matchId: { profileId: dbProfile.id, matchId } },
          create: {
            profileId: dbProfile.id,
            matchId,
            homeScore: predHomeScore ?? 0,
            awayScore: predAwayScore ?? 0,
            firstGoalscorer: predScorer || '',
            motm: predMotm || '',
            possessionWinner: String(body.possessionWinner || ''),
            lineup: lineup !== undefined ? lineup : undefined,
          },
          update: {
            homeScore: predHomeScore ?? 0,
            awayScore: predAwayScore ?? 0,
            firstGoalscorer: predScorer || '',
            motm: predMotm || '',
            possessionWinner: String(body.possessionWinner || ''),
            lineup: lineup !== undefined ? lineup : undefined,
          },
        });

        // Save Hot Takes (delete + recreate for clean state)
        await prisma.hotTake.deleteMany({ where: { predictionId: dbPrediction.id } });
        if (takesToGrade.length > 0) {
          await prisma.hotTake.createMany({
            data: takesToGrade.map((take: any) => ({
              predictionId: dbPrediction.id,
              statement: take.statement,
              confidence: take.confidence
            }))
          });
        }

        // Upsert Match Card
        persistedCard = await prisma.matchCard.upsert({
          where: { profileId_matchId: { profileId: dbProfile.id, matchId } },
          create: {
            id: cardId,
            profileId: dbProfile.id,
            matchId,
            rating: ovr,
            verdict: verdictText,
            charge: cardPayload.charge,
            evidence: cardPayload.evidence,
            sentence: cardPayload.sentence,
            rarity,
            statsJson: cardPayload.statsJson,
            cardTheme: 'gold'
          },
          update: {
            rating: ovr,
            verdict: verdictText,
            charge: cardPayload.charge,
            evidence: cardPayload.evidence,
            sentence: cardPayload.sentence,
            rarity,
            statsJson: cardPayload.statsJson,
          }
        });
      }
    } catch (dbError) {
      console.warn('DB offline — returning in-memory response:', dbError);
    }

    const finalCard = persistedCard
      ? {
          ...cardPayload,
          id: persistedCard.id,
          aiImageUrl: persistedCard.aiImageUrl,
          createdAt: persistedCard.createdAt,
        }
      : cardPayload;

    return NextResponse.json({
      success: true,
      card: finalCard,
      profileUpdates: {
        predictionRating: prd,
        hotTakeRating: hot,
        managerRating: mgr,
        roastScore: rst,
        overallRating: ovr,
        predictionDelta: profile?.predictionRating !== undefined ? prd - profile.predictionRating : 0,
        hotTakeDelta: profile?.hotTakeRating !== undefined ? hot - profile.hotTakeRating : 0,
        managerDelta: profile?.managerRating !== undefined ? mgr - profile.managerRating : 0,
        roastDelta: profile?.roastScore !== undefined ? rst - profile.roastScore : 0,
        overallDelta: profile?.overallRating !== undefined ? ovr - profile.overallRating : 0,
      },
      gradedTakes,
      actualResult: result,
      scores: { prd, mgr, hot, rst, ovr },
    });

  } catch (error) {
    console.error('Error in /api/resolve-match:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
