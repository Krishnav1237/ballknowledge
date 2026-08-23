import { NextResponse } from 'next/server';
import { fetchPremierLeagueTeams } from '@/lib/premierLeagueData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teams = await fetchPremierLeagueTeams();
    return NextResponse.json(teams, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    console.error('API teams error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
