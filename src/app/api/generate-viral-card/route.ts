import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/authSession';

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

  // IMPORTANT: Do NOT describe the face, hair, skin, eyes, or any physical features
  // in this prompt. The reference image is the SOLE identity source for the subject.
  // Any face description in text OVERRIDES the reference and causes hallucination.
  return (
    // ── TASK: tell the model what to DO, not who the person IS ────────────────
    `Transform the reference image into a premium EA Sports FC trading card portrait. ` +
    `Use the face from the reference image exactly as-is — same face, same features, ` +
    `same expression — just place the person in a new setting as described below. ` +

    // ── FRAMING ───────────────────────────────────────────────────────────────
    `Framing: Waist-up medium portrait shot. Head in the upper-center of the frame, ` +
    `filling about 35–40% of the canvas height. Slight three-quarter body turn ` +
    `for a dynamic sports-card look. Jersey fully visible from collar to waist. ` +

    // ── CLOTHING: this is the ONLY thing being changed from the reference ──────
    `Change clothing only: dress the subject in the official ${nation} national football ` +
    `team jersey. The jersey should have realistic fabric texture, visible team badge, ` +
    `collar, and sleeve details. Keep everything above the neckline identical to the reference. ` +

    // ── LIGHTING ──────────────────────────────────────────────────────────────
    `Lighting: Professional three-point studio lighting — bright warm key light ` +
    `from front-left, soft fill from right, subtle warm gold rim light on shoulders and hair. ` +
    `Face and jersey both well-lit, vibrant, not dark or moody. ` +

    // ── BACKGROUND ────────────────────────────────────────────────────────────
    `Background: Dark navy-to-black radial gradient with a warm amber-gold spotlight ` +
    `glow behind the subject. Minimal and atmospheric — no patterns, no particles, no text. ` +

    // ── STYLE ─────────────────────────────────────────────────────────────────
    `Photorealistic output — looks like a real professional sports photograph, ` +
    `not an illustration or CGI render. Accurate skin texture, natural lighting, sharp details. ` +

    // ── HARD CONSTRAINTS ──────────────────────────────────────────────────────
    `IMPORTANT: Do NOT change the person's face, skin tone, hair, or any facial feature. ` +
    `Do NOT add glasses if they are not in the reference. ` +
    `Do NOT add facial hair if not in the reference. ` +
    `Do NOT change ethnicity or skin tone. ` +
    `No card frames, no text, no UI elements, no flags, no ratings.`
  );
}

export async function POST(request: Request) {
  try {
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

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

    if (username && String(username) !== auth.session.username) {
      return NextResponse.json({ error: 'Cannot generate artwork for another manager.' }, { status: 403 });
    }

    const nation = favoriteNation || 'Argentina';
    const ovr    = overallRating   ?? 50;
    const prd    = predictionRating ?? 50;
    const hot    = hotTakeRating    ?? 50;
    const mgr    = managerRating    ?? tacticalRating ?? 50;
    const rst    = roastScore       ?? communityRating ?? Math.max(50, Math.min(99, ovr + 1));

    let aiImageUrl = '';

    const prompt = buildCompleteFifacardPrompt({
      username: auth.session.username.toUpperCase(),
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
          username: auth.session.username.toUpperCase(),
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
      // Build the full image data URL for the face reference
      const faceDataUrl = faceImage
        ? (faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`)
        : null;

      // Use /v1/images with input_references — confirmed by the BFL endpoint capability query:
      // GET /api/v1/images/models/black-forest-labs/flux.2-pro/endpoints shows
      // input_references is supported (min:0, max:8). The reference is used by
      // Flux.2 Pro for visual identity/face preservation across the generation.
      const response = await fetch('https://openrouter.ai/api/v1/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.live',
          'X-Title': 'BallKnowledge World Cup 2026',
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          aspect_ratio: '3:4',
          output_format: 'jpeg',
          safety_tolerance: 6, // passthrough param — maximum permissiveness
          // Face reference image for identity preservation
          ...(faceDataUrl ? {
            input_references: [{
              type: 'image_url',
              image_url: { url: faceDataUrl },
            }],
          } : {}),
        }),
        signal: AbortSignal.timeout(55_000),
      });

      if (response.ok) {
        const data = await response.json();
        aiImageUrl = data?.data?.[0]?.url ?? '';
        if (!aiImageUrl && data?.data?.[0]?.b64_json) {
          aiImageUrl = `data:image/jpeg;base64,${data.data[0].b64_json}`;
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
        const update = await prisma.matchCard.updateMany({
          where: { id: cardId, profileId: auth.session.profileId },
          data: { aiImageUrl }
        });
        if (update.count === 0) {
          return NextResponse.json({ error: 'Card not found for authenticated manager.' }, { status: 404 });
        }
      } catch (dbError) {
        console.warn('Failed to update MatchCard with aiImageUrl:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      aiImageUrl,
      cardConfig: {
        username: auth.session.username.toUpperCase(),
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
