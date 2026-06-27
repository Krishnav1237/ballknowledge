import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Generates a complete photorealistic FIFA trading card via OpenRouter AI Image Generation API.
 * 
 * Passes player details, ratings, stats, jersey nation, and verdict into the prompt
 * to output a complete, seamless EA Sports FIFA FUT card artwork.
 */

const IMAGE_MODEL = 'black-forest-labs/flux-1-pro';

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
    `Full official EA Sports FIFA Ultimate Team (FUT) special edition football trading card graphic artwork. ` +
    `The card features a high-quality athletic football player cutout wearing the official ${nation} national team kit/jersey in a dynamic pose. ` +
    `Card design: Glowing futuristic FUT shield card shape with metallic crimson red and champagne gold borders, 3D stadium spotlights, and glowing cosmic energy aura taking up the entire card space. ` +
    `Integrated card graphic details rendered clearly on the card face: ` +
    `Top-left overall rating number '${ovr}' and position '${pos}' in bold FUT font. ` +
    `Bold player name '${username}' centered below the portrait. ` +
    `Verdict stamp badge '${vLabel}' in top right. ` +
    `Bottom stats panel displaying 4 ratings: PRD ${prd}, MGR ${mgr}, HOT ${hot}, RST ${rst}. ` +
    `Masterpiece quality, ultra-detailed 8k render, professional sports trading card graphic design, cinematic lighting.`
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

    // Gracefully check if OpenRouter API Key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'OpenRouter API key is not configured on the server. Please set OPENROUTER_API_KEY in environment variables.',
          code: 'OPENROUTER_KEY_MISSING'
        },
        { status: 503 }
      );
    }

    const nation = favoriteNation || 'Argentina';
    const ovr    = overallRating   ?? 50;
    const prd    = predictionRating ?? 50;
    const hot    = hotTakeRating    ?? 50;
    const mgr    = managerRating    ?? tacticalRating ?? 50;
    const rst    = roastScore       ?? communityRating ?? Math.max(50, Math.min(99, ovr + 1));

    let aiImageUrl = '';

    try {
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
        signal: AbortSignal.timeout(25_000), // 25s timeout
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
