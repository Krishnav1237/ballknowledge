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

export default function SportsCenterCard({
  data,
  cardRef,
}: {
  data: VerdictData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const metrics = get4Metrics(data);
  const hasAiImage = Boolean(data.aiImageUrl);
  const isVerdictCard = data.mode === 'take';

  const ovr = data.ovr || 50;

  const avatarStyle = (data as any).avatarStyle || 'fun-emoji';
  const avatarSeed = (data as any).avatarSeed || data.playerName || 'Tactician';
  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;

  if (isVerdictCard) {
    /* =========================================================================
       VERDICT CARD DESIGN: VAR CYBER-SHIELD PLAQUE WITH HIGH-VISIBILITY STATS
       ========================================================================= */
    return (
      <div
        ref={cardRef}
        className="relative w-[340px] h-[480px] bg-transparent select-none transition-all duration-500"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* SVG VAR Cyber-Shield Frame & Metallic Crimson Border */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          viewBox="0 0 340 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="verdict-shield-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFE4E6" />
              <stop offset="30%" stopColor="#F43F5E" />
              <stop offset="70%" stopColor="#BE123C" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>

            <filter id="verdict-shield-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#F43F5E" floodOpacity="0.65" />
            </filter>
          </defs>

          {/* Outer Cyber-Shield Border Path */}
          <path
            d="M 16,38 C 16,38 42,8 92,8 L 170,4 L 248,8 C 298,8 324,38 324,38 L 332,364 C 332,392 278,444 170,476 C 62,444 8,392 8,364 Z"
            stroke="url(#verdict-shield-border)"
            strokeWidth="4"
            fill="none"
            filter="url(#verdict-shield-glow)"
          />

          {/* Inner Laser Accent Line */}
          <path
            d="M 16,38 C 16,38 42,8 92,8 L 170,4 L 248,8 C 298,8 324,38 324,38 L 332,364 C 332,392 278,444 170,476 C 62,444 8,392 8,364 Z"
            stroke="#FFE4E6"
            strokeWidth="1"
            opacity="0.4"
            fill="none"
            style={{ transform: 'scale(0.95)', transformOrigin: '170px 240px' }}
          />
        </svg>

        {/* Card Content Container Clipped strictly within Cyber-Shield Shape */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            clipPath: 'polygon(3% 9%, 15% 4%, 35% 4%, 50% 1%, 65% 4%, 85% 4%, 97% 9%, 98% 88%, 50% 99%, 2% 88%)'
          }}
        >
          {hasAiImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.aiImageUrl} alt="AI FIFA Card" className="w-full h-full object-cover" />
          ) : (
            <div className="relative w-full h-full p-5 flex flex-col justify-between text-white bg-gradient-to-b from-[#280512] via-[#0F0308] to-[#030712]">
              <div className="h-16" />

              {/* Center Spotlight */}
              <div className="flex-1 flex flex-col items-center justify-center z-10 relative my-auto text-center w-full px-2">
                <div className="flex flex-col items-center gap-1.5 w-full">
                  
                  {/* Custom Manager Avatar Feature */}
                  <div className="w-13 h-13 rounded-full border-2 border-rose-500/60 p-0.5 bg-black/60 shadow-[0_0_15px_rgba(244,63,94,0.5)] overflow-hidden shrink-0 mb-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUrl} alt="Manager Avatar" className="w-full h-full object-cover rounded-full" />
                  </div>

                  {/* Match Teams & Score Metric Badge */}
                  {(data.matchTitle || data.matchScore) && (
                    <div className="bg-black/90 border border-rose-500/50 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                      <span className="text-[9px] font-black uppercase text-gray-200 tracking-wider">
                        ⚽ {data.matchTitle || 'WORLD CUP MATCH'}
                      </span>
                      {data.matchScore && (
                        <span className="text-[9.5px] font-mono font-bold text-rose-300 bg-rose-500/25 px-1.5 py-0.2 rounded border border-rose-500/40">
                          {data.matchScore}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Prominent VAR Verdict Title */}
                  <h2 
                    className="font-bold text-[22px] sm:text-[24px] tracking-widest uppercase leading-tight text-white drop-shadow-[0_4px_14px_rgba(244,63,94,0.85)] max-w-[280px]"
                    style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
                  >
                    {data.verdict || 'KNOWS BALL'}
                  </h2>

                  {/* Manager Alias & Decree */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8.5px] font-mono font-black tracking-widest uppercase text-amber-300 bg-amber-400/15 border border-amber-400/35 px-2.5 py-0.5 rounded-full shadow-sm">
                      MANAGER: {data.playerName || 'TACTICIAN'}
                    </span>
                    
                    {data.charge && (
                      <p className="text-[9px] text-gray-300 font-semibold italic max-w-[260px] line-clamp-1">
                        &ldquo;{data.charge}&rdquo;
                      </p>
                    )}
                  </div>

                </div>
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
            <span className="text-[10px] font-black tracking-widest uppercase mt-0.5 drop-shadow text-rose-400">
              VAR
            </span>
          </div>

          {/* 2. VAR Tribunal Branding (Top Center Badge) */}
          <div className="absolute top-[46px] left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-[#020612]/90 rounded-full px-3 py-1 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.95)] border border-rose-500/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ball_knowledge_logo.png" alt="Ball Knowledge" className="w-4 h-4 object-contain rounded-full drop-shadow" />
              <span className="text-[8.5px] font-black tracking-widest uppercase text-white">
                VAR<span className="text-rose-400"> TRIBUNAL</span>
              </span>
            </div>
          </div>

          {/* 3. Country Flag Badge (Top Right Badge) */}
          <div className="absolute top-[46px] right-[26px] z-40 pointer-events-none">
            <div className="flex items-center justify-center bg-[#020612]/90 rounded-full w-8 h-8 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.9)] border border-rose-500/50">
              <span className="text-[14px] leading-none">{data.countryFlag || '🌍'}</span>
            </div>
          </div>

          {/* 4. High-Contrast Stats Panel (Fully Visible Bottom Row) */}
          <div className="absolute bottom-[54px] left-[24px] right-[24px] z-50 pointer-events-none">
            <div className="w-full h-[52px] bg-[#040814]/98 rounded-xl flex items-center justify-between px-2 py-1 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.95)] border-2 border-rose-500/80">
              {metrics.map(m => (
                <div key={m.label} className="flex flex-col items-center flex-1 border-r last:border-r-0 border-white/15">
                  <span className="text-[8.5px] font-black tracking-widest uppercase drop-shadow text-rose-400">
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

  /* =========================================================================
     MAIN TOURNAMENT CARD DESIGN: CLASSIC PURE GOLD FUT SHIELD SHAPE (UNTOUCHED)
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
        {hasAiImage ? (
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
            {metrics.map(m => (
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
