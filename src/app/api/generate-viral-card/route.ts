import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Generates a personalised viral football card image via OpenRouter.
 *
 * Uses the correct OpenRouter image generation endpoint:
 *   POST /api/v1/images
 *
 * Best models for photorealistic football cards:
 *   - black-forest-labs/flux-1-pro        — best quality, photorealistic (default)
 *   - black-forest-labs/flux-1-schnell    — fast, good quality
 */

const IMAGE_MODEL = 'black-forest-labs/flux-1-pro';

function buildCardPrompt(params: {
  nation: string;
  ovr: number;
  verdict?: string;
  username?: string;
}) {
  const { nation, ovr, verdict } = params;

  // Determine tier aesthetic based on OVR rating
  let tierStyle = 'glowing cosmic sapphire blue and bronze TOTY card texture';
  if (ovr >= 85) {
    tierStyle = 'prestigious glowing gold, champagne diamond crystals, and divine metallic aura';
  } else if (ovr >= 70) {
    tierStyle = 'vibrant ruby crimson, glowing laser beams, and futuristic stadium spotlights';
  }

  // Determine thematic elements based on verdict
  let thematicElements = 'abstract geometric energy lines, floating energy embers, 3D stadium floodlights';
  if (verdict?.toUpperCase().includes('TERRORIST') || verdict?.toUpperCase().includes('DELUSION')) {
    thematicElements = 'dramatic stormy neon lightning bolts, dark crimson embers, intense high-contrast smoke swirls';
  } else if (verdict?.toUpperCase().includes('CHEF') || verdict?.toUpperCase().includes('BALL')) {
    thematicElements = 'golden radiant victory sparks, glowing championship rings, ultra-luxurious sports card geometry';
  }

  return (
    `EA Sports FIFA FUT trading card background graphic design inspired by ${nation} national colors. ` +
    `${tierStyle}, featuring ${thematicElements}. ` +
    `Professional sports graphic design background texture, 3D render, 8k ultra resolution, high contrast cinematic lighting. ` +
    `Strictly abstract background texture, NO people, NO faces, NO player cutouts, NO readable text.`
  );
}

export async function POST(request: Request) {
  try {
    const {
      cardId,           // optional database MatchCard ID to persist to
      username,
      faceImage,        // base64 face upload
      favoriteNation,
      overallRating,
      predictionRating,
      hotTakeRating,
      tacticalRating,
      managerRating,
      communityRating,
      roastScore,
      verdict,
      charge,
      sentence,
    } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const nation = favoriteNation || 'Argentina';
    const ovr    = overallRating   ?? 50;
    const prd    = predictionRating ?? 50;
    const hot    = hotTakeRating    ?? 50;
    const mgr    = managerRating    ?? tacticalRating ?? 50;
    const rst    = roastScore       ?? communityRating ?? Math.max(50, Math.min(99, ovr + 1));

    let aiImageUrl = '';

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = buildCardPrompt({ nation, ovr, verdict, username });

        const response = await fetch('https://openrouter.ai/api/v1/images', {
          method: 'POST',
          headers: {
            'Authorization':  `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type':   'application/json',
            'HTTP-Referer':   'https://ballknowledge.vercel.app',
            'X-Title':        'BallKnowledge World Cup 2026',
          },
          body: JSON.stringify({
            model:  IMAGE_MODEL,
            prompt,
            n:      1,
            aspect_ratio: '3:4',
          }),
          signal: AbortSignal.timeout(25_000), // 25s
        });

        if (response.ok) {
          const data = await response.json();
          aiImageUrl = data?.data?.[0]?.url ?? data?.data?.[0]?.b64_json ?? '';
          if (data?.data?.[0]?.b64_json && !aiImageUrl.startsWith('http')) {
            aiImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
          }

          if (aiImageUrl && cardId) {
            try {
              await prisma.matchCard.update({
                where: { id: cardId },
                data: { aiImageUrl }
              });
            } catch (dbError) {
              console.warn('Failed to update MatchCard with aiImageUrl:', dbError);
            }
          }
        } else {
          const errText = await response.text();
          console.warn(`OpenRouter image gen failed (${response.status}):`, errText);
        }
      } catch (err) {
        console.warn('OpenRouter image generation failed — card will render without AI background:', err);
      }
    } else {
      console.info('OPENROUTER_API_KEY not set — skipping AI image generation.');
    }

    return NextResponse.json({
      success:      true,
      aiImageUrl,
      cardConfig: {
        username: username.toUpperCase(),
        faceImage,
        nation,
        ovr,
        stats: { prd, htk: hot, sel: mgr, cmy: rst },
        statsJson: { prd, mgr, hot, rst },
        verdict,
        charge,
        sentence,
      },
    });

  } catch (error: unknown) {
    console.error('Error in /api/generate-viral-card:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
