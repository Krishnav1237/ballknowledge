# Football IQ Reputation Platform 🏆

[![Live Platform](https://img.shields.io/badge/Live-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://football-viral.vercel.app)

**Football IQ** is a single, unified football reputation platform scoped around the **FIFA World Cup 2026 Season**. Fans build their persistent football reputation, one matchday decision at a time, by locking in predictions and bold hot takes on tournament fixtures, generating collectible FIFA-style verdict cards.

*“Football IQ: Build your football reputation, one match at a time.”*

🔗 **Live Website**: [football-viral.vercel.app](https://football-viral.vercel.app)

---

## Core Product Journey

1. **World Cup 2026 Hub**: The tournament cockpit. View dynamic group standings (Groups A-L) and daily fixture schedules categorized by Today, Tomorrow, Upcoming, and Completed status.
2. **Match Hub**: Select any upcoming match to lock in score predictions, MOTM, first goalscorer, and hot takes. Chat feeds and tactical picks are previewed as locked future modules (V2/V3).
3. **Football IQ Progression Screen**: When a match completes, inputs are automatically graded against the real match results. Watch an interactive VAR review animation before your persistent **Overall Rating** changes (e.g. `80 → 83`) are calculated and revealed.
4. **Collectible Verdict Cards**: Grading a match yields a collectible FIFA-style player card (Common, Rare, Epic, Legendary) based on your performance score.
5. **Persistent My Card Page**: View your personal Football IQ card, season stats breakdown (Prediction Rating, Hot Take Rating, etc.), and digital album of collected match verdict cards.
6. **Viral Sharing**: Share individual verdict cards via `/card/[id]` or your entire public season card deck via `/u/[username]`.

---

## Scoring Formulas & State Locks

### Match Status
- **UPCOMING**: Before kickoff. Predictions and takes are fully **editable**.
- **LIVE**: During match time. Submissions are **locked**.
- **COMPLETED**: Post match. Submissions are **locked and graded**.

### Rating Formulas
- **Prediction Rating**: Exact Score Match (`+15`), Correct Outcome (`+5`), Incorrect Outcome (`-2`).
- **Hot Take Rating**: AI Evaluation OVR >= 75 (`+10`), OVR <= 35 (`-5`), Mid-take (`+1`).
- **Overall Football IQ Rating**: Scoped under "World Cup 2026 Season". Calculated as:
  $$\text{Overall Rating} = (0.5 \times \text{Prediction Rating}) + (0.5 \times \text{Hot Take Rating})$$

### Rarity Bands
- `0 - 59`: **COMMON**
- `60 - 74`: **RARE**
- `75 - 89`: **EPIC**
- `90+`: **LEGENDARY**

---

## Technology Stack

- **Core**: Next.js 16 App Router, TypeScript, React 19
- **Database**: Prisma Client v6 (PostgreSQL with Local Storage cache/fallback)
- **AI Engine**: Groq API (`llama-3.3-70b-specdec` failover to Nvidia NIM `meta/llama-3.1-70b-instruct`) for grading takes.
- **Styling**: Tailwind CSS v4, custom glassmorphism overlays
- **Motion**: GSAP, ScrollTrigger, Framer Motion, Lenis Smooth Scroll
- **Icons**: Lucide Icons

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   Create a `.env` or `.env.local` file:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"
   GROQ_API_KEY="gsk_..."
   NVIDIA_API_KEY="nvapi-..."
   ```

3. **To run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```
