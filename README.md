# BallKnowledge

Premier League 2026/27. Public OVR board. Rank is the OVR — nothing else.

🔗 **Live**: [ballknowledge.live](https://ballknowledge.live)

You land on the board. You see who is #1. You call the next fixture to climb. Cards are what you post when you want someone to beat you.

```
Board → Season map → Match → Card → Share
```

| Screen | Route | What it is |
|--------|-------|------------|
| Board | `/` and `/leaderboard` | Public OVR list. Take #1. |
| Season | `/premier-league` | 38 matchweeks, 380 fixtures, table |
| Match | `/match/[id]` | Lock score, MOTM, scorer, takes, XI. Chat when live. Grade when done. |
| Card | `/football-iq` | Your OVR card and album |
| Share | `/card/[id]`, `/u/[username]` | Screenshot / tweet bait |
| Get in | `/profile` | Sign in so the OVR stays public |

Scoring internals (PRD / MGR / HOT / RST → OVR) did not change. The product surface did: the board is the game.

---

## Stack

| Layer | Tech |
|-------|------|
| App | Next.js 16.2.9 (App Router, Turbopack), React 19 |
| DB | PostgreSQL + Prisma 6 |
| State | localStorage (`football_iq_profile`) + DB sync |
| Live data | `src/lib/premierleague/{clubs,matches}.json` |
| AI grade | OpenRouter → Groq → Nvidia → local heuristic |
| Style | Tailwind v4, dark `#030712` / `#0B0F19` / `#E11D48` |
| Deploy | Vercel |

---

## Commands

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev          # http://localhost:3000
npm test
npm run build
```

Required env: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL`. At least one of `OPENROUTER_API_KEY` / `GROQ_API_KEY` / `NVIDIA_API_KEY` for grading.

---

## How rank works

Overall = `0.35 PRD + 0.25 MGR + 0.25 HOT + 0.15 RST`.

| Status | Window |
|--------|--------|
| UPCOMING | Before kickoff — calls editable |
| LIVE | Kickoff → +3 hours — locked |
| COMPLETED | After that — grade and take the card |

Rarity: 90–99 Legendary, 75–89 Epic, 60–74 Rare, else Common.

Roles: FREE 3 takes / match, PREMIUM and ADMIN 5. ADMIN can bypass kickoff lock.

---

## Layout

```
src/app/page.tsx                 Game board (Take #1)
src/app/leaderboard/page.tsx     Same board
src/app/premier-league/page.tsx  Season map
src/app/match/[id]/page.tsx      Fixture
src/components/GameBoard.tsx     Board UI
src/lib/premierLeagueData.ts     20 clubs, 380 fixtures
src/lib/scoring.ts               PRD / MGR / HOT / RST / OVR
src/lib/shareCopy.ts             Tweet lines
src/proxy.ts                     Next.js 16 proxy (not middleware)
```

Pi / VPS: see `README-raspi.md`. Image-gen API notes: `OPENROUTER_IMAGE_GEN.md`. Agent rules: `CLAUDE.md`.
