# BallKnowledge ⚽ — World Cup 2026 Reputation Arena

[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge&logo=checkmarx&logoColor=white)](https://ballknowledge.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Live](https://img.shields.io/badge/Live-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ballknowledge.vercel.app)

> **"Build your football reputation, one match at a time."**

BallKnowledge is a premium World Cup 2026 prediction and debate platform. Fans lock in match predictions, submit bold hot takes, and earn collectible FIFA-style Verdict Cards — all tracked against a persistent Football IQ reputation score.

🔗 **Live**: [ballknowledge.vercel.app](https://ballknowledge.vercel.app)

---

## Product Flow

```
Locker Room → World Cup Hub → Match Room → VAR Tribunal → Verdict Card → My Card → Share
```

1. **Locker Room** — Set up your profile (username, avatar, favourite country, club allegiance)
2. **World Cup Hub** (`/world-cup-hub`) — Browse all 104 fixtures across Groups A–L with live standings
3. **Match Room** (`/match/[id]`) — Before kickoff: lock score prediction, MOTM, goalscorer, hot takes, and Best XI squad. Once the match starts, a live banter chat opens
4. **VAR Tribunal** — After a match completes, the AI grades your hot takes and checks your score prediction against actual results
5. **Verdict Card** — A custom FIFA-style collectible card is generated based on your performance score
6. **My Card** (`/football-iq`) — View your Football IQ card and collected card album
7. **Share** — Viral share links for individual cards (`/card/[id]`) and full profile decks (`/u/[username]`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Language | TypeScript, React 19 |
| Database | PostgreSQL via Prisma Client v6 |
| State | localStorage-first with optional DB sync |
| AI | OpenRouter → Groq → Nvidia NIM → Deterministic fallback |
| Styling | Tailwind CSS v4, Dark Glassmorphism, custom CSS |
| Animation | Framer Motion, GSAP + ScrollTrigger, Lenis |
| Icons | Lucide React |
| Fonts | Space Grotesk (display), Outfit (body), Oswald (cards) |
| Deployment | Vercel (serverless) |

---

## Scoring & Formulas

### Match Status
| Status | Condition | Predictions |
|--------|-----------|-------------|
| `UPCOMING` | Before kickoff | ✅ Editable |
| `LIVE` | Kickoff → +2 hrs | 🔒 Locked |
| `COMPLETED` | Kickoff +2 hrs | 🔒 Locked & Graded |

### Football IQ Rating Formula
$$\text{Overall Rating} = (0.35 \times \text{PRD}) + (0.25 \times \text{MGR}) + (0.25 \times \text{HOT}) + (0.15 \times \text{RST})$$

### Metrics Breakdown

#### 1. Predictor Score (PRD) — 0-100 Points
Points are earned across Match Outcome, Scoreline Accuracy, Man of the Match, and First Goalscorer. Max capped at 100.
* **Match Outcome (35 Points)**: Correct Draw (35 pts), Correct Winner (30 pts), Wrong Outcome (15 pts)
* **Scoreline Accuracy (30 Points)**: Home/Away goals (each exact: 15 pts, off by 1: 10 pts, off by 2: 5 pts, off by 3+: 0 pts)
* **Man of the Match (20 Points)**: Correct MOTM name match (20 pts), Partial name match/same team (12 pts), Wrong (4 pts)
* **First Goalscorer (15 Points)**: Correct first goalscorer (15 pts), Scored later in the match (10 pts), Wrong/no contribution (3 pts)

#### 2. Manager Score (MGR) — 10-99 Points
* **Formula**: $\text{Round}(\text{Average Match Rating of Selected XI} \times 10)$
* Player ratings are based on their international reputation.

#### 3. Hot Take Score (HOT) — 0-100 Points
* **Formula**: Average of graded take base scores multiplied by confidence level.
* **Base Scores**: `CORRECT` (100 pts), `PARTIALLY_CORRECT` (75 pts), `INCORRECT` (50 pts)
* **Confidence Multiplier**: 1 (0.8x), 2 (0.9x), 3 (1.0x), 4 (1.1x), 5 (1.2x)
* * **Free users**: 2 takes graded per match; Ball Knower (PREMIUM): 5 takes

#### 4. Roast Score (RST) — 50-100 Points
* **Formula**: $50 + \text{messages sent} + \text{positive reactions (upvotes)}$, capped at 100.

### Card Rarity
| OVR Rating | Rarity |
|------------|--------|
| 90–99 | 🟡 LEGENDARY |
| 75–89 | 🟣 EPIC |
| 60–74 | 🔵 RARE |
| 1–59  | ⚪ COMMON |

---

## Pricing Tiers

| Tier | Price | Hot Takes | Role |
|------|-------|-----------|------|
| Casual Fan | Free | 2/match | `FREE` |
| Ball Knower | $2.99 / €2.99 (auto-detected by locale) | 5/match | `PREMIUM` |
| Football God | $24.99 / €24.99 | 5/match + bypass lock | `ADMIN` |

Currency is automatically detected from timezone, locale, and country preference.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL database (local or hosted — Supabase, Railway, Neon)
- At least one AI key (OpenRouter recommended; Groq as fallback)

### 1. Install
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` and fill in your values:
```bash
cp .env.example .env
```

```env
# Required
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"

# AI grading — at least one required
OPENROUTER_API_KEY="sk-or-..."   # Primary (AI grading + image gen)
GROQ_API_KEY="gsk_..."            # Fallback
NVIDIA_API_KEY="nvapi-..."        # Second fallback

# Required for production (OG image, sitemap)
NEXT_PUBLIC_SITE_URL="https://ballknowledge.vercel.app"
```

### 3. Database Setup
```bash
# Push schema to DB (creates all tables)
npx prisma db push

# Or run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 4. Run Dev Server
```bash
npm run dev
# → http://localhost:3000
```

### 5. Production Build
```bash
npm run build
npm run start
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page (light-themed intentionally for marketing)
│   ├── layout.tsx                # Root layout + metadata (OG, Twitter)
│   ├── globals.css               # Design system, keyframes, glassmorphism
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # Branded 404 page
│   ├── sitemap.ts                # Auto-generates /sitemap.xml
│   ├── world-cup-hub/            # Tournament schedule + standings (dark theme)
│   ├── match/[id]/               # Match prediction cockpit (dark theme)
│   ├── football-iq/              # My Card + collected cards album (dark theme)
│   ├── profile/                  # Profile settings + avatar (dark theme)
│   ├── pricing/                  # Tier contracts — $2.99/$24.99 (dark theme)
│   ├── card/[id]/                # Viral card share page (dark theme)
│   ├── u/[username]/             # Public profile share page
│   ├── leaderboard/              # Global manager leaderboard (dark theme)
│   └── api/
│       ├── matches/              # GET all World Cup fixtures
│       ├── teams/                # GET all World Cup teams
│       ├── resolve-match/        # POST: AI-grade and save predictions
│       ├── profile/[username]/   # GET public profile
│       ├── card/[id]/            # GET shared card data
│       ├── leaderboard/          # GET ranked leaderboard entries
│       └── stats/                # GET community counter stats
├── components/
│   ├── TacticalPitch.tsx         # Interactive 4-3-3 squad builder grid
│   ├── PredictionModal.tsx       # Predictions + hot takes form
│   ├── MatchLiveChat.tsx         # localStorage banter chat (live matches)
│   ├── SportsCenterCard.tsx      # FIFA-style card renderer (canvas + SVG)
│   ├── FlagImage.tsx             # flagcdn.com flag images w/ emoji fallback
│   ├── Navbar.tsx                # Solid top header (bg-[#0B0F19], no transparency)
│   ├── Footer.tsx                # Footer
│   ├── Providers.tsx             # React Query + client providers
│   ├── PageTransition.tsx        # Framer Motion page transition wrapper
│   └── SmoothScroll.tsx          # Lenis smooth scroll init
├── lib/
│   ├── matchUtils.ts             # Shared: parseLocalDate, getDeterministicMatchResult, getFlagEmoji
│   ├── countries.ts              # Country name → ISO code map (+ flagcdn URL helper)
│   ├── worldcupData.ts           # Server-side match/team fetcher (local JSON, 5-min TTL cache)
│   ├── worldcup2026/
│   │   ├── football.matches.json # 104 World Cup 2026 fixtures (authoritative data source)
│   │   └── football.teams.json   # 32 World Cup teams
│   ├── profileSync.ts            # Client-side localStorage ↔ DB sync helpers
│   ├── roster.ts                 # 32-team player roster data
│   ├── landingData.ts            # Static data for landing page tickers
│   ├── db.ts                     # Prisma singleton client
│   └── tribunalDB.ts             # Static tribunal/verdict data types
prisma/
│   └── schema.prisma             # DB models: FootballIQProfile, MatchPrediction, HotTake, ChatMessage, MatchCard
public/
│   ├── images/
│   │   ├── og-preview.png        # 1200×630 social share image
│   │   ├── ball_knowledge_logo.png # Logo used in Navbar
│   │   └── *.webp                # Background images (stadium, VIP box, etc.)
│   └── robots.txt
```

---

## Architecture Decisions

### Offline-First Data Strategy
All critical user state (predictions, profile, chat) is saved to `localStorage` first. DB sync is opportunistic — if the database is unreachable, the app remains fully functional. This hybrid pattern means:
- ✅ Works without a DB connection (zero crash)
- ✅ Fast reads (no DB roundtrip for common actions)
- ✅ DB syncs when the resolution endpoint is called

### Match Status is Real-Time
Match status (UPCOMING/LIVE/COMPLETED) is computed from `new Date()` vs. the fixture's `local_date`. All pages use the shared `parseLocalDate()` utility from `src/lib/matchUtils.ts`.

### AI Grading Fallback Chain
```
OpenRouter (llama-3.3-70b-instruct)
  → Groq (llama-3.3-70b-specdec)
    → Nvidia NIM (meta/llama-3.1-70b-instruct)
      → Deterministic local tribunal fallback
```

### Security Headers (Production)
All routes serve: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.

---

## User Roles

| Role | Hot Takes | Privileges |
|------|-----------|-----------| 
| `FREE` | 3 max | Standard predictions |
| `PREMIUM` | 5 max | Roast styling, user tagging |
| `ADMIN` | 5 max | Bypass kickoff lock (dev/testing) |

Roles are stored in localStorage and synced to PostgreSQL on upgrade. Change tier at `/pricing`.

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `OPENROUTER_API_KEY` *(recommended primary)*
   - `GROQ_API_KEY`
   - `NVIDIA_API_KEY` *(optional)*
   - `NEXT_PUBLIC_SITE_URL` *(e.g. `https://ballknowledge.vercel.app`)*
4. Deploy → all routes compile statically or as serverless functions

---

## Self-Hosting (Raspberry Pi / VPS)

See [`README-raspi.md`](README-raspi.md) for the full PM2 + Nginx reverse proxy setup guide.

---

## License

MIT — see [LICENSE](LICENSE).
