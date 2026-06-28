import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Builds an immersive prompt for the EA Sports FUT/TOTY trading card background.
 */
function buildCompleteFifacardPrompt(params: {
  username: string;
  nation: string;
  ovr: number;
  prd: number;
  mgr: number;
  hot: number;
  rst: number;
  verdict?: string;
  playerPosition?: string;
}) {
  const { nation } = params;

  return (
    // ── CORE TASK ─────────────────────────────────────────────────────────────
    `A premium photorealistic sports trading card portrait in the style of EA Sports FC. ` +
    `The subject is the person shown in the reference image — reproduce their face accurately: ` +
    `same skin tone, same eye shape, same nose, same jawline, same hair, same thin ` +
    `transparent-framed glasses. Clean-shaven with zero facial hair. ` +

    // ── FRAMING ───────────────────────────────────────────────────────────────
    `Shot type: Natural medium portrait, waist-up. The head fills roughly 35–40% of the ` +
    `canvas height, positioned in the upper-center area. The body is turned at a slight ` +
    `three-quarter angle — dynamic but relaxed, like a professional headshot for a ` +
    `football club media day. Jersey clearly visible from collar to waist. ` +

    // ── CLOTHING ──────────────────────────────────────────────────────────────
    `Clothing: The official ${nation} national football team kit — clean fabric with realistic ` +
    `weave texture, team badge on chest, visible collar and sleeve details. ` +

    // ── LIGHTING ──────────────────────────────────────────────────────────────
    `Lighting: Cinematic studio lighting. Strong warm key light from the front-left that ` +
    `illuminates the face and jersey brightly. Subtle golden rim light on the shoulders ` +
    `and hair. The lighting should make the subject look premium and vibrant, not flat or dark. ` +

    // ── BACKGROUND ────────────────────────────────────────────────────────────
    `Background: A rich deep dark navy-to-black radial gradient with a warm amber-gold ` +
    `spotlight glow centered behind the subject. The background should complement a gold ` +
    `card border — atmospheric, premium, and non-distracting. No patterns, no particles, ` +
    `no text. ` +

    // ── STYLE ─────────────────────────────────────────────────────────────────
    `Style: Photorealistic — the output must look like a real studio photo, not a digital ` +
    `illustration or game asset. Realistic skin, sharp fabric detail, natural expressions. ` +

    // ── CONSTRAINTS ───────────────────────────────────────────────────────────
    `Do NOT include card borders, rating numbers, text, flags, watermarks, UI overlays, ` +
    `or any design elements. Clean portrait filling the full canvas, edge to edge.`
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
      playerPosition,
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

    const prompt = buildCompleteFifacardPrompt({
      username: username.toUpperCase(),
      nation,
      ovr,
      prd,
      mgr,
      hot,
      rst,
      verdict,
      playerPosition,
    });

    // ─── Local template fallback if OpenRouter key is missing ───
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key is missing. Falling back to local template background.');
      return NextResponse.json({
        success: true,
        aiImageUrl: '/images/toty_bg_premium.webp',
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
    }

    // ──────────────────────────────────────────────────────────────
    // OPENROUTER PROVIDER
    // ──────────────────────────────────────────────────────────────
    const model = process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux.2-pro';

    try {
      const response = await fetch('https://openrouter.ai/api/v1/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ballknowledge.vercel.app',
          'X-Title': 'BallKnowledge World Cup 2026',
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          aspect_ratio: '3:4',
          input_references: faceImage ? [{
            type: "image_url",
            image_url: {
              url: faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`
            }
          }] : []
        }),
        signal: AbortSignal.timeout(50_000),
      });

      if (response.ok) {
        const data = await response.json();
        aiImageUrl = data?.data?.[0]?.url ?? data?.data?.[0]?.b64_json ?? '';
        if (data?.data?.[0]?.b64_json && !aiImageUrl.startsWith('http')) {
          aiImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        }
      } else {
        const errText = await response.text();
        console.warn(`OpenRouter image gen failed (${response.status}):`, errText);
        return NextResponse.json(
          { error: `OpenRouter AI Image Generation failed: ${response.statusText}`, details: errText },
          { status: response.status }
        );
      }
    } catch (err: any) {
      console.error('OpenRouter image generation error:', err);
      return NextResponse.json(
        { error: 'OpenRouter AI image generation timed out or failed to complete', details: err?.message },
        { status: 504 }
      );
    }

    // Persist card URL to DB if matching card found
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

    return NextResponse.json({
      success: true,
      aiImageUrl,
      cardConfig: {
        username: username.toUpperCase(),
        // NOTE: faceImage is NOT returned to the client to keep response payload small.
        // The client should use its own locally-stored avatarSeed for card display.
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
