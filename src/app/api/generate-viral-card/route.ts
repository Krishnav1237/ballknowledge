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
}) {
  const { nation } = params;

  // A highly specific prompt tuned for FIFA card abstract backgrounds
  return (
    `Premium soccer trading card background artwork inspired by the colors and pride of ${nation}. ` +
    `EA Sports FIFA Team of the Year (TOTY) card art style, featuring abstract cosmic swirling dark blue and gold/bronze rings, ` +
    `glowing sapphire blue crystals, dynamic 3D stadium spotlight beams, floating particle effects, professional sports graphic design. ` +
    `High-contrast glowing texture, cinematic lighting, ultra-detailed 8k render. ` +
    `Strictly abstract background texture, NO people, NO faces, NO player cutouts, NO text.`
  );
}

export async function POST(request: Request) {
  try {
    const {
      cardId,           // optional database MatchCard ID to persist to
      username,
      faceImage,        // base64 face upload (used client-side; echoed back for card render)
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
        const prompt = buildCardPrompt({ nation, ovr });

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
          signal: AbortSignal.timeout(25_000), // 25s — Flux Pro can be slow
        });

        if (response.ok) {
          const data = await response.json();
          aiImageUrl = data?.data?.[0]?.url ?? data?.data?.[0]?.b64_json ?? '';
          if (data?.data?.[0]?.b64_json && !aiImageUrl.startsWith('http')) {
            // Some models return base64; prefix it so the client can use it directly
            aiImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
          }

          // If a cardId is provided, persist it to the database so it's shared permanently
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
      aiImageUrl,               // empty string if key missing or gen failed
      cardConfig: {
        username: username.toUpperCase(),
        faceImage,              // echoed back for client-side JerseyAvatar render
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
