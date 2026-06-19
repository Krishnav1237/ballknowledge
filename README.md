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
| AI | Groq API (`llama-3.3-70b-specdec`) → Nvidia NIM fallback |
| Styling | Tailwind CSS v4, Glassmorphism, custom CSS |
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
$$\text{Overall Rating} = (0.5 \times \text{Prediction Rating}) + (0.5 \times \text{Hot Take Rating})$$

| Event | Prediction Rating | Hot Take Rating |
|-------|-----------------|----------------|
| Exact score match | +15 | — |
| Correct outcome | +5 | — |
| Wrong outcome | -2 | — |
| AI OVR ≥ 75 (Elite take) | — | +10 |
| AI OVR ≤ 35 (Delusion) | — | -5 |
| Mid take | — | +1 |

### Card Rarity
| Score | Rarity |
|-------|--------|
| 90–99 | 🟡 LEGENDARY |
| 75–89 | 🟣 EPIC |
| 60–74 | 🔵 RARE |
| 0–59 | ⚪ COMMON |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL database (local or hosted — Supabase, Railway, Neon)
- Groq API key (free at [console.groq.com](https://console.groq.com))

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
GROQ_API_KEY="gsk_..."

# Optional (Nvidia NIM fallback for AI grading)
NVIDIA_API_KEY="nvapi-..."

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
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + metadata (OG, Twitter)
│   ├── globals.css               # Design system, keyframes, glassmorphism
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # Branded 404 page
│   ├── sitemap.ts                # Auto-generates /sitemap.xml
│   ├── world-cup-hub/            # Tournament schedule + standings
│   ├── match/[id]/               # Match prediction cockpit
│   ├── football-iq/              # My Card + collected cards album
│   ├── profile/                  # Profile settings + avatar
│   ├── pricing/                  # Tier contracts
│   ├── card/[id]/                # Viral card share page
│   ├── u/[username]/             # Public profile share page
│   └── api/
│       ├── matches/              # GET all World Cup fixtures
│       ├── teams/                # GET all World Cup teams
│       ├── resolve-match/        # POST: AI-grade and save predictions
│       ├── profile/[username]/   # GET public profile
│       ├── profile/              # POST: sync profile to DB
│       ├── card/[id]/            # GET shared card data
│       └── stats/                # GET community counter stats
├── components/
│   ├── TacticalPitch.tsx         # Interactive 4-3-3 squad builder grid
│   ├── PredictionModal.tsx       # Predictions + hot takes form
│   ├── MatchLiveChat.tsx         # localStorage banter chat (live matches)
│   ├── SportsCenterCard.tsx      # FIFA-style card renderer (canvas + SVG)
│   ├── FlagImage.tsx             # flagcdn.com flag images w/ emoji fallback
│   ├── Navbar.tsx                # Top navigation bar
│   ├── Footer.tsx                # Footer
│   ├── Providers.tsx             # React Query + client providers
│   └── SmoothScroll.tsx          # Lenis smooth scroll init
├── lib/
│   ├── matchUtils.ts             # Shared: parseLocalDate, getDeterministicMatchResult, getFlagEmoji
│   ├── countries.ts              # Country name → ISO code map (+ flagcdn URL helper)
│   ├── worldcupData.ts           # Server-side match/team fetcher (5-min TTL cache)
│   ├── profileSync.ts            # Client-side localStorage ↔ DB sync helpers
│   ├── roster.ts                 # 32-team player roster data
│   ├── db.ts                     # Prisma singleton client
│   └── tribunalDB.ts             # Static tribunal/verdict data types
prisma/
│   └── schema.prisma             # DB models: FootballIQProfile, MatchPrediction, HotTake, ChatMessage, MatchCard
public/
│   ├── images/
│   │   ├── og-preview.png        # 1200×630 social share image
│   │   └── *.webp                # Background images
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
Groq (llama-3.3-70b-specdec)
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
   - `GROQ_API_KEY`
   - `NVIDIA_API_KEY` *(optional)*
   - `NEXT_PUBLIC_SITE_URL` *(e.g. `https://ballknowledge.vercel.app`)*
4. Deploy → all 19 routes compile statically or as serverless functions

---

## Self-Hosting (Raspberry Pi / VPS)

See [`README-raspi.md`](README-raspi.md) for the full PM2 + Nginx reverse proxy setup guide.

---

## License

MIT — see [LICENSE](LICENSE).
