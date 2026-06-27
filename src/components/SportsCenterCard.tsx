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
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
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

          {/* Shield Clip Path for AI Image rendering */}
          <clipPath id="fut-shield-clip">
            <path d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z" />
          </clipPath>
        </defs>

        {/* Outer Metallic Shield Border Frame */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          stroke="url(#gold-border)"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Concentric Inner Border Line */}
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
          /* Render full AI Generated FIFA Trading Card image */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.aiImageUrl}
            alt="AI FIFA Card"
            className="w-full h-full object-cover"
          />
        ) : (
          /* High-contrast FIFA Card layout rendered inside shield frame */
          <div className="relative w-full h-full bg-gradient-to-b from-[#1E070F] via-[#0B0F19] to-[#030712] p-7 flex flex-col justify-between text-white">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(225,29,72,0.25),transparent_70%)] pointer-events-none" />

            {/* Top Row: OVR & Logo */}
            <div className="flex justify-between items-start z-10 pt-2">
              <div className="flex flex-col items-center">
                <span 
                  className="text-[48px] tracking-tighter leading-none text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]"
                  style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
                >
                  {data.ovr}
                </span>
                <span className="text-[9.5px] font-black tracking-widest uppercase text-[#FFE082] mt-0.5">
                  {data.playerPosition || 'MGR'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-black/50 border border-white/15 rounded-full px-2.5 py-1 backdrop-blur-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/ball_knowledge_logo.png" alt="Logo" className="w-5 h-5 object-contain rounded-full" />
                <span className="text-[13px]">{data.countryFlag || '🌍'}</span>
              </div>
            </div>

            {/* Center Spotlight: Manager Name & Verdict */}
            <div className="flex flex-col items-center justify-center text-center z-10 my-auto">
              <h2 
                className="font-bold text-[22px] tracking-widest uppercase leading-none text-[#FFE082] truncate max-w-[260px]"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900, textShadow: '0 2px 6px rgba(0,0,0,0.95)' }}
              >
                {data.playerName || 'MANAGER'}
              </h2>
              <span className="text-[10px] font-black tracking-widest uppercase text-[#E11D48] mt-1.5 bg-[#E11D48]/10 border border-[#E11D48]/30 px-2.5 py-0.5 rounded">
                ⚖️ {data.verdict || 'KNOWS BALL'}
              </span>
            </div>

            {/* Bottom Row: 4 Stats Bar */}
            <div className="w-full h-[48px] bg-black/60 border border-white/15 rounded-xl flex items-center justify-between px-2 py-1 z-10 backdrop-blur-md mb-3">
              {metrics.map(m => (
                <div key={m.label} className="flex flex-col items-center flex-1 border-r border-white/10 last:border-r-0">
                  <span className="text-[8px] font-black tracking-widest uppercase text-[#FFE082]">{m.label}</span>
                  <span className="text-[16px] font-black text-white leading-none mt-0.5" style={{ fontFamily: "'Oswald', sans-serif" }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
