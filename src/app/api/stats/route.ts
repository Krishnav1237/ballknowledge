import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const verdictCount = await prisma.verdict.count();
    const caseCount = await prisma.courtCase.count();
    const prophecyCount = await prisma.prophecy.count();

    // Sum of visits and challenges
    const aggregates = await prisma.verdict.aggregate({
      _sum: {
        visitsCount: true,
        challengesCount: true,
        battlesWonCount: true
      }
    });

    const totalVisits = aggregates._sum.visitsCount || 0;
    const totalChallenges = aggregates._sum.challengesCount || 0;
    const totalBattlesWon = aggregates._sum.battlesWonCount || 0;

    return NextResponse.json({
      takes: 284910 + verdictCount,
      cases: 49122 + caseCount,
      cards: 183440 + verdictCount + prophecyCount,
      viral: {
        totalVisits,
        totalChallenges,
        totalBattlesWon,
        challengeRate: verdictCount > 0 ? (totalChallenges / verdictCount) * 100 : 0
      }
    });
  } catch (error) {
    console.warn('PostgreSQL stats count query failed, falling back to static baseline:', error);
    return NextResponse.json({
      takes: 284910,
      cases: 49122,
      cards: 183440,
      viral: {
        totalVisits: 0,
        totalChallenges: 0,
        totalBattlesWon: 0,
        challengeRate: 0
      }
    });
  }
}
