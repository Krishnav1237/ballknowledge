# OpenRouter Image Generation Guide 🎨

This document details how to leverage **OpenRouter's Text-to-Image capabilities** to generate highly customized, premium, and shareable matchday Verdict Cards.

---

## 🚀 Recommended Image Generation Models on OpenRouter

OpenRouter supports several state-of-the-art text-to-image models. Below are the recommended models for generating premium football-themed graphic cards:

| Model ID | Quality / Aesthetic | Key Advantage | Best Use Case |
|---|---|---|---|
| **`black-forest-labs/flux-1-dev`** | Extremely High (Photorealistic) | Photorealism, intricate detailing, excellent prompt adherence. | Custom, premium, and legendary holographic card illustrations. |
| **`black-forest-labs/flux-1-schnell`** | High (Semi-realism) | Extremely fast generation (1-2s), very cost-effective. | Real-time card generation during active matchday traffic. |
| **`stabilityai/stable-diffusion-3-medium`** | High (Artistic / Vector) | Great handling of stylized text and logo graphic layouts. | Graphic card borders, vector designs, and user avatar badges. |
| **`stabilityai/stable-diffusion-xl`** | Medium-High (Classic) | Immense ecosystem, works well with specific anime/comic style descriptors. | Retro, vintage, or classic FUT card designs. |

---

## 🛠️ API Request Format for Image Generation

OpenRouter uses its standard `/api/v1/chat/completions` endpoint for image generation, utilizing the `modalities` parameter.

### HTTP POST Request Details
- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <OPENROUTER_API_KEY>`
  - `Content-Type: application/json`

### Payload Format (e.g., Flux-1-Schnell)
```json
{
  "model": "black-forest-labs/flux-1-schnell",
  "modalities": ["image"],
  "messages": [
    {
      "role": "user",
      "content": "A high-tech digital football card illustration showing a legendary golden trophy radiating light on a dark burgundy-colored soccer field background, retro FIFA FUT card style, holographic sheen, neon gold borders, ultra-detailed 8k render."
    }
  ],
  "image_config": {
    "aspect_ratio": "3:4"
  }
}
```

---

## 🧑‍💻 Next.js API Integration Example

Create an endpoint (e.g., `/api/generate-card/route.ts`) to trigger image generation and return the image URL to the client.

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { rating, verdict, country } = await request.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API Key is not configured' }, { status: 500 });
    }

    // Determine visual style based on rating & country
    const themeColor = rating >= 90 ? 'gold' : rating >= 75 ? 'amber' : 'crimson';
    const visualPrompt = `A premium futuristic FUT soccer card illustration for a "${verdict}" verdict. Theme: ${country}. Neon ${themeColor} shield frame, glowing tactical matrix scoreboard lines, dark stadium background, holographic glass texture, hyper-detailed 3D game asset render.`;

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
            content: visualPrompt
          }
        ],
        image_config: {
          aspect_ratio: '3:4'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter image generation failed: ${errorText}`);
    }

    const data = await response.json();
    
    // OpenRouter returns image completions as a message block with image content
    const imageUrl = data.choices[0]?.message?.content || null;

    return NextResponse.json({ success: true, imageUrl });

  } catch (error: any) {
    console.error('Failed to generate card image:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## 💡 Best Practices for Shareable Card Images
1. **Dynamic Prompting:** Inject user metrics dynamically. (e.g., include the user's OVR rating, favorite country flag, or specific VAR verdict into the image generation prompt).
2. **Overlay Text via Canvas:** AI models are improving at text rendering (e.g. Flux-1-Dev), but rendering tiny specific stats (e.g., "OVR 99") can still fluctuate. For maximum legibility and responsiveness, use a library like `canvas` or SVG templates to overlay dynamic stats, usernames, and verdicts on top of the AI-generated background graphic.
3. **Caching & CDN Storage:** Store the generated images on a cloud storage provider (e.g. AWS S3, Vercel Blob, Cloudinary) and server-cache them. This speeds up OpenGraph load times (Twitter/WhatsApp card preview) and reduces OpenRouter token costs.
