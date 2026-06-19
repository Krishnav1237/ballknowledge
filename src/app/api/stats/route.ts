import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Static baseline numbers for the community counters on the landing page.
// These are added to real DB counts when available, making the numbers
// feel populated even before the platform has real users.
const BASELINE = {
  takes: 284910,
  cases: 49122,
  cards: 183440,
};

export async function GET() {
  try {
    // Use the actual Football IQ schema models — not the legacy verdict/courtCase/prophecy models
    const [profileCount, cardCount, hotTakeCount] = await Promise.all([
      prisma.footballIQProfile.count(),
      prisma.matchCard.count(),
      prisma.hotTake.count(),
    ]);

    return NextResponse.json({
      takes: BASELINE.takes + hotTakeCount,
      cases: BASELINE.cases + profileCount,
      cards: BASELINE.cards + cardCount,
    });
  } catch {
    // DB is offline or not connected — return static baseline silently.
    // This is expected in local dev without a database.
    return NextResponse.json({
      takes: BASELINE.takes,
      cases: BASELINE.cases,
      cards: BASELINE.cards,
    });
  }
}
