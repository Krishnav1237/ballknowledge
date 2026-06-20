import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Generates a personalised viral football card image via OpenRouter.
 *
 * Uses the correct OpenRouter image generation endpoint:
 *   POST /api/v1/images/generations
 *
 * Best models for photorealistic football cards (in order of preference):
 *   1. black-forest-labs/flux-1-pro        — best quality, photorealistic
 *   2. black-forest-labs/flux-1-schnell    — fast, good quality
 *   3. stabilityai/stable-diffusion-3-5    — high fidelity, slower
 *
 * The client renders the FUT card SVG independently — this API only provides
 * the AI-generated photorealistic background/player image overlay.
 */

const IMAGE_MODEL = 'black-forest-labs/flux-1-pro';

function buildCardPrompt(params: {
  username: string;
  nation: string;
  ovr: number;
  verdict: string;
}) {
  const { username, nation, ovr, verdict } = params;

  // A highly specific prompt tuned for football card aesthetics
  return (
    `Hyper-realistic premium FIFA Ultimate Team trading card illustration. ` +
    `A passionate ${nation} football fan named ${username} wearing the official ${nation} national team jersey, ` +
    `standing in a dramatic stadium pose with arms raised. ` +
    `Dark stadium background with golden spotlight, bokeh crowd, dramatic lens flare. ` +
    `Card rating ${ovr} OVR shown in large gold numerals. ` +
    `Verdict badge reads "${verdict}". ` +
    `Ultra HD, photorealistic, cinematic lighting, gold foil card border, ` +
    `Panini sticker aesthetic, highly detailed face, authentic jersey fabric texture, ` +
    `professional sports photography style. 4K quality. Sharp focus.`
  );
}

export async function POST(request: Request) {
  try {
    const {
      username,
      faceImage,        // base64 face upload (used client-side; echoed back for card render)
      favoriteNation,
      overallRating,
      predictionRating,
      hotTakeRating,
      tacticalRating,
      communityRating,
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
    const htk    = hotTakeRating    ?? 50;
    const sel    = tacticalRating   ?? 50;
    const cmy    = communityRating  ?? Math.max(30, Math.min(99, ovr + 1));

    let aiImageUrl = '';

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = buildCardPrompt({ username, nation, ovr, verdict: verdict || 'BALL KNOWLEDGE DETECTED' });

        const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
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
            size:   '768x1024',     // Portrait card aspect ratio
            quality: 'standard',
          }),
          signal: AbortSignal.timeout(25_000), // 25s — Flux Pro can be slow
        });

        if (response.ok) {
          const data = await response.json();
          // Standard OpenAI-compatible image response: data[0].url
          aiImageUrl = data?.data?.[0]?.url ?? data?.data?.[0]?.b64_json ?? '';
          if (data?.data?.[0]?.b64_json && !aiImageUrl.startsWith('http')) {
            // Some models return base64; prefix it so the client can use it directly
            aiImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
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
        stats: { prd, htk, sel, cmy },
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
