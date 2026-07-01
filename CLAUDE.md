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

# AI grading — at least one key required
OPENROUTER_API_KEY="sk-or-..."  # Primary (also powers image generation)
GROQ_API_KEY="gsk_..."          # Fallback
NVIDIA_API_KEY="nvapi-..."       # Second fallback

# Required for production
NEXT_PUBLIC_SITE_URL="https://ballknowledge.live"
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
- **localStorage key**: `var_cards_profile` (profile) + `var_cards_predictions` (predictions)
- **DB**: PostgreSQL via Prisma. All DB calls MUST be wrapped in `try/catch` with a localStorage fallback.
- **Offline mode**: If DB is unreachable, the app still works 100%. DB writes fail silently.

### Match Data — Local JSON (Primary Source)
```
Request → fetchWorldCupMatches() → module-level cache → football.matches.json (disk)
```
- **Source files**: `src/lib/worldcup2026/football.matches.json` and `football.teams.json`
- **These are the authoritative source** — they contain every real match result with actual goal scorers.
- The remote `worldcup26.ir` API is permanently unreachable and has been removed.
- Data is cached in-process (module-level singleton) — only one disk read per Node process restart.
- When new match results come in, update the JSON files and restart the server.

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
  → OpenRouter (llama-3.3-70b-instruct)  [Primary — if OPENROUTER_API_KEY set]
  → Groq (llama-3.3-70b-specdec)         [Fallback — if GROQ_API_KEY set]
  → Nvidia NIM (llama-3.1-70b-instruct)  [Second fallback]
  → Deterministic local heuristic         [Always-available offline fallback]
```

### Image Generation
```
POST /api/generate-viral-card
  → OpenRouter /api/v1/images (flux.2-pro)  [if OPENROUTER_API_KEY set]
  → Card renders without AI background otherwise (returns error on API failure)
```

---

## Key Files Reference

| File | What it does |
|------|-------------|
| `src/lib/matchUtils.ts` | ✅ Shared utilities (parseLocalDate, getDeterministicMatchResult, getFlagEmoji) |
| `src/lib/worldcupData.ts` | Match/team data from local JSON — module-level process cache, no remote fetch |
| `src/lib/worldcup2026/football.matches.json` | All 104 World Cup 2026 fixtures with real results |
| `src/lib/worldcup2026/football.teams.json` | All 32 World Cup team records |
| `src/lib/profileSync.ts` | Client-side localStorage ↔ DB sync helpers |
| `src/lib/db.ts` | Prisma singleton — use this, never `new PrismaClient()` |
| `src/lib/roster.ts` | 32-team player roster for Best XI squad builder |
| `src/lib/countries.ts` | Country → ISO code map for flagcdn.com flag images |
| `src/lib/tribunalDB.ts` | Static types for VerdictData, Achievement, CaseOfDay |
| `src/lib/landingData.ts` | Static data for landing page (breaking news, players, countries tickers) |
| `src/components/SportsCenterCard.tsx` | FIFA-style card renderer (Canvas + SVG). Large file — handle carefully |
| `src/components/TacticalPitch.tsx` | Interactive 4-3-3 formation grid |
| `src/components/PredictionModal.tsx` | Predictions/hot takes modal form |
| `src/components/MatchLiveChat.tsx` | localStorage banter chat for live matches |
| `src/components/FlagImage.tsx` | flagcdn.com image with emoji fallback |
| `src/components/Navbar.tsx` | Fixed solid top header (bg-[#0B0F19]), no transparency on scroll |
| `src/components/Footer.tsx` | Site footer |
| `src/components/Providers.tsx` | React Query + client provider wrapper |
| `src/app/api/resolve-match/route.ts` | Core grading engine — AI + DB write. Has `force-dynamic` |
| `src/proxy.ts` | Next.js 16 Proxy (formerly middleware) for security blocking and routing |
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
$$\text{Overall} = (0.35 \times \text{PRD}) + (0.25 \times \text{MGR}) + (0.25 \times \text{HOT}) + (0.15 \times \text{RST})$$

### Metrics Breakdown
- **PRD (Predictions, 0–100)**: Points for Outcome (Correct Draw 35, Winner 30, Wrong 15) + Scoreline (Goals exact 15, off-by-1 10, off-by-2 5, off-by-3+=0 per team) + MOTM (Correct name match 20, Partial name match/same team 12, Wrong 4) + Goalscorer (Correct first goalscorer 15, Scored later in match 10, Wrong/no contribution 3)
- **MGR (Manager, 10–99)**: $\text{Round}(\text{Average Match Rating of Selected XI} \times 10)$
- **HOT (Hot Take, 0–100)**: Average of take base scores (CORRECT=100, PARTIALLY_CORRECT=75, INCORRECT=50) × confidence multiplier (1→0.8, 2→0.9, 3→1.0, 4→1.1, 5→1.2)
- **RST (Roast, 50–100)**: $50 + \text{messages sent} + \text{positive reactions (upvotes)}$, capped at 100

### Card Rarity
| Score | Rarity |
|-------|--------|
| 90–99 | LEGENDARY |
| 75–89 | EPIC |
| 60–74 | RARE |
| 1–59  | COMMON |

---

## User Roles

| Role | Hot Takes | Capabilities |
|------|-----------|-------------|
| `FREE` | 2 max | Standard |
| `PREMIUM` | 5 max | Roast styling, tagging |
| `ADMIN` | 5 max | Bypass kickoff lock |

Roles are stored in localStorage AND synced to PostgreSQL via `POST /api/resolve-match` (with `syncOnly: true`) on upgrade.

---

## Design System (Dark Theme)

This is a **premium dark/black theme** with World Cup-themed accents. **Do not use light classes**.

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#030712` | Page background |
| `surface` | `#0B0F19` | Glass panels, navbars |
| `primary` | `#881337` | Burgundy gradient starts, borders |
| `secondary` | `#E11D48` | Rose Red — primary accent, buttons, highlights |
| `foreground` | `#F3F4F6` | Primary text |

### Key Class Patterns
- **Page bg**: `bg-background` or `bg-[#030712]`
- **Dark glass panels**: `bg-[#0B0F19]/80 border border-white/10 backdrop-blur-md`
- **Input fields**: `bg-black/40 border border-white/10 text-white`
- **Muted text**: `text-gray-400` or `text-zinc-400`
- **White text**: `text-white` (NOT `text-zinc-950` or `text-white`)
- **Accent text**: `text-[#E11D48]`
- **Status: LIVE**: `text-red-400 bg-red-950/20 border-red-900/30`
- **Status: COMPLETED**: `text-gray-400 bg-black/30 border-white/10`
- **Status: UPCOMING/OPEN**: `text-[#E11D48] bg-[#E11D48]/10 border-[#E11D48]/20`

> ⚠️ **NEVER use**: `bg-white`, `bg-zinc-50`, `text-zinc-950`, `border-zinc-200` in dark theme pages.

### Navbar
- **Fixed header** at `z-[100]`, fully solid: `bg-[#0B0F19]` — never transparent.
- Logo at top-left: `/images/ball_knowledge_logo.png`

---

## Code Style Rules

1. **No `alert()`** — Use `showToast()` state pattern (see `match/[id]/page.tsx`) or inline error states
2. **No duplicate utilities** — Always import from `matchUtils.ts` or `countries.ts`
3. **No hardcoded dates** — Always use `new Date()` for current time
4. **DB safety** — All Prisma calls in `try/catch`. Fail gracefully to localStorage
5. **No impure render** — Don't call `Math.random()` in render. Gate with `mounted` state
6. **Toast not alert** — Any user-facing success/error message must use the toast system
7. **Tailwind v4** — Custom colors/fonts defined in `globals.css` under `@theme`. ALWAYS use valid standard color tokens (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950). NEVER use unvalidated integers like `zinc-450` or `gray-350`.
8. **force-dynamic** — Add `export const dynamic = 'force-dynamic'` to any route using Prisma
9. **Widescreen Cockpit Layouts** — Profile settings dashboard uses `max-w-8xl` with a 3-column layout (`grid-cols-12`) to align perfectly with the Leaderboard and Collectibles Binder console aesthetics.
10. **Next.js 16 Proxy** — Next.js 16 deprecated `middleware.ts` and replaced it with `src/proxy.ts` exporting a named or default `proxy` function (e.g., `export function proxy(request)`). Never export `middleware`.

---

## Production Checklist (Before Deploy)

- [ ] `DATABASE_URL` set in Cloudflare environment
- [ ] `OPENROUTER_API_KEY` set in Cloudflare environment (for AI grading + image gen)
- [ ] `GROQ_API_KEY` set in Cloudflare environment (fallback)
- [ ] `NEXT_PUBLIC_SITE_URL` set to `https://ballknowledge.live`
- [ ] `npx prisma db push` run against production DB
- [ ] `npm run build` passes with 0 errors
- [ ] `/sitemap.xml` accessible after deploy
- [ ] Social share OG image renders at `opengraph.dev/url/ballknowledge.live`

---

## Security Headers (Applied via `next.config.ts`)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=63072000`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
