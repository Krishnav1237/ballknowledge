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

  // The card frame itself is always gold and royal blue for the manager card layout.
  // We use a clean, subtle gold and royal blue background to blend in perfectly with the borders without clashing or clutter.
  const rarityBackgroundDesc = "A clean, minimal, and elegant dark metallic background with a subtle royal blue wash and soft gold spotlights. The background must be simple and non-cluttered, with NO complex busy textures, NO heavy graphics, and NO massive floating particles.";

  return (
    `A premium, ultra-high-fidelity, photorealistic EA Sports FC TOTY style player card portrait of a professional soccer player. ` +
    `Subject & Pose: Upper-body action portrait of the athlete. The player's torso is positioned at a subtle, natural angle (three-quarter turn) to give a dynamic and premium sports card look, with their head slightly turned toward the camera. It must NOT look like a flat, straight passport photo. ` +
    `Framing & Shot Type: The camera must be zoomed out to a medium shot or chest-up portrait (do NOT generate a close-up or headshot). The player's head, full neck, shoulders, and chest must be fully visible. There must be significant headroom (empty space) above their head so it doesn't touch the top edge. The player's head must occupy only about 25% of the vertical canvas height, leaving the rest of the canvas to display their jersey clearly down to their mid-chest. ` +
    `Face Preservation: Strictly replicate the face from the input reference image. The face must be seamlessly mapped onto the head at the natural angle, maintaining a 100% exact match of the person in the reference image (a young clean-shaven Asian/Indian male, zero stubble, zero beard, zero mustache, and clear transparent-framed glasses exactly as shown, with thin transparent rims). Preserve all unique facial features, eye shape, nose shape, and mouth shape precisely, with zero alterations or cartoonish distortions. ` +
    `Clothing: Wearing the official custom ${nation} national team jersey/kit, with detailed fabric textures, collar seams, and logos clearly visible. ` +
    `Lighting & Visibility: Extremely clean, bright studio spotlight lighting that clearly illuminates both the player's face and the details of their jersey, with a soft gold rim light outline. The lighting must be balanced and even, showing both face and jersey detail vividly. ` +
    `Background: ${rarityBackgroundDesc} ` +
    `CRITICAL: The output must contain ONLY the player's upper-body and the abstract background. Do NOT generate any borders, card frames, text overlays, rating numbers, flags, circular crops, or user interface elements. The portrait must be clean and fill the entire 3:4 canvas.`
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
        signal: AbortSignal.timeout(25_000),
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
