import { NextResponse } from 'next/server';
import { fetchPremierLeagueMatches } from '@/lib/premierLeagueData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const matches = await fetchPremierLeagueMatches();
    return NextResponse.json(matches, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('API matches error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
