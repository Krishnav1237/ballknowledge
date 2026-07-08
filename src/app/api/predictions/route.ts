import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    const body = await request.json();
    const { matchId, homeScore, awayScore, firstGoalscorer, motm, possessionWinner, hotTakes, lineup } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required.' }, { status: 400 });
    }

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
            matchId,
          },
        },
        create: {
          profileId: profile.id,
          matchId,
          homeScore: typeof homeScore === 'number' ? homeScore : parseInt(homeScore) || 0,
          awayScore: typeof awayScore === 'number' ? awayScore : parseInt(awayScore) || 0,
          firstGoalscorer: firstGoalscorer || '',
          motm: motm || '',
          possessionWinner: String(possessionWinner || ''),
          lineup: lineup !== undefined ? lineup : undefined,
        },
        update: {
          homeScore: typeof homeScore === 'number' ? homeScore : parseInt(homeScore) || 0,
          awayScore: typeof awayScore === 'number' ? awayScore : parseInt(awayScore) || 0,
          firstGoalscorer: firstGoalscorer || '',
          motm: motm || '',
          possessionWinner: String(possessionWinner || ''),
          lineup: lineup !== undefined ? lineup : undefined,
        },
      });

      // 3. Save Hot Takes (delete old ones, recreate)
      await tx.hotTake.deleteMany({
        where: { predictionId: dbPrediction.id }
      });

      if (hotTakes && Array.isArray(hotTakes)) {
        const validTakes = hotTakes.filter((t: any) => t && t.statement && String(t.statement).trim() !== '');
        if (validTakes.length > 0) {
          await tx.hotTake.createMany({
            data: validTakes.map((t: any) => {
              const conf = typeof t.confidence === 'number' ? t.confidence : parseInt(t.confidence, 10);
              const confidenceVal = isNaN(conf) ? 3 : Math.max(1, Math.min(5, conf));
              return {
                predictionId: dbPrediction.id,
                statement: String(t.statement).trim(),
                confidence: confidenceVal,
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
