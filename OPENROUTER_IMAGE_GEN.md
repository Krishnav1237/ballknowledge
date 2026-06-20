# OpenRouter Image Generation Guide 🎨

This document details how **BallKnowledge** uses OpenRouter's image generation API
to produce photorealistic, premium shareable football cards.

---

## ⚠️ Correct API Endpoint

> **Critical:** OpenRouter image generation uses a **separate** endpoint from chat completions.
> The old `modalities: ['image']` approach in the chat endpoint does **not** work.

| Use Case | Endpoint |
|----------|----------|
| Text / hot take grading | `POST /api/v1/chat/completions` |
| **Image generation** | `POST /api/v1/images/generations` ← correct |

---

## 🏆 Recommended Models (Best → Fastest)

| Model ID | Quality | Speed | Cost | Notes |
|----------|---------|-------|------|-------|
| `black-forest-labs/flux-1-pro` | ⭐⭐⭐⭐⭐ Photorealistic | ~10–20s | $$$ | **Default — best face/jersey detail** |
| `black-forest-labs/flux-1-dev` | ⭐⭐⭐⭐ High | ~8–15s | $$ | Great alternative |
| `black-forest-labs/flux-1-schnell` | ⭐⭐⭐ Good | ~2–5s | $ | Use for high traffic / cost savings |
| `stabilityai/stable-diffusion-3-5` | ⭐⭐⭐ Good | ~6–12s | $$ | Good for stylised art cards |

The active model is configured via `IMAGE_MODEL` constant in `src/app/api/generate-viral-card/route.ts`.

---

## 🛠️ Correct Request Format

```typescript
// POST https://openrouter.ai/api/v1/images/generations
const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://ballknowledge.vercel.app',
    'X-Title': 'BallKnowledge World Cup 2026',
  },
  body: JSON.stringify({
    model: 'black-forest-labs/flux-1-pro',
    prompt: 'Hyper-realistic FIFA Ultimate Team card illustration...',
    n: 1,
    size: '768x1024',   // Portrait card format
    quality: 'standard',
  }),
  signal: AbortSignal.timeout(25_000),
});

const data = await response.json();
// Standard OpenAI-compatible image response:
const imageUrl = data?.data?.[0]?.url ?? '';
// Some models return base64 instead:
const base64 = data?.data?.[0]?.b64_json;
const src = base64 ? `data:image/png;base64,${base64}` : imageUrl;
```

---

## 🎯 Prompt Formula for Best Results

The `buildCardPrompt()` function in `route.ts` produces prompts like:

```
Hyper-realistic premium FIFA Ultimate Team trading card illustration.
A passionate {NATION} football fan named {USERNAME} wearing the official
{NATION} national team jersey, standing in a dramatic stadium pose with arms raised.
Dark stadium background with golden spotlight, bokeh crowd, dramatic lens flare.
Card rating {OVR} OVR shown in large gold numerals.
Verdict badge reads "{VERDICT}".
Ultra HD, photorealistic, cinematic lighting, gold foil card border,
Panini sticker aesthetic, highly detailed face, authentic jersey fabric texture,
professional sports photography style. 4K quality. Sharp focus.
```

**Key elements that improve quality:**
- Specify the national team jersey explicitly (gives model colour/style context)
- Use "Panini sticker aesthetic" or "FIFA Ultimate Team" to anchor the card style
- "Cinematic lighting" / "bokeh crowd" for authentic sports photography feel
- Include `Sharp focus` — prevents blurry AI faces

---

## 💡 Best Practices

1. **Face Upload + AI Background** — The card renders the user's uploaded face via the SVG `JerseyAvatar`
   component on the client. The AI image is used as an optional background/atmosphere layer.

2. **Overlay Stats via SVG** — Never rely on AI to render tiny numbers correctly. All stats (OVR, PRD, HTK, etc.)
   are rendered by the `SportsCenterCard.tsx` SVG component, not the AI image.

3. **Cache Generated Images** — Store AI image URLs in the `MatchCard` database record. Re-use across
   share links rather than re-generating on every view.

4. **Graceful Degradation** — If `OPENROUTER_API_KEY` is not set, `aiImageUrl` returns `''` and the card
   renders its built-in SVG background (`/images/card_bg.webp`). This is the default for local dev.

---

## 🔧 Setup

Add to `.env`:
```env
OPENROUTER_API_KEY="sk-or-v1-..."
```

Get your key at [openrouter.ai/keys](https://openrouter.ai/keys).

---

## 📋 Response Shape

```json
{
  "success": true,
  "aiImageUrl": "https://fal.media/files/...",
  "cardConfig": {
    "username": "USERHANDLE",
    "faceImage": "data:image/jpeg;base64,...",
    "nation": "Brazil",
    "ovr": 82,
    "stats": { "prd": 90, "htk": 75, "sel": 85, "cmy": 78 },
    "verdict": "BALL KNOWLEDGE DETECTED",
    "charge": "...",
    "sentence": "..."
  }
}
```
