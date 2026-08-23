import { NextResponse } from 'next/server';
import { getBoardSnapshot, type LeaderboardEntry } from '@/lib/boardSnapshot';

export const dynamic = 'force-dynamic';

export type { LeaderboardEntry };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let limitVal = parseInt(searchParams.get('limit') || '50', 10);
  if (Number.isNaN(limitVal) || limitVal < 1) limitVal = 50;
  const limit = Math.min(limitVal, 100);

  const snapshot = await getBoardSnapshot(limit);
  return NextResponse.json(
    {
      entries: snapshot.entries,
      total: snapshot.entries.length,
      sortBy: 'overall',
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
