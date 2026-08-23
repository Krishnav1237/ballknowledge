import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [profileCount, cardCount, hotTakeCount] = await Promise.all([
      prisma.footballIQProfile.count(),
      prisma.matchCard.count(),
      prisma.hotTake.count(),
    ]);

    return NextResponse.json({
      takes: hotTakeCount,
      cases: profileCount,
      cards: cardCount,
    });
  } catch {
    return NextResponse.json({
      takes: 0,
      cases: 0,
      cards: 0,
      degraded: true,
    });
  }
}
