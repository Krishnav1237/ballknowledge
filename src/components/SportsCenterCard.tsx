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
  // Strict check: mode === 'take' is the Verdict Card, otherwise Tournament Manager Deck
  const isVerdictCard = data.mode === 'take';

  const ovr = data.ovr || 50;

  if (isVerdictCard) {
    /* =========================================================================
       VERDICT CARD DESIGN: CYBER OCTAGON / VAR PLAQUE SHAPE (COMPLETELY NEW)
       ========================================================================= */
    return (
      <div
        ref={cardRef}
        className="relative w-[340px] h-[480px] bg-transparent select-none transition-all duration-500"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* SVG Cyber Octagon Frame & Metallic Crimson Border */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          viewBox="0 0 340 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="verdict-cyber-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFD3D9" />
              <stop offset="35%" stopColor="#E11D48" />
              <stop offset="75%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>

            <filter id="verdict-cyber-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#E11D48" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Outer Cyber Octagon Border */}
          <path
            d="M 32,12 L 170,4 L 308,12 L 332,54 L 332,382 L 300,432 L 170,476 L 40,432 L 8,382 L 8,54 Z"
            stroke="url(#verdict-cyber-border)"
            strokeWidth="4"
            fill="none"
            filter="url(#verdict-cyber-glow)"
          />

          {/* Inner Laser Accent Line */}
          <path
            d="M 32,12 L 170,4 L 308,12 L 332,54 L 332,382 L 300,432 L 170,476 L 40,432 L 8,382 L 8,54 Z"
            stroke="#FFD3D9"
            strokeWidth="1"
            opacity="0.4"
            fill="none"
            style={{ transform: 'scale(0.96)', transformOrigin: '170px 240px' }}
          />
        </svg>

        {/* Card Content Container Clipped inside Cyber Octagon */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            clipPath: 'polygon(9% 2%, 91% 2%, 97% 11%, 97% 79%, 88% 90%, 50% 99%, 12% 90%, 3% 79%, 3% 11%)'
          }}
        >
          {hasAiImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.aiImageUrl} alt="AI FIFA Card" className="w-full h-full object-cover" />
          ) : (
            <div className="relative w-full h-full p-5 flex flex-col justify-between text-white bg-gradient-to-b from-[#2A0813] via-[#14050C] to-[#030712]">
              <div className="h-20" />

              {/* Center Spotlight */}
              <div className="flex-1 flex flex-col items-center justify-center z-10 relative my-auto text-center w-full px-2">
                <div className="flex flex-col items-center gap-2 w-full">
                  
                  {/* Match Teams & Score Metric Badge */}
                  {(data.matchTitle || data.matchScore) && (
                    <div className="bg-black/90 border border-rose-500/50 px-3.5 py-1 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md">
                      <span className="text-[9.5px] font-black uppercase text-gray-200 tracking-wider">
                        ⚽ {data.matchTitle || 'WORLD CUP MATCH'}
                      </span>
                      {data.matchScore && (
                        <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                          {data.matchScore}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Prominent VAR Verdict Title */}
                  <h2 
                    className="font-bold text-[24px] sm:text-[26px] tracking-widest uppercase leading-tight text-white drop-shadow-[0_4px_14px_rgba(225,29,72,0.8)] max-w-[280px] mt-1"
                    style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
                  >
                    {data.verdict || 'KNOWS BALL'}
                  </h2>

                  {/* Manager Alias & Decree */}
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <span className="text-[9px] font-mono font-black tracking-widest uppercase text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 rounded-full">
                      MANAGER: {data.playerName || 'TACTICIAN'}
                    </span>
                    
                    {data.charge && (
                      <p className="text-[9.5px] text-gray-300 font-semibold italic max-w-[260px] line-clamp-1 mt-1">
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

          {/* 4. High-Contrast Stats Panel (Bottom Row) */}
          <div className="absolute bottom-[64px] left-[28px] right-[28px] z-40 pointer-events-none">
            <div className="w-full h-[52px] bg-[#020612]/95 rounded-xl flex items-center justify-between px-2 py-1 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.95)] border border-rose-500/50">
              {metrics.map(m => (
                <div key={m.label} className="flex flex-col items-center flex-1 border-r last:border-r-0 border-white/10">
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
            <div className="h-24" />

            {/* Center Manager Name & Ruling Spotlight */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative my-auto text-center w-full px-2">
              <h2 
                className="font-bold text-[26px] tracking-widest uppercase leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] truncate max-w-[270px]"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
              >
                {data.playerName || 'MANAGER'}
              </h2>
              
              <span className="inline-block text-[10px] font-black tracking-widest uppercase mt-2.5 px-4 py-1 rounded-md shadow-md backdrop-blur-sm text-amber-300 bg-amber-400/15 border border-amber-400/40">
                👑 {data.verdict || 'KNOWS BALL'}
              </span>
            </div>

            <div className="h-24" />
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
