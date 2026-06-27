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
  const avatarSrc = data.avatarSeed
    ? data.avatarSeed.startsWith('data:image/') || data.avatarSeed.startsWith('/') || data.avatarSeed.startsWith('http')
      ? data.avatarSeed
      : `https://api.dicebear.com/7.x/${data.avatarStyle || 'fun-emoji'}/svg?seed=${encodeURIComponent(data.avatarSeed || data.playerName || 'MANAGER')}&backgroundColor=transparent`
    : null;

  return (
    <div
      ref={cardRef}
      className="relative w-[340px] h-[480px] bg-transparent select-none transition-all duration-500 overflow-hidden"
      style={{
        filter: 'drop-shadow(0 15px 30px rgba(225,29,72,0.4))',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* SVG Container defining the FUT shield geometry and border frame */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
        viewBox="0 0 340 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Theme Border Gradients */}
          <linearGradient id="gold-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD3D9" />
            <stop offset="50%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>
        </defs>

        {/* Outer Metallic Shield Border Frame */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#gold-border)"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Inner Border Line */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#gold-border)"
          strokeWidth="0.8"
          opacity="0.3"
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
          /* Full AI Generated FIFA Trading Card image */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.aiImageUrl}
            alt="AI FIFA Card"
            className="w-full h-full object-cover"
          />
        ) : (
          /* High-contrast FIFA Card layout rendered inside shield frame */
          <div className="relative w-full h-full bg-gradient-to-b from-[#1E070F] via-[#0B0F19] to-[#030712] p-6 flex flex-col justify-between text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(225,29,72,0.25),transparent_70%)] pointer-events-none" />

            {/* Top Row Spacing Placeholder */}
            <div className="h-20" />

            {/* Center Player Portrait Cutout Spotlight */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative my-auto">
              {avatarSrc && (
                <div className="relative w-32 h-32 mb-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarSrc}
                    alt="Player Portrait"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
                  />
                </div>
              )}

              {/* Manager Name & Verdict */}
              <div className="text-center">
                <h2 
                  className="font-bold text-[22px] tracking-widest uppercase leading-none text-[#FFE082] truncate max-w-[250px]"
                  style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900, textShadow: '0 2px 6px rgba(0,0,0,0.95)' }}
                >
                  {data.playerName || 'MANAGER'}
                </h2>
                <span className="inline-block text-[9.5px] font-black tracking-widest uppercase text-[#E11D48] mt-1.5 bg-[#E11D48]/15 border border-[#E11D48]/40 px-3 py-0.5 rounded shadow-md">
                  ⚖️ {data.verdict || 'KNOWS BALL'}
                </span>
              </div>
            </div>

            {/* Bottom Spacing Placeholder */}
            <div className="h-20" />
          </div>
        )}

        {/* 1. OVR Rating & Role */}
        <div className="absolute top-[44px] left-[26px] z-40 flex flex-col items-center pointer-events-none">
          <span 
            className="text-[44px] tracking-tighter leading-none text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
          >
            {data.ovr}
          </span>
          <span className="text-[9px] font-black tracking-widest uppercase text-[#FFE082] mt-0.5 drop-shadow">
            {data.playerPosition || 'MGR'}
          </span>
        </div>

        {/* 2. BallKnowledge Product Logo Branding */}
        <div className="absolute top-[46px] left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/80 border border-[#E11D48]/60 rounded-full px-3 py-1 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/ball_knowledge_logo.png" 
              alt="Ball Knowledge" 
              className="w-4 h-4 object-contain rounded-full drop-shadow" 
            />
            <span className="text-[8.5px] font-black tracking-widest uppercase text-white">
              BALL<span className="text-[#E11D48]">KNOWLEDGE</span>
            </span>
          </div>
        </div>

        {/* 3. Country Flag Badge */}
        <div className="absolute top-[46px] right-[26px] z-40 pointer-events-none">
          <div className="flex items-center justify-center bg-black/80 border border-white/20 rounded-full w-8 h-8 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            <span className="text-[14px] leading-none">{data.countryFlag || '🌍'}</span>
          </div>
        </div>

        {/* 4. High-Contrast Stats Panel */}
        <div className="absolute bottom-[64px] left-[28px] right-[28px] z-40 pointer-events-none">
          <div className="w-full h-[52px] bg-black/90 border border-white/25 rounded-xl flex items-center justify-between px-2 py-1 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.95)]">
            {metrics.map(m => (
              <div key={m.label} className="flex flex-col items-center flex-1 border-r border-white/15 last:border-r-0">
                <span className="text-[8.5px] font-black tracking-widest uppercase text-[#FFE082] drop-shadow">
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
