# CLAUDE.md - Developer Guide

## Commands
- **Start Dev Server**: `npm run dev`
- **Build Production**: `npm run build`
- **Start Production Server**: `npm run start`
- **Lint Codebase**: `npm run lint`
- **Database Migrations**: `npx prisma migrate dev`
- **Push Schema (No Migration)**: `npx prisma db push`
- **Generate Prisma Client**: `npx prisma generate`

## Environment Variables
Create a `.env` or `.env.local` file with:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"
GROQ_API_KEY="gsk_..."
NVIDIA_API_KEY="nvapi-..."
```

## Architecture & Tech Stack
- **Framework**: Next.js 16 App Router (TypeScript)
- **Database & ORM**: PostgreSQL + Prisma Client v6 (with local storage caching and db offline fallbacks)
- **AI Integration**: Groq API (`llama-3.3-70b-specdec` for sub-second responses) or Nvidia NIM API (`meta/llama-3.1-70b-instruct`) for grading hot takes, with a local deterministic tribunal fallback if offline.
- **Styling**: Tailwind CSS v4, Gold/Burgundy layout accents.
- **Animations**: Framer Motion (interactive layouts) + GSAP & ScrollTrigger (parallax depth) + Lenis (smooth scrolling).
- **Icons**: Lucide Icons (`lucide-react`).
- **Primary Pages**:
  - **World Cup Hub (`/world-cup-hub`)**: Dynamic groups standings and schedule tabs.
  - **Match Room Page (`/match/[id]`)**: Prediction/take submissions cockpit, locked states for live/completed fixtures, and reputation progress reveals with match cards.
  - **My Card (`/football-iq`)**: Visual overall Football IQ card and collected Match Verdict Cards album.
  - **Settings (`/profile`)**: Manage username, avatar settings, and toggle roles.
  - **Public Share Pages**: `/card/[id]` (viral card share) and `/u/[username]` (profile share).

## Core Rules & Formulas

### 1. Match Lock States
- **UPCOMING**: (System time < Match kickoff). Submissions are **editable**.
- **LIVE**: (Match kickoff <= System time < Match kickoff + 2 hrs). Submissions are **locked**.
- **COMPLETED**: (System time >= Match kickoff + 2 hrs). Submissions are **locked and graded** against real results from the World Cup dataset.

### 2. Football IQ Scoring Formulas
- **Prediction Rating**: Starts at `50`. Exact Match Score (`+15`), Correct Outcome (`+5`), Incorrect Outcome (`-2`).
- **Hot Take Rating**: Starts at `50`. AI Graded OVR >= 75 (`+10`), OVR <= 35 (`-5`), Mid-take (`+1`).
- **Overall Rating**: Scoped under "World Cup 2026 Season". Calculated as:
  $$\text{Overall Rating} = (0.5 \times \text{Prediction Rating}) + (0.5 \times \text{Hot Take Rating})$$
  *(Tactical and Community ratings are locked at 50 for the MVP)*

### 3. Card Rarity
Every completed match graded yields a Match Verdict Card. Rarity is determined by performance score (0-99):
- `0 - 59`: **COMMON**
- `60 - 74`: **RARE**
- `75 - 89`: **EPIC**
- `90+`: **LEGENDARY**

### 4. User Roles
- `FREE`: 3 hot takes, no substitutes, regular chat.
- `PREMIUM`: 5 hot takes, 2 substitutes, roast chat styling, user tagging.
- `ADMIN`: Access to hidden controls (kickoff date lock bypasses).

## Code Style & Implementation Guidelines
- **Database Safety**: Wrap database queries in `try/catch` blocks. If queries fail, operate via `localStorage` cache/fallback.
- **Rendering Purity**: Do not execute impure functions (e.g. `Math.random()`) directly in render blocks. Calculate values when `mounted` is true.
- **Tailwind v4 theme**: Define custom themes and colors inside `src/app/globals.css` using `@theme` configuration directives.
