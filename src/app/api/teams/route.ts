import { NextResponse } from 'next/server';
import { fetchPremierLeagueTeams } from '@/lib/premierLeagueData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teams = await fetchPremierLeagueTeams();
    return NextResponse.json(teams, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('API teams error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
