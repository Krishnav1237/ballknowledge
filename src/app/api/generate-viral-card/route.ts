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
  const { username, nation, ovr, prd, mgr, hot, rst, verdict, playerPosition } = params;
  const pos = playerPosition || 'MGR';
  const vLabel = verdict || 'KNOWS BALL';

  return (
    `Extremely high-quality, photorealistic portrait of a professional football player, upper-body view, wearing the official custom ${nation} national team jersey/kit in a heroic pose. ` +
    `The player's face should be clearly visible, center frame, realistic skin, matching lighting, with the jersey collar and logo fully visible. ` +
    `The face must be seamlessly and realistically immersed into the athlete's body and jersey collar with no obvious paste-over. ` +
    `Background: Deep midnight sapphire blue textured background with 3D metallic gold swirling rings, glowing blue sapphire crystals, and dynamic stadium spotlights taking up the entire card space. ` +
    `Card Graphic Overlays: Double metallic champagne gold border frame outline in curved FUT shield shape. ` +
    `Integrated card graphics on card face: Top-left overall rating '${ovr}' and position '${pos}' in bold white FUT typography. ` +
    `Player name '${username}' centered below. Verdict badge '${vLabel}' at top. ` +
    `Stats panel at bottom: PRD ${prd}, MGR ${mgr}, HOT ${hot}, RST ${rst}. ` +
    `Cinematic lighting, high-contrast, commercial EA Sports FC TOTY trading card aesthetic, masterpiece, ultra-detailed 8k render.`
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

    const provider = process.env.IMAGE_GENERATION_PROVIDER || 'openrouter';
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

    if (provider === 'fal') {
      // ──────────────────────────────────────────────────────────────
      // FAL.AI PROVIDER
      // ──────────────────────────────────────────────────────────────
      if (!process.env.FAL_API_KEY) {
        return NextResponse.json(
          { error: 'Fal.ai API key is not configured. Please set FAL_API_KEY.', code: 'FAL_KEY_MISSING' },
          { status: 503 }
        );
      }

      // If a face image is uploaded, use image-to-image/face guidance for perfect face immersion
      const isImg2Img = !!faceImage;
      const endpoint = isImg2Img 
        ? 'https://queue.fal.run/fal-ai/flux/dev/image-to-image'
        : 'https://queue.fal.run/fal-ai/flux/dev';

      const bodyPayload = isImg2Img
        ? {
            prompt,
            image_url: faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`,
            strength: 0.75,
            image_size: '3:4',
            sync_mode: true
          }
        : {
            prompt,
            image_size: '3:4',
            sync_mode: true
          };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${process.env.FAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
          signal: AbortSignal.timeout(25_000),
        });

        if (response.ok) {
          const data = await response.json();
          aiImageUrl = data?.images?.[0]?.url ?? '';
        } else {
          const errText = await response.text();
          console.warn(`Fal.ai image gen failed (${response.status}):`, errText);
          return NextResponse.json(
            { error: `Fal.ai Image Generation failed: ${response.statusText}`, details: errText },
            { status: response.status }
          );
        }
      } catch (err: any) {
        console.error('Fal.ai image generation error:', err);
        return NextResponse.json(
          { error: 'Fal.ai image generation timed out or failed to complete', details: err?.message },
          { status: 504 }
        );
      }

    } else {
      // ──────────────────────────────────────────────────────────────
      // OPENROUTER PROVIDER (Default)
      // ──────────────────────────────────────────────────────────────
      if (!process.env.OPENROUTER_API_KEY) {
        return NextResponse.json(
          {
            error: 'OpenRouter API key is not configured on the server. Please set OPENROUTER_API_KEY in environment variables.',
            code: 'OPENROUTER_KEY_MISSING'
          },
          { status: 503 }
        );
      }

      const model = process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux.2-schnell';

      try {
        const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
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
