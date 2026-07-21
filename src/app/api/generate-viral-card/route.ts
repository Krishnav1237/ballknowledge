import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/authSession';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

function cleanText(input: unknown, maxLength: number) {
  return String(input ?? '').trim().slice(0, maxLength);
}

function normalizeFaceImage(input: unknown) {
  if (!input) return null;
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (trimmed.length > 7_000_000) return '';
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (/^[a-zA-Z0-9+/=\s]+$/.test(trimmed)) {
    return `data:image/jpeg;base64,${trimmed.replace(/\s+/g, '')}`;
  }
  return '';
}

export async function POST(request: Request) {
  try {
    const auth = requireSession(request);
    if (auth.response || !auth.session) return auth.response;

    let body: any;
    try {
      body = await request.json();
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid image generation request payload.', details: error?.message },
        { status: 400 }
      );
    }

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
    } = body;

    if (username && String(username) !== auth.session.username) {
      return NextResponse.json({ error: 'Cannot generate artwork for another manager.' }, { status: 403 });
    }

    const nation = cleanText(favoriteNation, 80) || 'Argentina';
    const faceDataUrl = normalizeFaceImage(faceImage);
    if (faceImage && !faceDataUrl) {
      return NextResponse.json({ error: 'Invalid or oversized face image. Please upload an image under 5MB.' }, { status: 400 });
    }

    const clampRating = (val: any) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? 50 : Math.max(0, Math.min(100, num));
    };

    const ovr    = clampRating(overallRating);
    const prd    = clampRating(predictionRating);
    const hot    = clampRating(hotTakeRating);
    const mgr    = clampRating(managerRating ?? tacticalRating);
    const rst    = clampRating(roastScore ?? communityRating ?? Math.max(50, Math.min(99, ovr + 1)));

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

    // ─── Return error if OpenRouter key is missing ───
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OpenRouter API key is missing.');
      return NextResponse.json(
        { error: 'OpenRouter API key is missing. Please configure OPENROUTER_API_KEY in your environment.' },
        { status: 500 }
      );
    }

    // ──────────────────────────────────────────────────────────────
    // OPENROUTER PROVIDER
    // ──────────────────────────────────────────────────────────────
    const model = process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux.2-pro';

    const makeImageRequest = async (includeReference: boolean) => {
      return await fetch('https://openrouter.ai/api/v1/images', {
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
          safety_tolerance: 6,
          ...(includeReference && faceDataUrl ? {
            input_references: [{
              type: 'image_url',
              image_url: { url: faceDataUrl },
            }],
          } : {}),
        }),
        signal: AbortSignal.timeout(45_000),
      });
    };

    try {
      let response = await makeImageRequest(Boolean(faceDataUrl));

      // If reference request failed (e.g., 502 Bad Gateway from provider on input_references), retry without reference
      if (!response.ok && faceDataUrl) {
        console.warn(`OpenRouter image gen with face reference failed (${response.status}). Retrying without face reference...`);
        response = await makeImageRequest(false);
      }

      if (response.ok) {
        const data = await response.json();
        aiImageUrl = data?.data?.[0]?.url ?? '';
        if (!aiImageUrl && data?.data?.[0]?.b64_json) {
          aiImageUrl = `data:image/jpeg;base64,${data.data[0].b64_json}`;
        }
      } else {
        const errText = await response.text();
        console.error(`OpenRouter image gen failed (${response.status}):`, errText);
        return NextResponse.json(
          {
            error: `OpenRouter image generation failed with status ${response.status}.`,
            details: errText,
          },
          { status: response.status || 500 }
        );
      }
    } catch (err: any) {
      console.error('OpenRouter image generation error:', err);

      // If timeout/error occurred while passing face reference, attempt one final prompt-only fallback
      if (faceDataUrl) {
        try {
          console.warn('Attempting final fallback image generation without face reference...');
          const fallbackRes = await makeImageRequest(false);
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            aiImageUrl = data?.data?.[0]?.url ?? '';
            if (!aiImageUrl && data?.data?.[0]?.b64_json) {
              aiImageUrl = `data:image/jpeg;base64,${data.data[0].b64_json}`;
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback image generation failed:', fallbackErr);
        }
      }

      if (!aiImageUrl) {
        return NextResponse.json(
          {
            error: 'OpenRouter image generation timed out or failed.',
            details: err?.message || String(err),
          },
          { status: 500 }
        );
      }
    }

    // Persist card URL to DB if matching card found
    if (aiImageUrl && cardId) {
      try {
        const update = await prisma.matchCard.updateMany({
          where: { id: cardId, profileId: auth.session.profileId },
          data: { aiImageUrl }
        });
        if (update.count === 0) {
          console.warn(`Card ${cardId} not found to save image, returning URL to client without DB persistence.`);
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
