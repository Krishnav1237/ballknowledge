import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/authSession';
import { fetchWorldCupMatches } from '@/lib/worldcupData';

export const dynamic = 'force-dynamic';

const SIMULATED_MANAGERS = [
  'TacticalMaster',
  'VARTribunal'
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

// ── LLM Chat bot client call logic ──────────────────────────────────────────

async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('No OpenRouter key');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.live',
      'X-Title': 'BallKnowledge Live Chat Bot',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 150,
    }),
    signal: AbortSignal.timeout(6000), // 6s timeout for fast responsiveness
  });
  if (!response.ok) throw new Error('OpenRouter failed');
  const data = await response.json();
  return String(data.choices[0].message.content).trim();
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error('No Groq key');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 150,
    }),
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error('Groq failed');
  const data = await response.json();
  return String(data.choices[0].message.content).trim();
}

async function getChatBotResponse(
  botName: string,
  matchContext: string,
  chatHistory: string,
  userMessage: string
): Promise<string> {
  const systemPrompt = botName === 'TacticalMaster'
    ? 'You are "TacticalMaster", a highly analytical and technical football coach/analyst inside a live chat room. You talk in jargon: low block, rest defense, xG, vertical packing, transitions, half-spaces, high-press triggers. You are slightly smug, thinking you are a tactical genius. Respond with a quick, punchy chat message (max 140 chars). Do not include any prefix or quotation marks.'
    : 'You are "VARTribunal", a hot-headed, passionate football fan and referee watch-dog inside a live chat. You talk in caps, use emojis (🤬, 😤, 🤡, 🤷‍♂️), and constantly complain about refereeing, diving, VAR decisions, and "corruption" or how "the game is gone". Respond with a quick, punchy chat message (max 140 chars). Do not include any prefix or quotation marks.';

  const userPrompt = `
Match Context:
${matchContext}

Recent chat messages:
${chatHistory}

New user message:
"${userMessage}"

Generate your response:`;

  const attempts = [
    () => process.env.OPENROUTER_API_KEY ? callOpenRouter(systemPrompt, userPrompt) : Promise.reject(new Error('No key')),
    () => process.env.GROQ_API_KEY ? callGroq(systemPrompt, userPrompt) : Promise.reject(new Error('No key')),
  ];

  for (const attempt of attempts) {
    try {
      const res = await attempt();
      if (res) return res.replace(/^["']|["']$/g, '').trim(); // strip quotation wraps
    } catch {
      // try next
    }
  }

  // Fallback to local simulated banter
  return SIMULATED_BANTER[Math.floor(Math.random() * SIMULATED_BANTER.length)];
}

async function getMatchContext(matchId: string): Promise<string> {
  try {
    const matches = await fetchWorldCupMatches();
    const match = matches.find(m => String(m.id) === String(matchId));
    if (!match) return `Match ID: ${matchId}`;
    const status = match.finished === 'TRUE' ? 'COMPLETED' : 'LIVE/UPCOMING';
    return `${match.home_team_name_en || 'Home'} vs ${match.away_team_name_en || 'Away'} (${status})
Score: ${match.home_score || '0'} - ${match.away_score || '0'}
Home Scorers: ${match.home_scorers || 'None'}
Away Scorers: ${match.away_scorers || 'None'}`;
  } catch {
    return `Match ID: ${matchId}`;
  }
}

// Helper to format chat history for context
function formatChatHistory(messages: any[]): string {
  return messages
    .slice(-6)
    .map(m => `${m.profile?.username || m.author || 'User'}: ${m.text}`)
    .join('\n');
}

// ── GET Route ───────────────────────────────────────────────────────────────

export async function GET(
  _request: Request,
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

    // 2. Dynamic DB Banter: inject a bot message only if:
    //    - chat is completely empty, OR
    //    - last message (real or bot) was >5 minutes ago (rate limit to prevent DB bloat)
    const now = new Date();
    const lastMsg = messages[messages.length - 1];
    const lastMsgAge = lastMsg ? now.getTime() - new Date(lastMsg.createdAt).getTime() : Infinity;
    const shouldInject =
      messages.length === 0 ||
      (messages.length < 50 && lastMsgAge > 5 * 60 * 1000); // 5-minute cooldown

    if (shouldInject) {
      try {
        const randomName = SIMULATED_MANAGERS[Math.floor(Math.random() * SIMULATED_MANAGERS.length)];
        const matchCtx = await getMatchContext(matchId);
        const historyStr = formatChatHistory(messages);
        
        const randomText = await getChatBotResponse(
          randomName,
          matchCtx,
          historyStr,
          "Banter conversation starter"
        );
        
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
        author: m.profile?.username || 'Anonymous',
        text: m.text,
        timestamp: new Date(m.createdAt).getTime(),
        reactions: (m.reactions as Record<string, number>) || {},
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

// ── POST Route ──────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    const { matchId } = await params;
    const body = await request.json();
    const { text, action, messageId, emoji } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'MatchId is required.' }, { status: 400 });
    }

    if (action === 'react') {
      if (!messageId || !emoji) {
        return NextResponse.json({ error: 'MessageId and emoji are required.' }, { status: 400 });
      }

      const message = await prisma.chatMessage.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
      }

      const reactions = (message.reactions as Record<string, number>) || {};
      reactions[emoji] = (reactions[emoji] || 0) + 1;

      const updatedMsg = await prisma.chatMessage.update({
        where: { id: messageId },
        data: {
          reactions,
          upvotes: { increment: 1 }
        }
      });

      return NextResponse.json({
        success: true,
        message: {
          id: updatedMsg.id,
          matchId: updatedMsg.matchId,
          text: updatedMsg.text,
          reactions: updatedMsg.reactions,
          upvotes: updatedMsg.upvotes
        }
      });
    }

    if (!text) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
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

    // 3. Asynchronously trigger a dynamic LLM bot response!
    // We run it as a detached background promise so the user's POST completes instantly.
    // The bot's reply will show up in the client's next poll request (every 3 seconds).
    (async () => {
      try {
        const randomName = SIMULATED_MANAGERS[Math.floor(Math.random() * SIMULATED_MANAGERS.length)];
        const botProfile = await getOrCreateSimulatedProfile(randomName);

        const matchCtx = await getMatchContext(matchId);

        // Fetch 8 MOST RECENT messages for context (not 8 oldest)
        const recentMessages = await prisma.chatMessage.findMany({
          where: { matchId },
          orderBy: { createdAt: 'desc' },
          take: 8
        });
        // Reverse so oldest-first for chat history formatting
        const historyStr = formatChatHistory(recentMessages.reverse());

        const botReplyText = await getChatBotResponse(
          randomName,
          matchCtx,
          historyStr,
          String(text).trim()
        );

        await prisma.chatMessage.create({
          data: {
            matchId,
            profileId: botProfile.id,
            text: botReplyText
          }
        });
      } catch (botErr) {
        console.error('[Chat API Bot Reply Error]:', botErr);
      }
    })();

    return NextResponse.json({
      success: true,
      message: {
        id: msg.id,
        matchId: msg.matchId,
        author: msg.profile.username,
        text: msg.text,
        timestamp: new Date(msg.createdAt).getTime(),
        reactions: (msg.reactions as Record<string, number>) || {},
        type: 'message'
      }
    });

  } catch (error) {
    console.error('[Chat POST API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
