import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { fetchWorldCupMatches, fetchWorldCupTeams } from '@/lib/worldcupData';
import { getDeterministicMatchResult, getPlayerMatchRatings } from '@/lib/matchUtils';
import { requireSession } from '@/lib/authSession';
import {
  calculateHOT,
  calculateMGR,
  calculateOVR,
  calculatePRD,
  calculateRSTFromActivity,
} from '@/lib/scoring';

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
  // Strip various code fence formats LLMs use
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  // Extract JSON object if buried in prose
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Invalid JSON from LLM: ${cleaned.slice(0, 200)}`);
  }
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
/**
 * Returns true if the key looks like an unset placeholder (e.g. 'gsk_your_groq_api_key_here').
 * Placeholder keys contain the word 'your' or start with obvious template prefixes.
 */
function isPlaceholderKey(key: string | undefined): boolean {
  if (!key) return true;
  const lower = key.toLowerCase();
  return lower.includes('your_') || lower.includes('_your_') || lower === 'undefined' || lower === 'null';
}

async function callOpenRouter(userPrompt: string) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('No OpenRouter key');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.live',
      'X-Title': 'BallKnowledge Premier League 2026/27',
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
    signal: AbortSignal.timeout(4_000), // Shortened to 4s to prevent server hang on rate limits
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
  if (isPlaceholderKey(process.env.GROQ_API_KEY)) throw new Error('No Groq key');
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
    signal: AbortSignal.timeout(4_000), // Shortened to 4s
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
  if (isPlaceholderKey(process.env.NVIDIA_API_KEY)) throw new Error('No Nvidia key');
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
    signal: AbortSignal.timeout(4_000), // Shortened to 4s
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
    () => !isPlaceholderKey(process.env.OPENROUTER_API_KEY) ? callOpenRouter(prompt) : Promise.reject(new Error('No key')),
    () => !isPlaceholderKey(process.env.GROQ_API_KEY) ? callGroq(prompt) : Promise.reject(new Error('No key')),
    () => !isPlaceholderKey(process.env.NVIDIA_API_KEY) ? callNvidia(prompt) : Promise.reject(new Error('No key')),
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


async function calculateRST(profileId: string, matchId: string): Promise<number> {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { profileId, matchId },
      select: { upvotes: true },
    });
    const msgCount  = messages.length;
    const reactions = messages.reduce((sum, m) => sum + (m.upvotes ?? 0), 0);
    return calculateRSTFromActivity(msgCount, reactions);
  } catch {
    return 0;
  }
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

function clampInteger(input: unknown, fallback: number, min: number, max: number) {
  const value = typeof input === 'number' ? input : parseInt(String(input ?? ''), 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function cleanText(input: unknown, maxLength: number) {
  return String(input ?? '').trim().slice(0, maxLength);
}

function cleanMatchId(input: unknown) {
  const matchId = cleanText(input, 64);
  return /^[a-zA-Z0-9_-]+$/.test(matchId) ? matchId : '';
}

function cleanLineup(input: unknown) {
  if (input === undefined || input === null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) return {};
  if (JSON.stringify(input).length > 100_000) return {};
  return input as Record<string, any>;
}

// Global in-memory locks to prevent concurrent duplicate resolution execution (double-clicks)
const activeResolves = new Set<string>();

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid match resolution payload.' }, { status: 400 });
    }

    const {
      syncOnly,
      matchId,
      homeScore: predHomeScore,
      awayScore: predAwayScore,
      firstGoalscorer: predScorer,
      motm: predMotm,
      hotTakes,  // Array of { statement: string, confidence: number }
      lineup,    // Record<string, Player>
      profile,    // Current user profile object, display-only; identity comes from session
      playerMatchRatings: adminPlayerMatchRatings // Record<string, number>
    } = body;

    const safeMatchId = cleanMatchId(matchId);
    const safePredHomeScore = clampInteger(predHomeScore, 0, 0, 99);
    const safePredAwayScore = clampInteger(predAwayScore, 0, 0, 99);
    const safePredScorer = cleanText(predScorer, 120);
    const safePredMotm = cleanText(predMotm, 120);
    const safePossessionWinner = cleanText(body.possessionWinner, 20);
    const safeLineup = cleanLineup(lineup);

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

    if (!safeMatchId) {
      return NextResponse.json({ error: 'A valid matchId is required.' }, { status: 400 });
    }

    // Check resolve lock to prevent parallel double-click execution (ignore for profile style updates)
    const lockKey = `${auth.session.profileId}_${safeMatchId}`;
    if (!syncOnly) {
      if (activeResolves.has(lockKey)) {
        return NextResponse.json({ error: 'A resolution request for this match is already processing.' }, { status: 409 });
      }
      activeResolves.add(lockKey);
    }

    try {

    // ── Load match data ───────────────────────────────────────────────────────
    const [matches, teams] = await Promise.all([
      fetchWorldCupMatches(),
      fetchWorldCupTeams()
    ]);

    const match = matches.find((m: any) => String(m.id) === safeMatchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found.' }, { status: 404 });
    }

    const homeTeamName = teams.find((t: any) => t.id === match.home_team_id)?.name_en || match.home_team_label || 'Home';
    const awayTeamName = teams.find((t: any) => t.id === match.away_team_id)?.name_en || match.away_team_label || 'Away';

    // ── Trigger SofaScore sync before resolving (non-blocking best-effort) ────
    // This refreshes the sofascore_cache.json so the match object carries real
    // player ratings (sofascore_ratings) and goalscorer data (sofascore_firstGoalscorer, sofascore_motm).
    let enrichedMatch = match;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const syncRes = await fetch(`${baseUrl}/api/sofascore-sync?matchId=${safeMatchId}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (syncRes.ok) {
        // Re-fetch matches so the SofaScore overlay is applied
        const freshMatches = await fetchWorldCupMatches();
        enrichedMatch = freshMatches.find((m: any) => String(m.id) === safeMatchId) || match;
      }
    } catch (syncErr) {
      console.warn(`[resolve-match] SofaScore sync failed for match ${safeMatchId}, using cached data:`, (syncErr as Error).message);
    }

    // Get deterministic completed result — uses enrichedMatch which has SofaScore data overlaid
    const result = getDeterministicMatchResult(safeMatchId, homeTeamName, awayTeamName, enrichedMatch);

    // Parse all scorers from the enriched match data
    const parseScorers = (raw: string): string[] => {
      if (!raw) return [];
      return raw.replace(/[{}]/g, '').split(',').map(s => s.trim().replace(/"/g, '').replace(/\d+['\+]*(\s*\(P\)|\s*\(OG\))?$/, '').trim()).filter(Boolean);
    };
    const allScorers = [
      ...parseScorers(enrichedMatch.home_scorers || ''),
      ...parseScorers(enrichedMatch.away_scorers || '')
    ];

    // ── 1. PRD — Predictor Score ──────────────────────────────────────────────
    const prd = calculatePRD({
      predHome: safePredHomeScore,
      predAway: safePredAwayScore,
      actualHome: result.homeScore,
      actualAway: result.awayScore,
      predMotm: safePredMotm,
      actualMotm: result.motm || '',
      predScorer: safePredScorer,
      actualScorer: result.firstGoalscorer || '',
      actualScorers: allScorers,
      homeTeamName,
      awayTeamName,
    });

    // ── 2. MGR — Manager Score ────────────────────────────────────────────────
    // Use enrichedMatch so SofaScore real ratings (sofascore_ratings) are applied
    const playerMatchRatings = adminPlayerMatchRatings || getPlayerMatchRatings(safeMatchId, homeTeamName, awayTeamName, enrichedMatch);
    // Pass hasRealSofaScoreData=true so MGR uses the 6–10 → 0–99 conversion instead of reputation compression
    const hasRealRatings = Object.keys(enrichedMatch?.sofascore_ratings || {}).length > 0;
    const mgr = calculateMGR(safeLineup, playerMatchRatings, hasRealRatings);

    // ── 3. HOT — Hot Take Score ───────────────────────────────────────────────
    const statements = Array.isArray(hotTakes) ? hotTakes : [];

    // Free users: cap at 3 takes. Premium/Admin: up to 5.
    const role = auth.session.role || 'FREE';
    const maxTakes = role === 'FREE' ? 3 : 5;
    const takesToGrade = statements
      .slice(0, maxTakes)
      .map((take: any) => ({
        statement: cleanText(take?.statement, 280),
        confidence: clampInteger(take?.confidence, 3, 1, 5),
      }))
      .filter((take) => take.statement);

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

    // ── 4. RST — Roast Score ────────────────────────────────────────────────
    let rst = 0; // 0 = no engagement — earned through participation, not given free
    if (dbProfile) {
      try {
        rst = await calculateRST(dbProfile.id, safeMatchId);
      } catch {
        rst = 0;
      }
    }

    // ── 5. Final OVR ─────────────────────────────────────────────────────────
    const ovr = calculateOVR(prd, mgr, hot, rst);

    // ── 6. Card Rarity & Verdict ──────────────────────────────────────────────
    let rarity = 'COMMON';
    let verdictText = 'DELUSION MERCHANT';

    // Rarity tiers recalibrated: OVR now ranges from ~1 to 99 with no free floor points
    if (ovr >= 85)      { rarity = 'LEGENDARY'; verdictText = 'CERTIFIED GOAT DISCUSSION'; }
    else if (ovr >= 70) { rarity = 'EPIC';      verdictText = 'BALL KNOWLEDGE SUPREME';   }
    else if (ovr >= 55) { rarity = 'RARE';      verdictText = 'MID TAKE APPROVED';         }
    else if (ovr >= 30) { rarity = 'COMMON';    verdictText = 'DELUSION MERCHANT';         }
    else                { rarity = 'COMMON';    verdictText = 'FOOTBALL TERRORIST';         }

    // Use the best-graded take's verdict for charm (sort a copy to avoid mutating gradedTakes order)
    const bestTake = [...gradedTakes].sort((a, b) => b.ovr - a.ovr)[0];
    if (bestTake && bestTake.verdict) verdictText = bestTake.verdict;

    const cardId = crypto.randomUUID();
    const cardPayload = {
      id: cardId,
      matchId: safeMatchId,
      rating: ovr,
      verdict: verdictText,
      charge: `Predicted: ${safePredHomeScore}-${safePredAwayScore} | Actual: ${result.homeScore}-${result.awayScore}`,
      evidence: bestTake ? `"${bestTake.statement}" — ${bestTake.charge}` : 'No evidence submitted.',
      sentence: bestTake?.sentence || 'Sentenced to watch highlight edits on repeat.',
      rarity,
      cardTheme: 'gold',
      statsJson: { prd, mgr, hot, rst, ovr }
    };

    // ── 7. Persist to DB ──────────────────────────────────────────────────────
    let persistedCard: any = null;
    let finalPrd = prd;
    let finalHot = hot;
    let finalMgr = mgr;
    let finalRst = rst;
    let finalOvr = ovr;

    try {
      if (dbProfile) {
        // Wrap database writes in a secure atomic transaction to guarantee profile/card alignment
        await prisma.$transaction(async (tx) => {
          // Upsert Match Prediction
          const dbPrediction = await tx.matchPrediction.upsert({
            where: { profileId_matchId: { profileId: dbProfile.id, matchId: safeMatchId } },
            create: {
              profileId: dbProfile.id,
              matchId: safeMatchId,
              homeScore: safePredHomeScore,
              awayScore: safePredAwayScore,
              firstGoalscorer: safePredScorer,
              motm: safePredMotm,
              possessionWinner: safePossessionWinner,
              lineup: safeLineup,
            },
            update: {
              homeScore: safePredHomeScore,
              awayScore: safePredAwayScore,
              firstGoalscorer: safePredScorer,
              motm: safePredMotm,
              possessionWinner: safePossessionWinner,
              lineup: safeLineup,
            },
          });

          // Save Hot Takes (delete + recreate for clean state)
          await tx.hotTake.deleteMany({ where: { predictionId: dbPrediction.id } });
          if (takesToGrade.length > 0) {
            await tx.hotTake.createMany({
              data: takesToGrade.map((take: any) => ({
                predictionId: dbPrediction.id,
                statement: take.statement,
                confidence: take.confidence
              }))
            });
          }

          // Upsert Match Card
          persistedCard = await tx.matchCard.upsert({
            where: { profileId_matchId: { profileId: dbProfile.id, matchId: safeMatchId } },
            create: {
              id: cardId,
              profileId: dbProfile.id,
              matchId: safeMatchId,
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

          // ── Exponential Weighted Average for profile ratings ───────────────────────────
          // α = 0.3: recent match weight = 30%, previous EMA weight = 70%.
          const allCards = await tx.matchCard.findMany({
            where: { profileId: dbProfile.id },
            select: { createdAt: true, rating: true, statsJson: true },
          });
          const ALPHA = 0.3;
          const count = allCards.length;

          if (count > 0) {
            // Sort cards oldest-first to apply EWA in chronological order
            const sortedCards = [...allCards].sort((a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            // Seed EMA from the oldest card's scores
            const first = (sortedCards[0].statsJson as any) || {};
            let emaPrd = Number(first.prd ?? sortedCards[0].rating ?? prd);
            let emaMgr = Number(first.mgr ?? 50);
            let emaHot = Number(first.hot ?? 50);
            let emaRst = Number(first.rst ?? 0);
            let emaOvr = Number(first.ovr ?? sortedCards[0].rating ?? ovr);

            // Iterate remaining cards (index 1+) and the current new card
            for (let i = 1; i < sortedCards.length; i++) {
              const stats = (sortedCards[i].statsJson as any) || {};
              emaPrd = Math.round(ALPHA * Number(stats.prd ?? emaPrd) + (1 - ALPHA) * emaPrd);
              emaMgr = Math.round(ALPHA * Number(stats.mgr ?? emaMgr) + (1 - ALPHA) * emaMgr);
              emaHot = Math.round(ALPHA * Number(stats.hot ?? emaHot) + (1 - ALPHA) * emaHot);
              emaRst = Math.round(ALPHA * Number(stats.rst ?? emaRst) + (1 - ALPHA) * emaRst);
              emaOvr = Math.round(ALPHA * Number(stats.ovr ?? emaOvr) + (1 - ALPHA) * emaOvr);
            }

            finalPrd = Math.max(1, Math.min(99, emaPrd));
            finalMgr = Math.max(1, Math.min(99, emaMgr));
            finalHot = Math.max(1, Math.min(99, emaHot));
            finalRst = Math.max(0, Math.min(99, emaRst));
            finalOvr = Math.max(1, Math.min(99, emaOvr));
          }

          // Update profile with EWA ratings
          dbProfile = await tx.footballIQProfile.update({
            where: { id: dbProfile.id },
            data: {
              overallRating: finalOvr,
              predictionRating: finalPrd,
              hotTakeRating: finalHot,
              managerRating: finalMgr,
              roastScore: finalRst,
            }
          });
        });
      }
    } catch (dbError) {
      console.warn('DB persistence transaction failed, fallback to memory card:', dbError);
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
        predictionRating: finalPrd,
        hotTakeRating: finalHot,
        managerRating: finalMgr,
        roastScore: finalRst,
        overallRating: finalOvr,
        predictionDelta: profile?.predictionRating !== undefined ? finalPrd - profile.predictionRating : 0,
        hotTakeDelta: profile?.hotTakeRating !== undefined ? finalHot - profile.hotTakeRating : 0,
        managerDelta: profile?.managerRating !== undefined ? finalMgr - profile.managerRating : 0,
        roastDelta: profile?.roastScore !== undefined ? finalRst - profile.roastScore : 0,
        overallDelta: profile?.overallRating !== undefined ? finalOvr - profile.overallRating : 0,
      },
      gradedTakes,
      actualResult: result,
      scores: { prd, mgr, hot, rst, ovr },
    });

    } finally {
      if (!syncOnly) {
        activeResolves.delete(lockKey);
      }
    }
  } catch (error) {
    console.error('Error in /api/resolve-match:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
