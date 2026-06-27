'use client';

import { VerdictData } from '@/lib/tribunalDB';
import { User } from 'lucide-react';

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
  const avatarSrc = data.avatarSeed && (data.avatarSeed.startsWith('data:image/') || data.avatarSeed.startsWith('/') || data.avatarSeed.startsWith('http'))
    ? data.avatarSeed
    : null;

  return (
    <div
      ref={cardRef}
      className="relative w-[340px] h-[480px] bg-transparent select-none transition-all duration-500"
      style={{
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* SVG Container defining the FUT shield geometry and metallic TOTY gold border frame */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
        viewBox="0 0 340 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Champagne Gold TOTY Border Gradients */}
          <linearGradient id="toty-gold-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Glowing TOTY Filter */}
          <filter id="toty-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#F59E0B" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Metallic TOTY Shield Border Frame */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#toty-gold-border)"
          strokeWidth="3.5"
          fill="none"
          filter="url(#toty-glow-filter)"
        />

        {/* Concentric Inner Gold Line */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#toty-gold-border)"
          strokeWidth="0.8"
          opacity="0.4"
          fill="none"
          style={{
            transform: 'scale(0.95)',
            transformOrigin: '162px 240px'
          }}
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
          /* Full AI Generated FIFA TOTY Trading Card image */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.aiImageUrl}
            alt="AI FIFA TOTY Card"
            className="w-full h-full object-cover"
          />
        ) : (
          /* Midnight Sapphire Blue TOTY Card layout rendered inside shield frame */
          <div className="relative w-full h-full bg-gradient-to-b from-[#071330] via-[#0A1B44] to-[#030A1C] p-6 flex flex-col justify-between text-white">
            {/* Swirling Gold & Sapphire Radial Light Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(37,99,235,0.35),transparent_75%)] pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 border border-amber-400/20 rounded-full blur-sm pointer-events-none animate-pulse" />

            {/* Top Row Spacing Placeholder */}
            <div className="h-20" />

            {/* Center Player Portrait Cutout & Manager Spotlight */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative my-auto">
              <div className="relative w-32 h-32 mb-1 flex items-center justify-center">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt="Player Portrait"
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#0A1B44]/80 border-2 border-amber-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                    <User className="w-10 h-10 text-amber-300/80" />
                  </div>
                )}
              </div>

              {/* Player / Manager Name on Dark Sapphire Banner */}
              <div className="text-center w-full bg-gradient-to-r from-transparent via-[#030A1C]/90 to-transparent py-1 px-4 mt-1">
                <h2 
                  className="font-bold text-[24px] tracking-widest uppercase leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                  style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
                >
                  {data.playerName || 'MANAGER'}
                </h2>
                <span className="inline-block text-[9.5px] font-black tracking-widest uppercase text-amber-300 mt-1 bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 rounded shadow-md">
                  ⚖️ {data.verdict || 'KNOWS BALL'}
                </span>
              </div>
            </div>

            {/* Bottom Spacing Placeholder */}
            <div className="h-20" />
          </div>
        )}

        {/* 1. OVR Rating & Position (Top Left Stack) */}
        <div className="absolute top-[44px] left-[26px] z-40 flex flex-col items-center pointer-events-none">
          <span 
            className="text-[46px] tracking-tighter leading-none text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)]"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
          >
            {data.ovr}
          </span>
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-300 mt-0.5 drop-shadow">
            {data.playerPosition || 'MGR'}
          </span>
        </div>

        {/* 2. BallKnowledge Product Logo Branding (Top Center Badge) */}
        <div className="absolute top-[46px] left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-[#030A1C]/90 border border-amber-400/70 rounded-full px-3 py-1 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/ball_knowledge_logo.png" 
              alt="Ball Knowledge" 
              className="w-4 h-4 object-contain rounded-full drop-shadow" 
            />
            <span className="text-[8.5px] font-black tracking-widest uppercase text-white">
              BALL<span className="text-amber-400">KNOWLEDGE</span>
            </span>
          </div>
        </div>

        {/* 3. Country Flag Badge (Top Right Badge) */}
        <div className="absolute top-[46px] right-[26px] z-40 pointer-events-none">
          <div className="flex items-center justify-center bg-[#030A1C]/90 border border-amber-400/40 rounded-full w-8 h-8 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            <span className="text-[14px] leading-none">{data.countryFlag || '🌍'}</span>
          </div>
        </div>

        {/* 4. High-Contrast TOTY Stats Panel (Bottom Row) */}
        <div className="absolute bottom-[64px] left-[28px] right-[28px] z-40 pointer-events-none">
          <div className="w-full h-[52px] bg-[#030A1C]/95 border border-amber-400/35 rounded-xl flex items-center justify-between px-2 py-1 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.95)]">
            {metrics.map(m => (
              <div key={m.label} className="flex flex-col items-center flex-1 border-r border-amber-400/15 last:border-r-0">
                <span className="text-[8.5px] font-black tracking-widest uppercase text-amber-300 drop-shadow">
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
