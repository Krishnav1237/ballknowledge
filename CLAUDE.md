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
| Tests | `npm test` |
| SofaScore Single Scrape | `python3 src/lib/sofascore_scraper.py fetch <eventId>` |
| SofaScore Live Scrape | `python3 src/lib/sofascore_scraper.py live` |

---

## Environment Variables

Create `.env` (copy from `.env.example`):

```env
# Required
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"
DIRECT_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"  # For migrations/db push

# AI grading — at least one key required
OPENROUTER_API_KEY="sk-or-..."  # Primary (also powers image generation)
GROQ_API_KEY="gsk_..."          # Fallback
NVIDIA_API_KEY="nvapi-..."       # Second fallback

# Required for production
NEXT_PUBLIC_SITE_URL="https://ballknowledge.live"

# Optional OAuth authentication client IDs & secrets
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

---

## Architecture

### Framework
- **Next.js 16.2.9** (App Router, Turbopack). **NOT Next.js 14/15.** Read `/node_modules/next/dist/docs/` before writing API routes or metadata.
- All pages in `src/app/`. API routes under `src/app/api/`.
- **Server Components** are the default. Only add `'use client'` when hooks/browser APIs are required.
- **Root layout** owns the HUD chrome: fixed Navbar, `main` offset with `--nav-h` (52px), Footer. Do **not** add `pt-[52px]` on pages. Do **not** wrap routes in `PageTransition` or a root `loading.tsx` spinner — those made every navigation fade and wait.
- **PageShell** (`src/components/PageShell.tsx`) is the page frame: `atmosphere` (`none` | `stadium` | `pitch` | `locker`) + `width` (`board` | `wide` | `full`). Use it instead of a new `min-h-screen` wrapper.
- **Fonts** come from `next/font` in `src/lib/fonts.ts` (Outfit, Space Grotesk, Oswald). Never `@import` Google Fonts in CSS.
- **League data** is shared through `src/lib/leagueCatalog.ts` + React Query keys `premier-league-matches` / `premier-league-teams`. Prefetch on `Providers` mount. Fixture JSON is the placeholder so season/match/board paint without a spinner.

### Product
Public OVR board for Premier League 2026/27. Home (`/` and `/leaderboard`) is a two-panel arena: next fixture + ranked OVRs (`GameBoard`). Rank is the OVR. Climb by calling fixtures. Keep it a game HUD — stadium atmosphere, #1 spotlight, OVR bars — not a marketing landing and not a sparse text list.

### Data Layer — Offline-First Hybrid
```
User Action → localStorage (instant) → DB sync via /api/resolve-match or /api/profile (async)
```
- **localStorage key**: `football_iq_profile` (profile) + predictions store
- **DB**: PostgreSQL via Prisma. All DB calls MUST be wrapped in `try/catch` with a localStorage fallback.
- **Offline mode**: If DB is unreachable, the app still works. DB writes fail silently.

### Match Data
```
src/lib/premierleague/clubs.json + matches.json   ← live 20 clubs / 380 fixtures
src/lib/premierLeagueData.ts                      ← loaders used by /api/matches and /api/teams
```
- SofaScore GET `/api/sofascore-sync` still exists and is called from the match page. Overlay mapping in `worldcup2026/sofascore_map.json` is WC-era and may not match PL ids. Do not treat it as the live fixture source.

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
Always use `getMatchClockStatus(match, clockNow())` from `matchUtils.ts`. Never hardcode "today". LIVE is kickoff until +3 hours unless `finished === 'TRUE'`.

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
| `src/components/GameBoard.tsx` | Public OVR board — the product |
| `src/components/PageShell.tsx` | Shared page frame (atmosphere + width) |
| `src/lib/leagueCatalog.ts` | Shared matches/teams/board fetchers + query keys |
| `src/lib/fonts.ts` | next/font Outfit / Space Grotesk / Oswald |
| `src/lib/premierLeagueData.ts` | 20 clubs + 380 PL 2026/27 fixtures |
| `src/lib/matchday.ts` | Next-kickoff picker for Take #1 |
| `src/lib/scoring.ts` | PRD / MGR / HOT / RST / OVR |
| `src/lib/shareCopy.ts` | Tweet / WhatsApp lines |
| `src/lib/matchUtils.ts` | parseLocalDate, getMatchClockStatus, getFlagEmoji |
| `src/lib/profileSync.ts` | localStorage ↔ DB profile helpers (`football_iq_profile`) |
| `src/lib/db.ts` | Prisma singleton — never `new PrismaClient()` |
| `src/lib/roster.ts` | 20-club Best XI rosters |
| `src/lib/countries.ts` | Country → ISO / flagcdn |
| `src/lib/tribunalDB.ts` | VerdictData types for the FIFA-style card |
| `src/components/SportsCenterCard.tsx` | Card renderer. Large file — handle carefully |
| `src/components/TacticalPitch.tsx` | 4-3-3 grid |
| `src/components/PredictionModal.tsx` | Lock score / takes |
| `src/components/MatchLiveChat.tsx` | Live match chat |
| `src/components/Navbar.tsx` | HUD: Board · Season · Card |
| `src/app/api/resolve-match/route.ts` | Grading engine. `force-dynamic` |
| `src/proxy.ts` | Next.js 16 proxy (not middleware) |

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
| `FREE` | 3 max | Standard |
| `PREMIUM` | 5 max | Roast styling, tagging |
| `ADMIN` | 5 max | Bypass kickoff lock |

Roles are stored in localStorage AND synced to PostgreSQL via `POST /api/resolve-match` (with `syncOnly: true`) on upgrade.

---

## Design System (Dark Theme)

This is a **premium dark theme**. Board first, not a brochure. **Do not use light classes**.

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
- **Fixed header** at `z-[100]`, height `--nav-h` (52px), fully solid: `bg-[#0B0F19]` — never transparent.
- Logo at top-left: `/images/ball_knowledge_logo.png`
- Root `main` already has `pt-[var(--nav-h)]`. Pages must not add a second offset.

### Page layouts
| Surface | Shell |
|---------|--------|
| Board (`/`, `/leaderboard`) | `PageShell` stadium + board width |
| Season | `PageShell` pitch + wide |
| Match | Full-bleed pitch art, dark `#030712` wash (never `from-white`) |
| Card / profile | `PageShell` stadium or locker, same tokens |

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

- [ ] `DATABASE_URL` set in the host environment (Vercel pooled URL)
- [ ] `DIRECT_URL` set for Prisma
- [ ] `AUTH_SECRET` set (>=32 random bytes) or login 500s
- [ ] `OPENROUTER_API_KEY` set (AI grading + image gen)
- [ ] `GROQ_API_KEY` set (fallback)
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
