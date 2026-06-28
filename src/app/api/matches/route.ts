import { NextResponse } from 'next/server';
import { fetchWorldCupMatches } from '@/lib/worldcupData';

export async function GET() {
  try {
    const matches = await fetchWorldCupMatches();
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
