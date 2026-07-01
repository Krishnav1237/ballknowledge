import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

const SIMULATED_MANAGERS = [
  'TacticalMaster',
  'VARTribunal',
  'PepFanatic',
  'ElSocio',
  'Capitano',
  'Gegenpresser',
  'FalseNine',
  'JoseParkedBus',
  'SpecialOne',
  'AncelottiEyebrow',
  'KloppHugging',
  'ParkTheDoubleBus'
];

const SIMULATED_BANTER = [
  'Ref is absolute garbage today 🤬',
  'What a goal! World class finish 🚀⚽',
  'VAR checking... please don\'t ruin this 🙏',
  'Offside by a millimeter, game is gone 😤',
  'PARK THE BUS TACTICS IS REAL FOOTBALL 🚌',
  'Absolute dive, give him a yellow card 🎭',
  'How did he miss that open goal?! 💀',
  'Tactical masterclass from the home side today.',
  'We need substitutions immediately, the midfield is ghosting 👻',
  'What a pass! Absolute vision 👁️',
  'Is it just me or is this match of the tournament? 🔥',
  'This is why we love the World Cup 🏆🐐',
  'Defending is non-existent, love to see it 😂',
  'VAR is saving them again, unbelievable 🙄'
];

async function getOrCreateSimulatedProfile(username: string) {
  let profile = await prisma.footballIQProfile.findUnique({
    where: { username }
  });
  if (!profile) {
    profile = await prisma.footballIQProfile.create({
      data: {
        username,
        avatarStyle: 'fun-emoji',
        avatarSeed: username,
        favoriteClub: 'VAR FC',
        favoriteNation: 'Germany',
        overallRating: Math.floor(Math.random() * 25) + 60,
        role: 'FREE',
        season: 'World Cup 2026'
      }
    });
  }
  return profile;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    if (!matchId) {
      return NextResponse.json({ error: 'MatchId is required.' }, { status: 400 });
    }

    // 1. Fetch chat messages from the database
    const messages = await prisma.chatMessage.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        profile: {
          select: {
            username: true,
            avatarStyle: true,
            avatarSeed: true
          }
        }
      }
    });

    // 2. Dynamic DB Banter Injected organically:
    // If empty or if last message was sent > 15 seconds ago, let a simulated manager speak!
    const now = new Date();
    const shouldInject =
      messages.length === 0 ||
      (messages.length < 50 && now.getTime() - new Date(messages[messages.length - 1].createdAt).getTime() > 25000);

    if (shouldInject) {
      try {
        const randomName = SIMULATED_MANAGERS[Math.floor(Math.random() * SIMULATED_MANAGERS.length)];
        const randomText = SIMULATED_BANTER[Math.floor(Math.random() * SIMULATED_BANTER.length)];
        const botProfile = await getOrCreateSimulatedProfile(randomName);

        const newMsg = await prisma.chatMessage.create({
          data: {
            matchId,
            profileId: botProfile.id,
            text: randomText
          },
          include: {
            profile: {
              select: {
                username: true,
                avatarStyle: true,
                avatarSeed: true
              }
            }
          }
        });
        messages.push(newMsg);
      } catch (dbErr) {
        console.warn('[Chat API] Failed to inject dynamic banter:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        matchId: m.matchId,
        author: m.profile.username,
        text: m.text,
        timestamp: new Date(m.createdAt).getTime(),
        reactions: {},
        type: 'message'
      }))
    });

  } catch (error) {
    console.error('[Chat GET API] Error:', error);
    return NextResponse.json({
      success: true,
      degraded: true,
      messages: [],
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    const { matchId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!matchId || !text) {
      return NextResponse.json({ error: 'MatchId and text are required.' }, { status: 400 });
    }

    // 1. Resolve author profile
    const profile = await prisma.footballIQProfile.findUnique({
      where: { id: auth.session.profileId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Authenticated profile not found.' }, { status: 404 });
    }

    // 2. Create the message in database
    const msg = await prisma.chatMessage.create({
      data: {
        matchId,
        profileId: profile.id,
        text: String(text).trim().slice(0, 280)
      },
      include: {
        profile: {
          select: {
            username: true,
            avatarStyle: true,
            avatarSeed: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: {
        id: msg.id,
        matchId: msg.matchId,
        author: msg.profile.username,
        text: msg.text,
        timestamp: new Date(msg.createdAt).getTime(),
        reactions: {},
        type: 'message'
      }
    });

  } catch (error) {
    console.error('[Chat POST API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
