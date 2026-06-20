import { NextResponse } from 'next/server';
import { fetchWorldCupMatches } from '@/lib/worldcupData';

export async function GET() {
  try {
    const matches = await fetchWorldCupMatches();
    return NextResponse.json(matches, {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('API matches error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
