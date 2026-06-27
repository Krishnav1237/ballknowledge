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

  const prd = statsJson.prd ?? stats.find(s => s.label === 'PRD')?.val ?? (data as any).predictionRating ?? data.ovr;
  const mgr = statsJson.mgr ?? stats.find(s => s.label === 'MGR')?.val ?? (data as any).managerRating ?? Math.max(30, Math.min(99, data.ovr - 3));
  const hot = statsJson.hot ?? stats.find(s => s.label === 'HOT')?.val ?? (data as any).hotTakeRating ?? Math.max(30, Math.min(99, data.ovr + 2));
  const rst = statsJson.rst ?? stats.find(s => s.label === 'RST')?.val ?? (data as any).roastScore ?? Math.max(50, Math.min(99, data.ovr + 1));

  return [
    { label: 'PRD', val: Math.round(prd) },
    { label: 'MGR', val: Math.round(mgr) },
    { label: 'HOT', val: Math.round(hot) },
    { label: 'RST', val: Math.round(rst) },
  ];
}

/* ——— Rarity colour tokens ——— */
function rarityTokens(rarity: string, isPredicted: boolean) {
  if (!isPredicted) {
    return {
      glow: '#4B5563',
      border: 'url(#vcard-locked-grad)',
      bg: 'from-[#111827] via-[#0F172A] to-[#030712]',
      text: 'text-gray-400'
    };
  }
  switch (rarity) {
    case 'LEGENDARY': return { glow: '#F59E0B', border: 'url(#vcard-toty-grad)',   bg: 'from-[#00112A] via-[#020713] to-[#000205]', text: 'text-amber-400' };
    case 'EPIC':      return { glow: '#A855F7', border: 'url(#vcard-purple-grad)', bg: 'from-[#12021C] via-[#06020C] to-[#020308]', text: 'text-purple-400' };
    case 'RARE':      return { glow: '#3B82F6', border: 'url(#vcard-blue-grad)',   bg: 'from-[#020B1C] via-[#02040C] to-[#020308]', text: 'text-blue-400' };
    default:          return { glow: '#E11D48', border: 'url(#vcard-rose-grad)',   bg: 'from-[#1A0308] via-[#080208] to-[#020308]', text: 'text-rose-400' };
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

  const isPredicted = data.isPredicted !== false; // defaults to true for backward compatibility
  const ovr = data.ovr || 50;
  const rarity = isPredicted ? (data.rarity || 'COMMON') : 'LOCKED';
  const tok = rarityTokens(rarity, isPredicted);

  const avatarStyle = (data as any).avatarStyle || 'fun-emoji';
  const avatarSeed = (data as any).avatarSeed || data.playerName || 'Tactician';
  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const homeFlag: string | undefined = (data as any).homeFlag || data.homeFlag;
  const awayFlag: string | undefined = (data as any).awayFlag || data.awayFlag;
  const homeFifaCode: string = ((data as any).homeFifaCode || data.homeFifaCode || '').toUpperCase();
  const awayFifaCode: string = ((data as any).awayFifaCode || data.awayFifaCode || '').toUpperCase();

  const matchTitle: string = data.matchTitle || '';
  const titleParts = matchTitle.split(' vs ');
  const homeShort = homeFifaCode || titleParts[0]?.trim().slice(0, 3).toUpperCase() || 'HOM';
  const awayShort = awayFifaCode || titleParts[1]?.trim().slice(0, 3).toUpperCase() || 'AWY';

  const score: string | undefined = data.matchScore;
  const verdictLabel = isPredicted ? (data.verdict || 'KNOWS BALL').toUpperCase() : 'NO PREDICTION';

  if (isVerdictCard) {
    const glow = tok.glow;

    return (
      <div
        ref={cardRef}
        className="relative select-none"
        style={{ width: 340, height: 480, fontFamily: "'Outfit', sans-serif" }}
      >
        {/* ── SVG Cyber-Shield Frame ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          viewBox="0 0 340 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vcard-gold-grad"   x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#FFFBEB"/><stop offset="35%" stopColor="#F59E0B"/><stop offset="70%" stopColor="#D97706"/><stop offset="100%" stopColor="#78350F"/>
            </linearGradient>
            <linearGradient id="vcard-toty-grad" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#FFFBEB"/>
              <stop offset="25%"  stopColor="#D4AF37"/>
              <stop offset="55%"  stopColor="#0E3060"/>
              <stop offset="85%"  stopColor="#2563EB"/>
              <stop offset="100%" stopColor="#D97706"/>
            </linearGradient>
            <linearGradient id="vcard-purple-grad" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#F3E8FF"/><stop offset="35%" stopColor="#A855F7"/><stop offset="70%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#3B0764"/>
            </linearGradient>
            <linearGradient id="vcard-blue-grad"   x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#EFF6FF"/><stop offset="35%" stopColor="#3B82F6"/><stop offset="70%" stopColor="#1D4ED8"/><stop offset="100%" stopColor="#1E3A8A"/>
            </linearGradient>
            <linearGradient id="vcard-rose-grad"   x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#FFE4E6"/><stop offset="35%" stopColor="#F43F5E"/><stop offset="70%" stopColor="#BE123C"/><stop offset="100%" stopColor="#4C0519"/>
            </linearGradient>
            <linearGradient id="vcard-locked-grad"   x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#9CA3AF"/><stop offset="50%" stopColor="#4B5563"/><stop offset="100%" stopColor="#1F2937"/>
            </linearGradient>
            <filter id="vcard-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor={glow} floodOpacity="0.75"/>
            </filter>
            <clipPath id="vcard-shield-clip">
              <path d="M 16,40 C 16,40 42,8 94,8 L 170,4 L 246,8 C 298,8 324,40 324,40 L 332,360 C 332,390 278,444 170,476 C 62,444 8,390 8,360 Z" />
            </clipPath>
          </defs>

          {/* Outer shield border */}
          <path
            d="M 16,40 C 16,40 42,8 94,8 L 170,4 L 246,8 C 298,8 324,40 324,40 L 332,360 C 332,390 278,444 170,476 C 62,444 8,390 8,360 Z"
            stroke={tok.border} strokeWidth="4" fill="none" filter="url(#vcard-glow)"
          />
          {/* Inner whisker */}
          <path
            d="M 16,40 C 16,40 42,8 94,8 L 170,4 L 246,8 C 298,8 324,40 324,40 L 332,360 C 332,390 278,444 170,476 C 62,444 8,390 8,360 Z"
            stroke="white" strokeWidth="0.8" opacity="0.18" fill="none"
            style={{ transform: 'scale(0.965)', transformOrigin: '170px 240px' }}
          />

          {/* Horizontal Stats Separator Line */}
          <line x1="38" y1="362" x2="302" y2="362" stroke={glow} strokeWidth="1.5" opacity="0.45" />

          {/* Vertical Separator Lines for Stats Columns */}
          <line x1="104" y1="372" x2="104" y2="408" stroke="white" strokeWidth="0.8" opacity="0.1" />
          <line x1="170" y1="372" x2="170" y2="408" stroke="white" strokeWidth="0.8" opacity="0.1" />
          <line x1="236" y1="372" x2="236" y2="408" stroke="white" strokeWidth="0.8" opacity="0.1" />
        </svg>

        {/* ── Background fill (clipped to shield) ── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: 'url(#vcard-shield-clip)' }}
        >
          {data.aiImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.aiImageUrl} alt="AI FIFA Card" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className={`w-full h-full bg-gradient-to-b ${tok.bg}`}/>
              {/* scan-lines */}
              <div
                className="absolute inset-0 opacity-[0.035]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,1) 3px,rgba(255,255,255,1) 4px)' }}
              />
              {/* top radial glow */}
              <div className="absolute top-0 left-0 right-0 h-48 opacity-20"
                style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%,${glow},transparent)` }}
              />
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════
            ZONE A — TOP ROW: OVR | RARITY BADGE | FLAG (Aligned with Season Card)
            y: 44 / 46
            ══════════════════════════════════════════ */}

        {/* A1 — OVR stack (top-left) */}
        <div className="absolute top-[44px] left-[26px] z-40 pointer-events-none flex flex-col items-center">
          <span
            className="block text-white leading-none font-black text-[44px]"
            style={{ fontFamily: "'Oswald', sans-serif", textShadow: '0 4px 10px rgba(0,0,0,0.9)' }}
          >
            {isPredicted ? ovr : '--'}
          </span>
          <span className="block text-center font-black text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: glow }}>
            VAR
          </span>
        </div>

        {/* A2 — Rarity Badge (top-center) */}
        <div className="absolute top-[46px] left-0 right-0 z-40 pointer-events-none flex justify-center">
          <div
            className="flex items-center gap-1.5 rounded-full px-4 py-[5px]"
            style={{
              background: 'rgba(2,4,16,0.94)',
              border: `1px solid ${glow}60`,
              boxShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 8px ${glow}28`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: glow, boxShadow: `0 0 6px ${glow}` }} />
            <span className="font-black uppercase text-[8px] tracking-[0.25em]" style={{ color: glow }}>
              {rarity}
            </span>
          </div>
        </div>

        {/* A3 — Country flag (top-right) */}
        <div className="absolute top-[46px] right-[26px] z-40 pointer-events-none">
          <div
            className="flex items-center justify-center rounded-full w-8 h-8"
            style={{ background: 'rgba(2,4,16,0.94)', border: `1px solid ${glow}55`, boxShadow: '0 3px 10px rgba(0,0,0,0.8)' }}
          >
            <span className="text-[14px] leading-none">{isPredicted ? (data.countryFlag || '🌍') : '🔒'}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE B — USER AVATAR (Upper Center - Height 120)
            y: 90 – 210
            Only rendered if there is no full AI image background
            ══════════════════════════════════════════ */}
        {!data.aiImageUrl && (
          <div className="absolute z-40 pointer-events-none" style={{ top: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 120, height: 120,
                borderRadius: '50%',
                boxShadow: `0 0 0 2px ${glow}90, 0 0 22px ${glow}40, 0 8px 24px rgba(0,0,0,0.85)`,
                padding: 4,
                background: `radial-gradient(circle, ${glow}20, rgba(0,0,0,0.95))`,
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ border: `2.5px solid ${glow}60`, background: 'rgba(0,0,0,0.8)' }}>
                {isPredicted ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Manager" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v-6.75a2.25 2.25 0 002.25-2.25z"></path>
                  </svg>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            ZONE C — VERDICT HEADLINE (Lowered to bottom, just above Score)
            y: 272
            ══════════════════════════════════════════ */}
        <div className="absolute z-40 pointer-events-none text-center" style={{ top: 272, left: 16, right: 16 }}>
          <h2
            className={`text-white uppercase leading-none font-black tracking-[0.05em] line-clamp-1 ${
              verdictLabel.length > 20 ? 'text-[15px]' : verdictLabel.length > 15 ? 'text-[18px]' : 'text-[22px]'
            }`}
            style={{ fontFamily: "'Oswald', sans-serif", textShadow: '0 4px 10px rgba(0,0,0,0.95)' }}
          >
            {verdictLabel}
          </h2>
        </div>

        {/* ══════════════════════════════════════════
            ZONE E — MATCH FIXTURE & SCORE (Lowered to bottom, just above Stats)
            y: 310
            ══════════════════════════════════════════ */}
        <div className="absolute z-40 pointer-events-none flex justify-center" style={{ top: 310, left: 0, right: 0 }}>
          <div
            className="rounded-lg px-4 py-2 flex items-center gap-3 backdrop-blur-md"
            style={{
              background: 'rgba(2,4,16,0.92)',
              border: `1px solid ${glow}40`,
              boxShadow: `0 4px 14px rgba(0,0,0,0.85)`,
            }}
          >
            <div className="flex items-center gap-1.5">
              {homeFlag && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={homeFlag} alt="" className="w-5 h-3.5 object-cover rounded-xs border border-white/10" />
              )}
              <span className="font-bold text-[10px] uppercase text-white tracking-widest font-mono">
                {homeShort}
              </span>
            </div>

            <span className="font-black text-[11px] text-white/50 px-1 font-mono flex items-center">
              {isPredicted && score ? (
                <span className="text-white bg-white/10 px-2 py-0.5 rounded font-bold font-mono">
                  {score}
                </span>
              ) : 'VS'}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[10px] uppercase text-white tracking-widest font-mono">
                {awayShort}
              </span>
              {awayFlag && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={awayFlag} alt="" className="w-5 h-3.5 object-cover rounded-xs border border-white/10" />
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE F — INTEGRATED STATS PANEL (Bottom Position)
            y: 364 – 416 (absolute bottom-[64px])
            ══════════════════════════════════════════ */}
        <div className="absolute bottom-[64px] left-[28px] right-[28px] z-40 pointer-events-none">
          <div className="w-full h-[52px] flex items-center justify-between px-2 py-1">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col items-center flex-1">
                <span className="text-[8.5px] font-black tracking-widest uppercase drop-shadow" style={{ color: glow }}>
                  {m.label}
                </span>
                <span
                  className="text-[18px] font-black text-white leading-none mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
                >
                  {isPredicted ? m.val : '--'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  /* =========================================================================
     MAIN TOURNAMENT CARD — CLASSIC GOLD FUT SHIELD (UNCHANGED DESIGN)
     ========================================================================= */
  return (
    <div
      ref={cardRef}
      className="relative w-[340px] h-[480px] bg-transparent select-none transition-all duration-500"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 340 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="main-gold-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FFFBEB"/>
            <stop offset="30%"  stopColor="#F59E0B"/>
            <stop offset="70%"  stopColor="#D97706"/>
            <stop offset="100%" stopColor="#78350F"/>
          </linearGradient>
          <filter id="main-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#F59E0B" floodOpacity="0.5"/>
          </filter>
          <clipPath id="main-shield-clip">
            <path d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z" />
          </clipPath>
        </defs>
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#main-gold-border)" strokeWidth="3.5" fill="none" filter="url(#main-gold-glow)"
        />
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#main-gold-border)" strokeWidth="0.8" opacity="0.4" fill="none"
          style={{ transform:'scale(0.95)', transformOrigin:'162px 240px' }}
        />
      </svg>

      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: 'url(#main-shield-clip)' }}
      >
        {data.aiImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.aiImageUrl} alt="AI FIFA Card" className="w-full h-full object-cover"/>
        ) : (
          <div className="relative w-full h-full p-6 flex flex-col justify-between text-white bg-gradient-to-b from-[#1F1504] via-[#0B0F19] to-[#030712]">
            <div className="h-20"/>
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative my-auto text-center w-full px-2">
              <div className="w-14 h-14 rounded-full border-2 border-amber-400/60 p-0.5 bg-black/60 shadow-[0_0_15px_rgba(245,158,11,0.5)] overflow-hidden shrink-0 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="Manager Avatar" className="w-full h-full object-cover rounded-full"/>
              </div>
              <h2
                className="font-bold text-[24px] sm:text-[26px] tracking-widest uppercase leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] truncate max-w-[270px]"
                style={{ fontFamily:"'Oswald',sans-serif", fontWeight:900 }}
              >{data.playerName || 'MANAGER'}</h2>
              <span className="inline-block text-[10px] font-black tracking-widest uppercase mt-2 px-4 py-1 rounded-md shadow-md backdrop-blur-sm text-amber-300 bg-amber-400/15 border border-amber-400/40">
                👑 {data.verdict || 'KNOWS BALL'}
              </span>
            </div>
            <div className="h-20"/>
          </div>
        )}

        {/* OVR */}
        <div className="absolute top-[44px] left-[26px] z-40 flex flex-col items-center pointer-events-none">
          <span className="text-[46px] tracking-tighter leading-none text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)]"
            style={{ fontFamily:"'Oswald',sans-serif", fontWeight:900 }}>{ovr}</span>
          <span className="text-[10px] font-black tracking-widest uppercase mt-0.5 drop-shadow text-amber-300">MGR</span>
        </div>

        {/* Brand badge */}
        <div className="absolute top-[46px] left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-[#020612]/90 rounded-full px-3 py-1 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.95)] border border-amber-400/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ball_knowledge_logo.png" alt="Ball Knowledge" className="w-4 h-4 object-contain rounded-full drop-shadow"/>
            <span className="text-[8.5px] font-black tracking-widest uppercase text-white">
              BALL<span className="text-amber-300">KNOWLEDGE</span>
            </span>
          </div>
        </div>

        {/* Country flag */}
        <div className="absolute top-[46px] right-[26px] z-40 pointer-events-none">
          <div className="flex items-center justify-center bg-[#020612]/90 rounded-full w-8 h-8 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.9)] border border-amber-400/40">
            <span className="text-[14px] leading-none">{data.countryFlag || '🌍'}</span>
          </div>
        </div>

        {/* Stats panel */}
        <div className="absolute bottom-[64px] left-[28px] right-[28px] z-40 pointer-events-none">
          <div className="w-full h-[52px] bg-[#020612]/95 rounded-xl flex items-center justify-between px-2 py-1 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.95)] border border-amber-400/40">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col items-center flex-1 border-r last:border-r-0 border-white/10">
                <span className="text-[8.5px] font-black tracking-widest uppercase drop-shadow text-amber-300">{m.label}</span>
                <span className="text-[18px] font-black text-white leading-none mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily:"'Oswald',sans-serif", fontWeight:900 }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
