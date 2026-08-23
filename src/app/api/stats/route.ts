import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CHAT_BOT_USERNAMES } from '@/lib/chatList';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [profileCount, cardCount, hotTakeCount] = await Promise.all([
      prisma.footballIQProfile.count({
        where: { username: { notIn: [...CHAT_BOT_USERNAMES] } },
      }),
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
