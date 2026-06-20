# CLAUDE.md — Agent & Developer Reference Guide

> This file is the authoritative technical reference for AI agents and developers working on this codebase.
> Read this BEFORE writing any code.

---

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Start production | `npm run start` |
| Lint | `npm run lint` |
| DB push (no migration) | `npx prisma db push` |
| DB migration | `npx prisma migrate dev` |
| Regenerate Prisma client | `npx prisma generate` |
| View DB (Prisma Studio) | `npx prisma studio` |

---

## Environment Variables

Create `.env` (copy from `.env.example`):

```env
# Required
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"
GROQ_API_KEY="gsk_..."

# Optional — Nvidia NIM fallback AI
NVIDIA_API_KEY="nvapi-..."

# Required for production
NEXT_PUBLIC_SITE_URL="https://ballknowledge.vercel.app"
```

---

## Architecture

### Framework
- **Next.js 16.2.9** (App Router, Turbopack). **NOT Next.js 14/15.** Read `/node_modules/next/dist/docs/` before writing API routes or metadata.
- All pages in `src/app/`. API routes under `src/app/api/`.
- **Server Components** are the default. Only add `'use client'` when hooks/browser APIs are required.

### Data Layer — Offline-First Hybrid
```
User Action → localStorage (instant) → DB sync via /api/resolve-match or /api/profile (async)
```
- **localStorage key**: `var_cards_profile` (profile) + `var_match_predictions` (predictions)
- **DB**: PostgreSQL via Prisma. All DB calls MUST be wrapped in `try/catch` with a localStorage fallback.
- **Offline mode**: If DB is unreachable, the app still works 100%. DB writes fail silently.

### Shared Utilities — ALWAYS import from here, never duplicate
| Export | File | Purpose |
|--------|------|---------|
| `parseLocalDate` | `src/lib/matchUtils.ts` | Parse `MM/DD/YYYY HH:MM` → Date |
| `getDeterministicMatchResult` | `src/lib/matchUtils.ts` | Fake deterministic match results |
| `getFlagEmoji` | `src/lib/matchUtils.ts` | Country name → flag emoji string |
| `getCountryCode` | `src/lib/countries.ts` | Country name → ISO-2 code |
| `getFlagUrl` | `src/lib/countries.ts` | Country name → flagcdn.com URL |

> ⚠️ **DO NOT copy-paste these functions into pages.** They exist in `matchUtils.ts` for a reason.

### Match Status Calculation
Status is always computed from **real current time** (`new Date()`), never a hardcoded date:
```ts
const kickoff = parseLocalDate(match.local_date);  // from matchUtils.ts
const timeDiff = new Date().getTime() - kickoff.getTime();
if (timeDiff >= 2 * 60 * 60 * 1000) status = 'COMPLETED';
else if (timeDiff >= 0) status = 'LIVE';
else status = 'UPCOMING';
```

### AI Grading Fallback Chain
```
POST /api/resolve-match
  → Groq (llama-3.3-70b-specdec)         [Primary — fastest]
  → Nvidia NIM (llama-3.1-70b-instruct)  [Fallback]
  → Deterministic local tribunal          [Offline fallback]
```

---

## Key Files Reference

| File | What it does |
|------|-------------|
| `src/lib/matchUtils.ts` | ✅ Shared utilities (parseLocalDate, getDeterministicMatchResult, getFlagEmoji) |
| `src/lib/worldcupData.ts` | Server-side match/team fetcher with 5-min in-memory cache |
| `src/lib/profileSync.ts` | Client-side localStorage ↔ DB sync helpers |
| `src/lib/db.ts` | Prisma singleton — use this, never `new PrismaClient()` |
| `src/lib/roster.ts` | 32-team player roster for Best XI squad builder |
| `src/lib/countries.ts` | Country → ISO code map for flagcdn.com flag images |
| `src/lib/tribunalDB.ts` | Static types for VerdictData, Achievement, CaseOfDay |
| `src/components/SportsCenterCard.tsx` | FIFA-style card renderer (Canvas + SVG). Large file — handle carefully |
| `src/components/TacticalPitch.tsx` | Interactive 4-3-3 formation grid |
| `src/components/PredictionModal.tsx` | Predictions/hot takes modal form |
| `src/components/MatchLiveChat.tsx` | localStorage banter chat for live matches |
| `src/components/FlagImage.tsx` | flagcdn.com image with emoji fallback |
| `src/app/api/resolve-match/route.ts` | Core grading engine — AI + DB write. Has `force-dynamic` |
| `src/app/globals.css` | Design tokens, glassmorphism, keyframe animations |

---

## Database Schema (Prisma)

```
FootballIQProfile    — User profile (username, rating, role, collectedCards)
  └── MatchPrediction  — Per-match predictions (unique: profileId + matchId)
  └── HotTake          — Individual hot take statements + AI grades
  └── ChatMessage      — Live banter chat messages (per match)
  └── MatchCard        — Collectible verdict cards earned
```

**Critical**: `MatchPrediction` has `@@unique([profileId, matchId])`. Always use `upsert()` — never `create()`.

---

## Scoring Formulas

### Overall Rating
$$\text{Overall} = (0.5 \times \text{Prediction Rating}) + (0.5 \times \text{Hot Take Rating})$$

### Prediction Rating deltas (base: 50)
- Exact score match: **+15**
- Correct outcome: **+5**
- Wrong outcome: **-2**

### Hot Take Rating deltas (base: 50)
- AI OVR ≥ 75 (Elite/Chef): **+10**
- AI OVR ≤ 35 (Delusional): **-5**
- Mid take (36–74): **+1**

### Card Rarity
| Score | Rarity |
|-------|--------|
| 90–99 | LEGENDARY |
| 75–89 | EPIC |
| 60–74 | RARE |
| 0–59 | COMMON |

---

## User Roles

| Role | Hot Takes | Capabilities |
|------|-----------|-------------|
| `FREE` | 3 max | Standard |
| `PREMIUM` | 5 max | Roast styling, tagging |
| `ADMIN` | 5 max | Bypass kickoff lock |

Roles are stored in localStorage AND synced to PostgreSQL via `POST /api/resolve-match` (with `syncOnly: true`) on upgrade.

---

## Code Style Rules

1. **No `alert()`** — Use `showToast()` state pattern (see `match/[id]/page.tsx`) or inline error states
2. **No duplicate utilities** — Always import from `matchUtils.ts` or `countries.ts`
3. **No hardcoded dates** — Always use `new Date()` for current time
4. **DB safety** — All Prisma calls in `try/catch`. Fail gracefully to localStorage
5. **No impure render** — Don't call `Math.random()` in render. Gate with `mounted` state
6. **Toast not alert** — Any user-facing success/error message must use the toast system
7. **Tailwind v4** — Custom colors/fonts defined in `globals.css` under `@theme`, NOT in `tailwind.config`
8. **force-dynamic** — Add `export const dynamic = 'force-dynamic'` to any route using Prisma

---

## Production Checklist (Before Deploy)

- [ ] `DATABASE_URL` set in Vercel environment
- [ ] `GROQ_API_KEY` set in Vercel environment
- [ ] `NEXT_PUBLIC_SITE_URL` set to `https://ballknowledge.vercel.app`
- [ ] `npx prisma db push` run against production DB
- [ ] `npm run build` passes with 0 errors
- [ ] `/sitemap.xml` accessible after deploy
- [ ] Social share OG image renders at `opengraph.dev/url/ballknowledge.vercel.app`

---

## Security Headers (Applied via `next.config.ts`)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=63072000`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
