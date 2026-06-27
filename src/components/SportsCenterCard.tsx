'use client';

import { VerdictData } from '@/lib/tribunalDB';

// ─── Theme Selector (Grades, Borders & Glows) ──────────────────────────────────
function getThemeColors() {
  return {
    bgId: 'gold-premium-pat',
    borderId: 'gold-border',
    accentColor: '#E11D48',
    textColor: '#FFE082',
    glow: 'rgba(225,29,72,0.4)',
    glowId: 'gold-glow',
  };
}

// ─── 4 Main Metrics Derivation (V1 Scoring System) ───────────────────────────
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
  const colors = getThemeColors();
  const metrics = get4Metrics(data);

  return (
    <div
      ref={cardRef}
      className="relative w-[340px] h-[480px] bg-transparent select-none transition-all duration-500 overflow-hidden"
      style={{
        filter: `drop-shadow(0 15px 30px ${colors.glow})`,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Layer 1: SVG Vector Shield Graphic for smooth curved FIFA look */}
      <svg
        className="absolute inset-0 w-full h-full -z-10 pointer-events-none"
        viewBox="0 0 340 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background pattern */}
          <pattern id="gold-premium-pat" width="340" height="480" patternUnits="userSpaceOnUse">
            <image href={data.aiImageUrl || "/images/card_bg.webp"} x="0" y="0" width="340" height="480" preserveAspectRatio="xMidYMid slice" />
          </pattern>

          {/* Theme Border Gradients */}
          <linearGradient id="gold-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD3D9" />
            <stop offset="50%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Radial glow definitions */}
          <radialGradient id="gold-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="1" />
            <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
          </radialGradient>

          {/* Football Goal Net Hexagonal Pattern */}
          <pattern id="football-net-pat" width="24" height="41.57" patternUnits="userSpaceOnUse">
            <path 
              d="M 12 0 L 24 6.93 L 24 20.78 L 12 27.71 L 0 20.78 L 0 6.93 Z M 0 27.71 L 12 34.64 L 12 48.5 L 0 55.43 L -12 48.5 L -12 34.64 Z" 
              fill="none" 
              stroke="rgba(255,255,255,0.03)" 
              strokeWidth="0.8" 
            />
          </pattern>
        </defs>

        {/* Curved FUT Shield Base Path */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          fill={`url(#${colors.bgId})`}
        />

        {/* Goal Net Overlay */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          fill="url(#football-net-pat)"
        />

        {/* Outer Shield Border */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke={`url(#${colors.borderId})`}
          strokeWidth="3.5"
          fill="none"
        />

        {/* Concentric Inner Border */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke={`url(#${colors.borderId})`}
          strokeWidth="0.8"
          opacity="0.3"
          fill="none"
          style={{
            transform: 'scale(0.95)',
            transformOrigin: '162px 240px'
          }}
        />

        {/* Ambient Center Glow */}
        <circle cx="162" cy="220" r="140" fill={`url(#${colors.glowId})`} opacity="0.35" style={{ mixBlendMode: 'screen' }} />

        {/* Watermark Logo in center */}
        <g opacity="0.15" fill="none">
          <circle cx="162" cy="200" r="70" stroke="#E11D48" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Layer 2: Card Content Overlay - Absolute Positioned */}
      <div className="absolute inset-0 w-full h-full text-white pointer-events-none flex flex-col justify-between p-8">
        
        {/* Top Header & Logo */}
        <div className="flex justify-between items-center w-full pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ball_knowledge_logo.png"
            alt="Ball Knowledge"
            className="w-8 h-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] rounded-full border border-[#E11D48]/40"
          />
          <span 
            className="text-[11px] font-bold tracking-widest uppercase" 
            style={{ 
              color: colors.textColor,
              textShadow: '0 1px 2px rgba(0,0,0,0.95)'
            }}
          >
            {data.playerPosition || 'MGR'}
          </span>
        </div>

        {/* Center Spotlight: Giant OVR Rating & Player Name */}
        <div className="flex flex-col items-center justify-center my-auto text-center pointer-events-none">
          <span 
            className="text-[96px] tracking-tighter leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: '900',
              textShadow: '0 0 25px rgba(225,29,72,0.5), 0 4px 12px rgba(0,0,0,0.9)'
            }}
          >
            {data.ovr}
          </span>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#E11D48] mt-1 drop-shadow-md">
            OVERALL RATING
          </span>
          <h2 
            className="font-bold text-[22px] tracking-widest uppercase leading-none mt-4 truncate max-w-[260px]"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: '900',
              color: '#FFE082',
              textShadow: '0 2px 5px rgba(0,0,0,0.95)'
            }}
          >
            {data.playerName || 'MANAGER'}
          </h2>
        </div>

        {/* Metrics Section (4 Columns) */}
        <div 
          className="w-full h-[64px] flex items-center justify-between z-30 px-2 py-2 mb-2 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md"
          style={{
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {metrics.map((m) => {
            const getWeightLabel = (label: string): string => {
              if (label === 'PRD') return '35%';
              if (label === 'MGR') return '25%';
              if (label === 'HOT') return '25%';
              if (label === 'RST') return '15%';
              return '';
            };
            return (
              <div key={m.label} className="flex flex-col items-center flex-1 border-r border-white/5 last:border-r-0">
                <span 
                  className="text-[9px] font-black tracking-widest uppercase leading-none flex items-center gap-1" 
                  style={{ color: colors.textColor }}
                >
                  <span>{m.label}</span>
                  <span className="text-[7px] opacity-60 font-normal">({getWeightLabel(m.label)})</span>
                </span>
                <span 
                  className="text-[20px] mt-1 leading-none font-black text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]"
                  style={{ 
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 900
                  }}
                >
                  {m.val}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
