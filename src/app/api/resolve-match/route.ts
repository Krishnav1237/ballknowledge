import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { fetchWorldCupMatches, fetchWorldCupTeams } from '@/lib/worldcupData';
import { parseLocalDate, getDeterministicMatchResult } from '@/lib/matchUtils';

export const dynamic = 'force-dynamic';

// System prompt to evaluate the hot take
const EVALUATE_TAKE_PROMPT = `You are the Stockley Park VAR Grader. Rate this football hot take statement on a scale of 1 to 99, where:
- 75-99: Elite ball knowledge, visionary, chef cooking take.
- 36-74: Common, average, mid take.
- 1-35: Delusional, logic-bankrupt, football terrorist take.

You MUST return a JSON object with this exact structure:
{
  "ovr": number (1-99),
  "verdict": "string (funny meme title, e.g. 'CERTIFIED COOKING', 'DELUSION MERCHANT', 'AURA BANKRUPT', 'TACTICAL FRAUD')",
  "charge": "string (brief description of their bias, expected goals obsession, or delusion)",
  "sentence": "string (funny legal soccer punishment, e.g. 'Sentenced to watch low block tactics for 10 hours', 'Banned from Ballon d'Or discussions')"
}

Be direct, highly cynical, and funny.`;


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
  });
  if (!response.ok) throw new Error('Groq failed');
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

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
  });
  if (!response.ok) throw new Error('Nvidia failed');
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

interface GradedTake {
  statement: string;
  confidence: number;
  ovr: number;
  verdict: string;
  charge: string;
  sentence: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      syncOnly,
      matchId,
      homeScore: predHomeScore,
      awayScore: predAwayScore,
      firstGoalscorer: predScorer,
      motm: predMotm,
      possessionWinner: predPossession,
      hotTakes, // Array of { statement: string, confidence: number }
      profile // Current user profile object
    } = body;

    if (syncOnly && profile && profile.username) {
      try {
        let dbProfile = await prisma.footballIQProfile.findUnique({
          where: { username: profile.username }
        });
        if (!dbProfile) {
          dbProfile = await prisma.footballIQProfile.create({
            data: {
              username: profile.username,
              avatarStyle: profile.avatarStyle || 'fun-emoji',
              avatarSeed: profile.avatarSeed || 'Reputation',
              overallRating: profile.overallRating || 50,
              predictionRating: profile.predictionRating || 50,
              hotTakeRating: profile.hotTakeRating || 50,
              role: profile.role || 'FREE',
              season: 'World Cup 2026'
            }
          });
        } else {
          dbProfile = await prisma.footballIQProfile.update({
            where: { id: dbProfile.id },
            data: {
              overallRating: Math.max(dbProfile.overallRating, profile.overallRating || 50),
              predictionRating: Math.max(dbProfile.predictionRating, profile.predictionRating || 50),
              hotTakeRating: Math.max(dbProfile.hotTakeRating, profile.hotTakeRating || 50),
              role: profile.role || dbProfile.role
            }
          });
        }
        return NextResponse.json({ success: true, profile: dbProfile });
      } catch (dbError) {
        console.warn('Prisma Database Offline. SyncOnly failed:', dbError);
        return NextResponse.json({ success: true, profile });
      }
    }

    // Load matches & teams dynamically from caching service
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
    const homeTeamFlag = teams.find((t: any) => t.id === match.home_team_id)?.flag || '';
    const awayTeamFlag = teams.find((t: any) => t.id === match.away_team_id)?.flag || '';

    // Get deterministic completed result
    const result = getDeterministicMatchResult(matchId, homeTeamName, awayTeamName, match);

    // 1. Prediction Scoring
    let predictionDelta = 0;
    const predScoreOutcome = (predHomeScore > predAwayScore) ? 1 : (predHomeScore < predAwayScore ? -1 : 0);
    const actualScoreOutcome = (result.homeScore > result.awayScore) ? 1 : (result.homeScore < result.awayScore ? -1 : 0);
    
    let predictionPerfScore = 30; // mapping performance score 0-99 for card OVR

    if (predHomeScore === result.homeScore && predAwayScore === result.awayScore) {
      predictionDelta = 15;
      predictionPerfScore = 99;
    } else if (predScoreOutcome === actualScoreOutcome) {
      predictionDelta = 5;
      predictionPerfScore = 75;
    } else {
      predictionDelta = -2;
      predictionPerfScore = 30;
    }

    // Additional predictions (MOTM, Goalscorer) can add a small bonus (capped at +5)
    let bonus = 0;
    if (predScorer && predScorer.toLowerCase().trim() === result.firstGoalscorer.toLowerCase()) bonus += 3;
    if (predMotm && predMotm.toLowerCase().trim() === result.motm.toLowerCase()) bonus += 2;
    predictionDelta += bonus;

    // 2. Hot Take Grading
    let hotTakeDelta = 0;
    let avgTakeOvr = 50;
    const gradedTakes: GradedTake[] = [];

    const statements = hotTakes && hotTakes.length > 0 ? hotTakes : [{ statement: 'No hot take submitted.', confidence: 50 }];

    for (const take of statements) {
      let takeGrading = {
        ovr: 50,
        verdict: 'COMMON TASTE',
        charge: 'Evaluating ordinary take.',
        sentence: 'Continue watching matches.'
      };

      try {
        takeGrading = await callGroq(`Grading statement: "${take.statement}" with confidence ${take.confidence}%`);
      } catch {
        try {
          takeGrading = await callNvidia(`Grading statement: "${take.statement}" with confidence ${take.confidence}%`);
        } catch {
          // Local fallback heuristic
          const stmtLower = take.statement.toLowerCase().trim();
          const isDelusion = stmtLower.includes('antony') || stmtLower.includes('kane');
          
          if (stmtLower.includes('messi is the greatest world cup player') || stmtLower.includes('messi is the greatest of all time')) {
            takeGrading = {
              ovr: 99,
              verdict: 'CERTIFIED GOAT DISCUSSION',
              charge: 'Visionary appraisal of the 2022 Champion.',
              sentence: 'Awarded lifetime entry to the GOAT debate lobby.'
            };
          } else if (
            stmtLower.includes("ronaldo's aura will carry portugal") || 
            stmtLower.includes("portugal will secure a last-minute victory")
          ) {
            takeGrading = {
              ovr: 92,
              verdict: 'AURA COOKING DETECTED',
              charge: "Overwhelming reliance on the Portuguese captain's charisma.",
              sentence: 'Sentenced to display SIUUU celebration in public squares.'
            };
          } else {
            takeGrading = {
              ovr: isDelusion ? 20 : (take.statement.length > 40 ? 78 : 55),
              verdict: isDelusion ? 'GUILTY OF SUPREME DELUSION' : 'MID TAKE GRADED',
              charge: 'Generated local heuristic ranking.',
              sentence: 'Banned from commenting for 24 hours.'
            };
          }
        }
      }

      gradedTakes.push({
        statement: take.statement,
        confidence: take.confidence,
        ...takeGrading
      });
    }

    avgTakeOvr = Math.round(gradedTakes.reduce((acc, t) => acc + t.ovr, 0) / gradedTakes.length);

    if (avgTakeOvr >= 75) {
      hotTakeDelta = 10;
    } else if (avgTakeOvr <= 35) {
      hotTakeDelta = -5;
    } else {
      hotTakeDelta = 1;
    }

    // 3. Football IQ Overall Updates
    const oldPred = profile?.predictionRating ?? 50;
    const oldTake = profile?.hotTakeRating ?? 50;

    const newPred = Math.max(10, Math.min(99, oldPred + predictionDelta));
    const newTake = Math.max(10, Math.min(99, oldTake + hotTakeDelta));
    const newOverall = Math.round((newPred * 0.5) + (newTake * 0.5));

    const overallDelta = newOverall - (profile?.overallRating ?? 50);

    // 4. Card Rarity & Verdict Generation
    const cardOvr = Math.round((predictionPerfScore * 0.5) + (avgTakeOvr * 0.5));
    let rarity = 'COMMON';
    let cardTheme = 'bottler';
    let verdictText = 'DELUSION MERCHANT';

    if (cardOvr >= 90) {
      rarity = 'LEGENDARY';
      cardTheme = 'toty';
      verdictText = 'VISIONARY';
    } else if (cardOvr >= 75) {
      rarity = 'EPIC';
      cardTheme = 'gold';
      verdictText = 'BALL KNOWLEDGE SUPREME';
    } else if (cardOvr >= 60) {
      rarity = 'RARE';
      cardTheme = 'var';
      verdictText = 'MID TAKE APPROVED';
    } else {
      rarity = 'COMMON';
      cardTheme = 'bottler';
      verdictText = cardOvr < 35 ? 'FOOTBALL TERRORIST' : 'DELUSION MERCHANT';
    }

    const firstGraded = gradedTakes[0];
    const cardId = crypto.randomUUID();

    const cardPayload = {
      id: cardId,
      matchId,
      rating: cardOvr,
      verdict: verdictText,
      charge: `Predicted Score: ${predHomeScore}-${predAwayScore}. Actual Result: ${result.homeScore}-${result.awayScore}.`,
      evidence: `Hot Take statement: "${firstGraded.statement}" (VAR grading: ${firstGraded.ovr} OVR).`,
      sentence: firstGraded.sentence || 'Sentenced to watch highlight edits.',
      rarity,
      cardTheme,
      statsJson: {
        predictionDelta,
        hotTakeDelta,
        predictionPerfScore,
        avgTakeOvr
      }
    };

    // Save to PostgreSQL if online
    try {
      if (profile && profile.username) {
        // Query user profile
        let dbProfile = await prisma.footballIQProfile.findUnique({
          where: { username: profile.username }
        });

        if (!dbProfile) {
          dbProfile = await prisma.footballIQProfile.create({
            data: {
              username: profile.username,
              avatarStyle: profile.avatarStyle || 'fun-emoji',
              avatarSeed: profile.avatarSeed || 'Reputation',
              overallRating: newOverall,
              predictionRating: newPred,
              hotTakeRating: newTake,
              role: profile.role || 'FREE',
              season: 'World Cup 2026'
            }
          });
        } else {
          // Update profile ratings
          dbProfile = await prisma.footballIQProfile.update({
            where: { id: dbProfile.id },
            data: {
              overallRating: newOverall,
              predictionRating: newPred,
              hotTakeRating: newTake
            }
          });
        }

        // Upsert Match Prediction (unique on [profileId, matchId])
        const dbPrediction = await prisma.matchPrediction.upsert({
          where: {
            profileId_matchId: {
              profileId: dbProfile.id,
              matchId,
            },
          },
          create: {
            profileId: dbProfile.id,
            matchId,
            homeScore: predHomeScore,
            awayScore: predAwayScore,
            firstGoalscorer: predScorer,
            motm: predMotm,
            possessionWinner: predPossession,
          },
          update: {
            homeScore: predHomeScore,
            awayScore: predAwayScore,
            firstGoalscorer: predScorer,
            motm: predMotm,
            possessionWinner: predPossession,
          },
        });

        // Save Hot Takes
        for (const take of statements) {
          await prisma.hotTake.create({
            data: {
              predictionId: dbPrediction.id,
              statement: take.statement,
              confidence: take.confidence
            }
          });
        }

        // Save Card
        await prisma.matchCard.create({
          data: {
            id: cardId,
            profileId: dbProfile.id,
            matchId,
            rating: cardOvr,
            verdict: verdictText,
            charge: cardPayload.charge,
            evidence: cardPayload.evidence,
            sentence: cardPayload.sentence,
            rarity,
            statsJson: cardPayload.statsJson,
            cardTheme
          }
        });
      }
    } catch (dbError) {
      console.warn('Prisma Database Offline. Proceeding with in-memory response:', dbError);
    }

    return NextResponse.json({
      success: true,
      card: cardPayload,
      profileUpdates: {
        predictionRating: newPred,
        hotTakeRating: newTake,
        overallRating: newOverall,
        predictionDelta,
        hotTakeDelta,
        overallDelta
      },
      gradedTakes,
      actualResult: result
    });

  } catch (error) {
    console.error('Error in /api/resolve-match:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
