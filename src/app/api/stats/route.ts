import { NextResponse } from 'next/server';
import { getBoardSnapshot } from '@/lib/boardSnapshot';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await getBoardSnapshot(50);
  return NextResponse.json(
    {
      takes: snapshot.stats.takes,
      cases: snapshot.stats.cases,
      cards: snapshot.stats.cards,
      degraded: snapshot.degraded || undefined,
    },
    {
      headers: {
        'Cache-Control': snapshot.degraded
          ? 'no-store'
          : 'public, s-maxage=15, stale-while-revalidate=60',
      },
    },
  );
}
