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
  const { nation, ovr } = params;

  // Determine rarity background color scheme
  let rarityBackgroundDesc = '';
  if (ovr >= 90) {
    // Legendary / TOTY
    rarityBackgroundDesc = "A bright, prestigious, luminous gold and vibrant royal blue abstract stadium background, featuring glowing concentric gold tracks, floating shiny sapphire crystals, and powerful golden spotlight beams illuminating the player.";
  } else if (ovr >= 75) {
    // Epic / Purple
    rarityBackgroundDesc = "A bright, high-contrast violet-neon and dynamic indigo background, featuring glowing geometric energy rings, star field lights, and bright violet spotlights.";
  } else if (ovr >= 60) {
    // Rare / Blue
    rarityBackgroundDesc = "A bright, futuristic electric cyan-blue background, featuring glowing digital grid tracks, bright neon light bands, and luminous stadium floodlights.";
  } else {
    // Common / Rose
    rarityBackgroundDesc = "A bright, clean crimson-rose and light gray textured background, featuring vivid ruby-red spotlights, clean light beams, and soft studio background lighting.";
  }

  return (
    `A premium, ultra-high-fidelity, photorealistic EA Sports FC TOTY style player card portrait of a professional soccer player. ` +
    `Subject: Upper-body action portrait of the athlete, angled in a dynamic three-quarter view, looking towards the camera with a confident, natural expression. ` +
    `Framing & Composition: The player's head and face must be positioned vertically in the middle-upper center of the image, leaving significant empty space (headroom) above the top of their head so their face is not too close to the top edge. ` +
    `Face Preservation: Strictly replicate the face features of the person in the input reference image. The player MUST be completely clean-shaven (no beard, no stubble, no mustache, no facial hair whatsoever). They MUST wear their transparent clear-framed glasses exactly as shown in the reference image. The facial skin tones, glasses transparency, clean-shaven youth look, and hair style must match the reference image exactly. ` +
    `Clothing: Wearing the official custom ${nation} national team jersey/kit, with detailed fabric textures, collar seams, and logos clearly visible. ` +
    `Lighting & Visibility: Extremely bright, vivid studio spotlight lighting illuminating the player's face, neck, and jersey from the front and side. Use a striking gold rim light tracing his profile to pop him out of the background. Ensure the face and jersey are fully, brightly lit with no dark face shadows. ` +
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
