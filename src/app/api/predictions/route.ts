import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

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
  if (input === undefined || input === null) return undefined;
  if (typeof input !== 'object' || Array.isArray(input)) return undefined;

  const serialized = JSON.stringify(input);
  if (serialized.length > 100_000) return undefined;
  return input;
}

export async function POST(request: Request) {
  try {
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid prediction payload.' }, { status: 400 });
    }

    const { matchId, homeScore, awayScore, firstGoalscorer, motm, possessionWinner, hotTakes, lineup } = body;
    const safeMatchId = cleanMatchId(matchId);

    if (!safeMatchId) {
      return NextResponse.json({ error: 'A valid matchId is required.' }, { status: 400 });
    }

    const safePrediction = {
      homeScore: clampInteger(homeScore, 0, 0, 99),
      awayScore: clampInteger(awayScore, 0, 0, 99),
      firstGoalscorer: cleanText(firstGoalscorer, 120),
      motm: cleanText(motm, 120),
      possessionWinner: cleanText(possessionWinner, 20),
      lineup: cleanLineup(lineup),
    };

    // 1. Resolve author profile
    const profile = await prisma.footballIQProfile.findUnique({
      where: { id: auth.session.profileId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Authenticated profile not found.' }, { status: 404 });
    }

    // 2. Upsert Match Prediction and Hot Takes atomically inside a transaction
    let updatedPrediction = null;
    await prisma.$transaction(async (tx) => {
      const dbPrediction = await tx.matchPrediction.upsert({
        where: {
          profileId_matchId: {
            profileId: profile.id,
            matchId: safeMatchId,
          },
        },
        create: {
          profileId: profile.id,
          matchId: safeMatchId,
          homeScore: safePrediction.homeScore,
          awayScore: safePrediction.awayScore,
          firstGoalscorer: safePrediction.firstGoalscorer,
          motm: safePrediction.motm,
          possessionWinner: safePrediction.possessionWinner,
          lineup: safePrediction.lineup,
        },
        update: {
          homeScore: safePrediction.homeScore,
          awayScore: safePrediction.awayScore,
          firstGoalscorer: safePrediction.firstGoalscorer,
          motm: safePrediction.motm,
          possessionWinner: safePrediction.possessionWinner,
          lineup: safePrediction.lineup,
        },
      });

      // 3. Save Hot Takes (delete old ones, recreate)
      await tx.hotTake.deleteMany({
        where: { predictionId: dbPrediction.id }
      });

      if (hotTakes && Array.isArray(hotTakes)) {
        const validTakes = hotTakes
          .slice(0, 5)
          .filter((t: any) => t && cleanText(t.statement, 280) !== '');
        if (validTakes.length > 0) {
          await tx.hotTake.createMany({
            data: validTakes.map((t: any) => {
              return {
                predictionId: dbPrediction.id,
                statement: cleanText(t.statement, 280),
                confidence: clampInteger(t.confidence, 3, 1, 5),
              };
            })
          });
        }
      }

      updatedPrediction = await tx.matchPrediction.findUnique({
        where: { id: dbPrediction.id },
        include: { hotTakes: true }
      });
    });

    return NextResponse.json({
      success: true,
      prediction: updatedPrediction
    });

  } catch (error) {
    console.error('Error in POST /api/predictions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
