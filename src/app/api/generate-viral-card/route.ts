import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const {
      username,
      faceImage, // base64 face upload
      favoriteNation,
      overallRating,
      predictionRating,
      hotTakeRating,
      tacticalRating,
      delusionRating,
      verdict,
      charge,
      sentence
    } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const nation = favoriteNation || 'Argentina';
    const ovr = overallRating ?? 50;
    
    // Default stats if missing
    const prd = predictionRating ?? 50;
    const htk = hotTakeRating ?? 50;
    const tac = tacticalRating ?? 50;
    const del = delusionRating ?? Math.max(1, 99 - ovr);

    let aiBackgroundUrl = '';

    // Call OpenRouter Flux model to generate a custom card backdrop if key is present
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = `A premium futuristic collectible soccer card backdrop for ${nation} national team. Neon glow borders, dark stadium lighting, abstract digital soccer pitch watermark. 3D high-fidelity game asset render.`;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'black-forest-labs/flux-1-schnell',
            modalities: ['image'],
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            image_config: {
              aspect_ratio: '3:4'
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiBackgroundUrl = data.choices[0]?.message?.content || '';
        }
      } catch (err) {
        console.warn('OpenRouter image generation timed out or failed, falling back to local styles:', err);
      }
    }

    // Return the configuration so the client can instantly render the high-res SVG canvas
    return NextResponse.json({
      success: true,
      aiBackgroundUrl,
      cardConfig: {
        username: username.toUpperCase(),
        faceImage,
        nation,
        ovr,
        stats: { prd, htk, tac, del },
        verdict,
        charge,
        sentence
      }
    });

  } catch (error: any) {
    console.error('Error generating viral card:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
