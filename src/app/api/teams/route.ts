import { NextResponse } from 'next/server';
import { fetchWorldCupTeams } from '@/lib/worldcupData';

export async function GET() {
  try {
    const teams = await fetchWorldCupTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('API teams error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
