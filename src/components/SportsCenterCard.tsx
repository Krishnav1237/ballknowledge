'use client';

import { VerdictData } from '@/lib/tribunalDB';

function get4Metrics(data: VerdictData): [
  { label: string; val: number },
  { label: string; val: number },
  { label: string; val: number },
  { label: string; val: number }
] {
  const stats = data.stats || [];
  const statsJson = (data as any).statsJson || {};

  const prd = statsJson.prd
    ?? stats.find(s => s.label === 'PRD')?.val
    ?? (data as any).predictionRating
    ?? data.ovr;

  const mgr = statsJson.mgr
    ?? stats.find(s => s.label === 'MGR')?.val
    ?? (data as any).managerRating
    ?? Math.max(30, Math.min(99, data.ovr - 3));

  const hot = statsJson.hot
    ?? stats.find(s => s.label === 'HOT')?.val
    ?? (data as any).hotTakeRating
    ?? Math.max(30, Math.min(99, data.ovr + 2));

  const rst = statsJson.rst
    ?? stats.find(s => s.label === 'RST')?.val
    ?? (data as any).roastScore
    ?? Math.max(50, Math.min(99, data.ovr + 1));

  return [
    { label: 'PRD', val: Math.round(prd) },
    { label: 'MGR', val: Math.round(mgr) },
    { label: 'HOT', val: Math.round(hot) },
    { label: 'RST', val: Math.round(rst) },
  ];
}

/* ——— Rarity colour tokens ——— */
function rarityTokens(rarity: string) {
  switch (rarity) {
    case 'LEGENDARY':
      return {
        glow: '#F59E0B',
        border: 'url(#vcard-gold-grad)',
        bg: 'from-[#2C1A04] via-[#0E0A02] to-[#020308]',
        accent: 'text-amber-300',
        accentBg: 'bg-amber-400/15 border-amber-400/40',
        statLabel: 'text-amber-300',
        statBorder: 'border-amber-400/30',
        badge: 'border-amber-400/60',
      };
    case 'EPIC':
      return {
        glow: '#A855F7',
        border: 'url(#vcard-purple-grad)',
        bg: 'from-[#1A042C] via-[#08020E] to-[#020308]',
        accent: 'text-purple-300',
        accentBg: 'bg-purple-400/15 border-purple-400/40',
        statLabel: 'text-purple-300',
        statBorder: 'border-purple-400/30',
        badge: 'border-purple-400/60',
      };
    case 'RARE':
      return {
        glow: '#3B82F6',
        border: 'url(#vcard-blue-grad)',
        bg: 'from-[#04102C] via-[#02050E] to-[#020308]',
        accent: 'text-sky-300',
        accentBg: 'bg-sky-400/15 border-sky-400/40',
        statLabel: 'text-sky-300',
        statBorder: 'border-sky-400/30',
        badge: 'border-sky-400/60',
      };
    default: // COMMON
      return {
        glow: '#E11D48',
        border: 'url(#vcard-rose-grad)',
        bg: 'from-[#25040E] via-[#0E0308] to-[#02050E]',
        accent: 'text-rose-300',
        accentBg: 'bg-rose-500/15 border-rose-500/40',
        statLabel: 'text-rose-400',
        statBorder: 'border-rose-500/30',
        badge: 'border-rose-500/60',
      };
  }
}

export default function SportsCenterCard({
  data,
  cardRef,
}: {
  data: VerdictData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const metrics = get4Metrics(data);
  const isVerdictCard = data.mode === 'take';

  const ovr = data.ovr || 50;
  const rarity = data.rarity || 'COMMON';
  const tok = rarityTokens(rarity);

  const avatarStyle = (data as any).avatarStyle || 'fun-emoji';
  const avatarSeed = (data as any).avatarSeed || data.playerName || 'Tactician';
  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const homeFlag: string | undefined = (data as any).homeFlag;
  const awayFlag: string | undefined = (data as any).awayFlag;
  const homeFifaCode: string = ((data as any).homeFifaCode || '').toUpperCase();
  const awayFifaCode: string = ((data as any).awayFifaCode || '').toUpperCase();

  /* Derive short 3-char codes from matchTitle if fifa codes not provided */
  const matchTitle: string = data.matchTitle || '';
  const titleParts = matchTitle.split(' vs ');
  const homeShort = homeFifaCode || (titleParts[0]?.trim().slice(0, 3).toUpperCase()) || 'HOM';
  const awayShort = awayFifaCode || (titleParts[1]?.trim().slice(0, 3).toUpperCase()) || 'AWY';

  const score: string | undefined = data.matchScore;

  const verdictLabel = (data.verdict || 'KNOWS BALL').toUpperCase();
  const managerName = (data.playerName || 'TACTICIAN').toUpperCase();

  if (isVerdictCard) {
    /* =========================================================================
       VERDICT CARD — PREMIUM EA SPORTS FC MATCH PLAQUE
       Fixed 340 × 480 px canvas. All zones are absolutely positioned so
       nothing can push each other and overflow.
       ========================================================================= */

    const glowColor = tok.glow;

    return (
      <div
        ref={cardRef}
        className="relative select-none"
        style={{ width: 340, height: 480, fontFamily: "'Outfit', sans-serif" }}
      >
        {/* ── SVG Shield Frame ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          viewBox="0 0 340 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rarity gradient: gold */}
            <linearGradient id="vcard-gold-grad" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            {/* purple */}
            <linearGradient id="vcard-purple-grad" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F3E8FF" />
              <stop offset="35%" stopColor="#A855F7" />
              <stop offset="70%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#3B0764" />
            </linearGradient>
            {/* blue */}
            <linearGradient id="vcard-blue-grad" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="35%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            {/* rose (default / common) */}
            <linearGradient id="vcard-rose-grad" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFE4E6" />
              <stop offset="35%" stopColor="#F43F5E" />
              <stop offset="70%" stopColor="#BE123C" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>

            <filter id="vcard-frame-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor={glowColor} floodOpacity="0.70" />
            </filter>
          </defs>

          {/* Outer cyber-shield border */}
          <path
            d="M 16,40 C 16,40 42,8 94,8 L 170,4 L 246,8 C 298,8 324,40 324,40 L 332,360 C 332,390 278,444 170,476 C 62,444 8,390 8,360 Z"
            stroke={tok.border}
            strokeWidth="4"
            fill="none"
            filter="url(#vcard-frame-glow)"
          />
          {/* Inner whisker accent */}
          <path
            d="M 16,40 C 16,40 42,8 94,8 L 170,4 L 246,8 C 298,8 324,40 324,40 L 332,360 C 332,390 278,444 170,476 C 62,444 8,390 8,360 Z"
            stroke="white"
            strokeWidth="0.8"
            opacity="0.25"
            fill="none"
            style={{ transform: 'scale(0.96)', transformOrigin: '170px 240px' }}
          />

          {/* Horizontal divider line above stats zone */}
          <line x1="36" y1="382" x2="304" y2="382" stroke={glowColor} strokeWidth="1" opacity="0.45" />
        </svg>

        {/* ── Clipped background fill ── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'polygon(3% 9%, 15% 4%, 35% 4%, 50% 1%, 65% 4%, 85% 4%, 97% 9%, 98% 87%, 50% 99%, 2% 87%)',
          }}
        >
          <div className={`w-full h-full bg-gradient-to-b ${tok.bg}`} />

          {/* Subtle diagonal scan-lines texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px)',
            }}
          />

          {/* Top radial glow spot */}
          <div
            className="absolute top-0 left-0 right-0 h-40 opacity-20"
            style={{
              background: `radial-gradient(ellipse 60% 60% at 50% 0%, ${glowColor}, transparent)`,
            }}
          />
        </div>

        {/* ================================================================
            ZONE A — Top Row  (y: 28–80)  OVR | BRAND | FLAG
            ================================================================ */}

        {/* A1: OVR Rating Stack — absolute top-left */}
        <div className="absolute z-40 pointer-events-none" style={{ top: 28, left: 24 }}>
          <span
            className="block text-white leading-none"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 42, textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}
          >
            {ovr}
          </span>
          <span
            className={`block text-center text-[9px] font-black tracking-[0.2em] uppercase mt-[-2px] ${tok.accent}`}
          >
            VAR
          </span>
        </div>

        {/* A2: Brand badge — absolute top-center */}
        <div className="absolute z-40 pointer-events-none flex justify-center" style={{ top: 36, left: 0, right: 0 }}>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-[5px] backdrop-blur-md"
            style={{
              background: 'rgba(2,6,18,0.92)',
              border: `1px solid ${glowColor}55`,
              boxShadow: `0 4px 16px rgba(0,0,0,0.9), 0 0 10px ${glowColor}30`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ball_knowledge_logo.png" alt="" className="w-[14px] h-[14px] object-contain rounded-full" />
            <span className="text-[8px] font-black tracking-[0.18em] uppercase text-white">
              VAR <span style={{ color: glowColor }}>TRIBUNAL</span>
            </span>
          </div>
        </div>

        {/* A3: Manager country flag — absolute top-right */}
        <div className="absolute z-40 pointer-events-none" style={{ top: 34, right: 24 }}>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 32, height: 32,
              background: 'rgba(2,6,18,0.92)',
              border: `1px solid ${glowColor}55`,
              boxShadow: `0 4px 12px rgba(0,0,0,0.85)`,
            }}
          >
            <span className="text-[15px] leading-none">{data.countryFlag || '🌍'}</span>
          </div>
        </div>

        {/* ================================================================
            ZONE B — Avatar  (y: 92–148)  centred
            ================================================================ */}
        <div className="absolute z-40 pointer-events-none" style={{ top: 88, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div
            className="overflow-hidden"
            style={{
              width: 56, height: 56,
              borderRadius: '50%',
              border: `2.5px solid ${glowColor}90`,
              boxShadow: `0 0 18px ${glowColor}55, 0 4px 12px rgba(0,0,0,0.8)`,
              background: 'rgba(0,0,0,0.7)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="Manager" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* ================================================================
            ZONE C — Match Fixture Banner  (y: 158–205)
            Flag | CODE  score  CODE | Flag
            ================================================================ */}
        <div
          className="absolute z-40 pointer-events-none"
          style={{ top: 158, left: 28, right: 28 }}
        >
          {/* Outer fixture banner */}
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.82)',
              border: `1.5px solid ${glowColor}60`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            {/* Top micro-label */}
            <div
              className="w-full text-center py-[3px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${glowColor}28, transparent)`,
                borderBottom: `1px solid ${glowColor}30`,
              }}
            >
              <span className="text-[7.5px] font-black tracking-[0.25em] uppercase" style={{ color: glowColor }}>
                ⚽ MATCH FIXTURE
              </span>
            </div>

            {/* Main fixture row */}
            <div className="flex items-center justify-between px-3 py-2.5">
              {/* Home team */}
              <div className="flex flex-col items-center gap-1 w-[80px]">
                {homeFlag ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={homeFlag}
                    alt={homeShort}
                    className="object-cover rounded-[3px]"
                    style={{ width: 36, height: 24, border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
                  />
                ) : (
                  <div style={{ width: 36, height: 24, background: '#111', borderRadius: 3 }} />
                )}
                <span
                  className="font-black uppercase tracking-wider text-white"
                  style={{ fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.12em' }}
                >
                  {homeShort}
                </span>
              </div>

              {/* Score / VS */}
              <div className="flex flex-col items-center flex-shrink-0">
                {score ? (
                  <>
                    <div
                      className="rounded-lg px-3 py-1"
                      style={{
                        background: `${glowColor}22`,
                        border: `1px solid ${glowColor}60`,
                      }}
                    >
                      <span
                        className="text-white font-black tracking-wider"
                        style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, letterSpacing: '0.08em', textShadow: `0 0 12px ${glowColor}` }}
                      >
                        {score}
                      </span>
                    </div>
                    <span className="text-[7px] font-black tracking-[0.2em] uppercase mt-0.5" style={{ color: glowColor }}>
                      FINAL
                    </span>
                  </>
                ) : (
                  <div
                    className="rounded-lg px-4 py-1"
                    style={{
                      background: `${glowColor}22`,
                      border: `1px solid ${glowColor}50`,
                    }}
                  >
                    <span className="text-white font-black text-[13px] tracking-widest" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      VS
                    </span>
                  </div>
                )}
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center gap-1 w-[80px]">
                {awayFlag ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={awayFlag}
                    alt={awayShort}
                    className="object-cover rounded-[3px]"
                    style={{ width: 36, height: 24, border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
                  />
                ) : (
                  <div style={{ width: 36, height: 24, background: '#111', borderRadius: 3 }} />
                )}
                <span
                  className="font-black uppercase tracking-wider text-white"
                  style={{ fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.12em' }}
                >
                  {awayShort}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            ZONE D — Verdict Title  (y: 262–304)
            ================================================================ */}
        <div
          className="absolute z-40 pointer-events-none"
          style={{ top: 268, left: 20, right: 20, textAlign: 'center' }}
        >
          <h2
            className="text-white uppercase leading-tight"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 900,
              fontSize: verdictLabel.length > 14 ? 18 : verdictLabel.length > 10 ? 21 : 24,
              letterSpacing: '0.08em',
              textShadow: `0 4px 16px ${glowColor}90, 0 2px 8px rgba(0,0,0,0.9)`,
              lineHeight: 1.15,
            }}
          >
            {verdictLabel}
          </h2>
        </div>

        {/* ================================================================
            ZONE E — Manager Name Tag  (y: 316–340)
            ================================================================ */}
        <div
          className="absolute z-40 pointer-events-none"
          style={{ top: 316, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}
        >
          <div
            className="rounded-full px-4 py-[5px] flex items-center gap-1.5"
            style={{
              background: `${glowColor}18`,
              border: `1px solid ${glowColor}50`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.7)`,
              maxWidth: 260,
            }}
          >
            <span className="text-white/50 text-[8px] font-black uppercase tracking-widest">MGR</span>
            <span
              className="font-black text-[10px] uppercase tracking-wider truncate"
              style={{ color: glowColor, fontFamily: "'Oswald', sans-serif", maxWidth: 190 }}
            >
              {managerName}
            </span>
          </div>
        </div>

        {/* ================================================================
            ZONE F — Rarity Pip Row  (y: 348–360)
            ================================================================ */}
        <div
          className="absolute z-40 pointer-events-none"
          style={{ top: 350, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}
        >
          {['LEGENDARY', 'EPIC', 'RARE', 'COMMON'].map((r) => (
            <div
              key={r}
              style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: rarity === r ? glowColor : 'rgba(255,255,255,0.15)',
                boxShadow: rarity === r ? `0 0 6px ${glowColor}` : 'none',
              }}
            />
          ))}
          <span
            className="text-[7.5px] font-black uppercase tracking-widest ml-1"
            style={{ color: glowColor, lineHeight: '6px', alignSelf: 'center' }}
          >
            {rarity}
          </span>
        </div>

        {/* ================================================================
            ZONE G — Stats Panel  (y: 368–430) — FIXED HEIGHT, NO OVERFLOW
            ================================================================ */}
        <div
          className="absolute z-40 pointer-events-none"
          style={{ top: 368, left: 28, right: 28 }}
        >
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{
              background: 'rgba(2,4,18,0.97)',
              border: `2px solid ${glowColor}70`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 16px ${glowColor}25`,
            }}
          >
            <div className="grid grid-cols-4" style={{ height: 60 }}>
              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  className="flex flex-col items-center justify-center"
                  style={{
                    borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    padding: '6px 4px',
                  }}
                >
                  <span
                    className="font-black uppercase block"
                    style={{ fontSize: 8, letterSpacing: '0.2em', color: glowColor, lineHeight: 1 }}
                  >
                    {m.label}
                  </span>
                  <span
                    className="text-white font-black block mt-[3px]"
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 900,
                      fontSize: 20,
                      lineHeight: 1,
                      textShadow: `0 2px 6px rgba(0,0,0,0.9)`,
                    }}
                  >
                    {m.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     MAIN TOURNAMENT CARD — CLASSIC PURE GOLD FUT SHIELD (UNCHANGED DESIGN)
     ========================================================================= */
  return (
    <div
      ref={cardRef}
      className="relative w-[340px] h-[480px] bg-transparent select-none transition-all duration-500"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* SVG Container defining the classic FUT shield geometry */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
        viewBox="0 0 340 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="main-gold-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          <filter id="main-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#F59E0B" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Outer Metallic Shield Border Frame */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#main-gold-border)"
          strokeWidth="3.5"
          fill="none"
          filter="url(#main-gold-glow)"
        />

        {/* Concentric Inner Line */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#main-gold-border)"
          strokeWidth="0.8"
          opacity="0.4"
          fill="none"
          style={{ transform: 'scale(0.95)', transformOrigin: '162px 240px' }}
        />
      </svg>

      {/* Card Content Container Clipped strictly within FUT Shield Shape */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          clipPath: 'polygon(2% 12%, 15% 8%, 35% 8%, 50% 2%, 65% 8%, 85% 8%, 98% 12%, 98% 78%, 50% 98%, 2% 78%)'
        }}
      >
        {data.aiImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.aiImageUrl} alt="AI FIFA Card" className="w-full h-full object-cover" />
        ) : (
          <div className="relative w-full h-full p-6 flex flex-col justify-between text-white bg-gradient-to-b from-[#1F1504] via-[#0B0F19] to-[#030712]">
            <div className="h-20" />

            {/* Center Manager Name & Ruling Spotlight */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative my-auto text-center w-full px-2">
              
              {/* Custom Manager Avatar Feature */}
              <div className="w-14 h-14 rounded-full border-2 border-amber-400/60 p-0.5 bg-black/60 shadow-[0_0_15px_rgba(245,158,11,0.5)] overflow-hidden shrink-0 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="Manager Avatar" className="w-full h-full object-cover rounded-full" />
              </div>

              <h2
                className="font-bold text-[24px] sm:text-[26px] tracking-widest uppercase leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] truncate max-w-[270px]"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
              >
                {data.playerName || 'MANAGER'}
              </h2>
              
              <span className="inline-block text-[10px] font-black tracking-widest uppercase mt-2 px-4 py-1 rounded-md shadow-md backdrop-blur-sm text-amber-300 bg-amber-400/15 border border-amber-400/40">
                👑 {data.verdict || 'KNOWS BALL'}
              </span>
            </div>

            <div className="h-20" />
          </div>
        )}

        {/* 1. OVR Rating & Position (Top Left Stack) */}
        <div className="absolute top-[44px] left-[26px] z-40 flex flex-col items-center pointer-events-none">
          <span
            className="text-[46px] tracking-tighter leading-none text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)]"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
          >
            {ovr}
          </span>
          <span className="text-[10px] font-black tracking-widest uppercase mt-0.5 drop-shadow text-amber-300">
            MGR
          </span>
        </div>

        {/* 2. BallKnowledge Product Logo Branding (Top Center Badge) */}
        <div className="absolute top-[46px] left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-[#020612]/90 rounded-full px-3 py-1 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.95)] border border-amber-400/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ball_knowledge_logo.png" alt="Ball Knowledge" className="w-4 h-4 object-contain rounded-full drop-shadow" />
            <span className="text-[8.5px] font-black tracking-widest uppercase text-white">
              BALL<span className="text-amber-300">KNOWLEDGE</span>
            </span>
          </div>
        </div>

        {/* 3. Country Flag Badge (Top Right Badge) */}
        <div className="absolute top-[46px] right-[26px] z-40 pointer-events-none">
          <div className="flex items-center justify-center bg-[#020612]/90 rounded-full w-8 h-8 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.9)] border border-amber-400/40">
            <span className="text-[14px] leading-none">{data.countryFlag || '🌍'}</span>
          </div>
        </div>

        {/* 4. High-Contrast Stats Panel (Bottom Row) */}
        <div className="absolute bottom-[64px] left-[28px] right-[28px] z-40 pointer-events-none">
          <div className="w-full h-[52px] bg-[#020612]/95 rounded-xl flex items-center justify-between px-2 py-1 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.95)] border border-amber-400/40">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col items-center flex-1 border-r last:border-r-0 border-white/10">
                <span className="text-[8.5px] font-black tracking-widest uppercase drop-shadow text-amber-300">
                  {m.label}
                </span>
                <span
                  className="text-[18px] font-black text-white leading-none mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
                >
                  {m.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
