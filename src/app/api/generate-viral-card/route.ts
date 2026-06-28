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
    // ── IDENTITY — this is the #1 priority ──────────────────────────────────
    `HIGHEST PRIORITY: This is a face-matched portrait. The reference image provided is the IDENTITY SOURCE. ` +
    `You MUST faithfully reproduce the subject's exact face with maximum biometric accuracy: ` +
    `same skin tone, same eye shape and eye distance, same nose bridge width and tip shape, ` +
    `same lip thickness, same jawline, same cheekbone structure, same hairline and hair style, ` +
    `same thin transparent-framed rectangular glasses (do NOT change the frames to any other style). ` +
    `The face must look IDENTICAL to the reference — not a lookalike, not an approximation — IDENTICAL. ` +

    // ── STYLE — strictly photorealistic, zero stylization ────────────────────
    `Art Style: Ultra-high-fidelity PHOTOREALISTIC photography. ` +
    `ABSOLUTELY NO cartoon, anime, illustration, painting, sketch, game-art, CGI-render, ` +
    `plastic-skin, clay-render, watercolor, or any non-photographic stylization whatsoever. ` +
    `The output must look like a REAL PHOTOGRAPH taken with a professional sports camera. ` +
    `Skin texture must show real pores, natural shading, and realistic subsurface scattering. ` +

    // ── FRAMING — medium shot showing jersey ─────────────────────────────────
    `Framing: Medium-shot portrait, chest-and-waist-up view. The player's head occupies roughly ` +
    `30–35% of the canvas height, centered in the upper half. The jersey must be clearly visible ` +
    `from the collar down to the waist. Slight three-quarter body angle for dynamic feel. ` +
    `Do NOT generate a tight headshot or extreme close-up. ` +

    // ── CLOTHING ─────────────────────────────────────────────────────────────
    `Clothing: Official ${nation} national football team jersey with realistic fabric texture, ` +
    `visible seams, Adidas/Nike logo, and sponsor badge. Clean-shaven face with zero stubble. ` +

    // ── LIGHTING & BACKGROUND ────────────────────────────────────────────────
    `Lighting: Professional studio three-point lighting — bright key light from front-left, ` +
    `soft fill from right, and a subtle warm gold rim light outlining the shoulders. ` +
    `Background: Clean dark metallic gradient with a subtle deep navy-blue vignette and faint ` +
    `gold ambient glow. Minimal and non-distracting — no particles, no text, no UI elements. ` +

    // ── HARD CONSTRAINTS ─────────────────────────────────────────────────────
    `CRITICAL CONSTRAINTS: Output ONLY the player portrait against the background. ` +
    `Do NOT add card frames, rating numbers, text overlays, flags, watermarks, or borders. ` +
    `The canvas must be filled edge-to-edge with the portrait and background only.`
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
