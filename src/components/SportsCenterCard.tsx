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
  const isVerdictCard = data.mode === 'take' || Boolean(data.charge) || Boolean(data.sentence) || Boolean(data.matchTitle);

  const ovr = data.ovr || 50;

  let themeId = 'gold';
  let borderStops = (
    <>
      <stop offset="0%" stopColor="#FFFBEB" />
      <stop offset="30%" stopColor="#F59E0B" />
      <stop offset="70%" stopColor="#D97706" />
      <stop offset="100%" stopColor="#78350F" />
    </>
  );
  let glowColor = '#F59E0B';
  let bgGradient = 'bg-gradient-to-b from-[#1F1504] via-[#0B0F19] to-[#030712]';
  let badgeStyle = 'text-amber-300 bg-amber-400/15 border-amber-400/40';
  let primaryTextColor = 'text-amber-300';
  let primaryBorderColor = 'border-amber-400/40';

  if (isVerdictCard) {
    themeId = 'crimson';
    borderStops = (
      <>
        <stop offset="0%" stopColor="#FFD3D9" />
        <stop offset="30%" stopColor="#E11D48" />
        <stop offset="70%" stopColor="#9F1239" />
        <stop offset="100%" stopColor="#4C0519" />
      </>
    );
    glowColor = '#E11D48';
    bgGradient = 'bg-gradient-to-b from-[#2D0612] via-[#120308] to-[#030712]';
    badgeStyle = 'text-rose-300 bg-rose-500/20 border-rose-500/50';
    primaryTextColor = 'text-rose-400';
    primaryBorderColor = 'border-rose-500/50';
  }

  return (
    <div
      ref={cardRef}
      className="relative w-[340px] h-[480px] bg-transparent select-none transition-all duration-500"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* SVG Frame: Distinct Hexagon Cyber-Shield for Verdict Cards vs Classic FUT Shield for Manager Deck */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
        viewBox="0 0 340 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`card-border-grad-${themeId}`} x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            {borderStops}
          </linearGradient>

          <filter id={`card-glow-filter-${themeId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow 
              dx="0" 
              dy="8" 
              stdDeviation="14" 
              floodColor={glowColor} 
              floodOpacity="0.5" 
            />
          </filter>
        </defs>

        {isVerdictCard ? (
          /* DISTINCT VAR TRIBUNAL HEXAGONAL SHIELD GEOMETRY */
          <>
            <path
              d="M 12,40 L 75,12 L 265,12 L 328,40 L 328,360 L 170,470 L 12,360 Z"
              stroke={`url(#card-border-grad-${themeId})`}
              strokeWidth="4"
              fill="none"
              filter={`url(#card-glow-filter-${themeId})`}
            />
            <path
              d="M 12,40 L 75,12 L 265,12 L 328,40 L 328,360 L 170,470 L 12,360 Z"
              stroke={`url(#card-border-grad-${themeId})`}
              strokeWidth="1"
              opacity="0.5"
              fill="none"
              style={{ transform: 'scale(0.96)', transformOrigin: '170px 240px' }}
            />
          </>
        ) : (
          /* CLASSIC TOURNAMENT FUT SHIELD GEOMETRY */
          <>
            <path
              d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
              stroke={`url(#card-border-grad-${themeId})`}
              strokeWidth="3.5"
              fill="none"
              filter={`url(#card-glow-filter-${themeId})`}
            />
            <path
              d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
              stroke={`url(#card-border-grad-${themeId})`}
              strokeWidth="0.8"
              opacity="0.4"
              fill="none"
              style={{ transform: 'scale(0.95)', transformOrigin: '162px 240px' }}
            />
          </>
        )}
      </svg>

      {/* Card Content Container Clipped strictly within Shield Shape */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          clipPath: isVerdictCard 
            ? 'polygon(3.5% 8.5%, 22% 2.5%, 78% 2.5%, 96.5% 8.5%, 96.5% 75%, 50% 98%, 3.5% 75%)'
            : 'polygon(2% 12%, 15% 8%, 35% 8%, 50% 2%, 65% 8%, 85% 8%, 98% 12%, 98% 78%, 50% 98%, 2% 78%)'
        }}
      >
        {hasAiImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.aiImageUrl}
            alt="AI FIFA Card"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`relative w-full h-full p-5 flex flex-col justify-between text-white ${bgGradient}`}>
            <div className="h-20" />

            {/* Center Content Spotlight */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative my-auto text-center w-full px-2">
              {isVerdictCard ? (
                /* VERDICT CARD DESIGN */
                <div className="flex flex-col items-center gap-2 w-full">
                  {(data.matchTitle || data.matchScore) && (
                    <div className={`bg-black/90 border ${primaryBorderColor} px-3 py-1 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md`}>
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

                  <h2 
                    className="font-bold text-[24px] sm:text-[26px] tracking-widest uppercase leading-tight text-white drop-shadow-[0_4px_12px_rgba(225,29,72,0.6)] max-w-[280px] mt-1"
                    style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
                  >
                    {data.verdict || 'KNOWS BALL'}
                  </h2>

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
              ) : (
                /* TOURNAMENT MANAGER DECK DESIGN */
                <div className="flex flex-col items-center gap-2 w-full">
                  <h2 
                    className="font-bold text-[26px] tracking-widest uppercase leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] truncate max-w-[270px]"
                    style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900 }}
                  >
                    {data.playerName || 'MANAGER'}
                  </h2>
                  <span className={`inline-block text-[10px] font-black tracking-widest uppercase mt-1 px-4 py-1 rounded-md shadow-md backdrop-blur-sm ${badgeStyle}`}>
                    👑 {data.verdict || 'TOURNAMENT CHEF'}
                  </span>
                </div>
              )}
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
          <span className={`text-[10px] font-black tracking-widest uppercase mt-0.5 drop-shadow ${primaryTextColor}`}>
            {isVerdictCard ? 'VAR' : 'MGR'}
          </span>
        </div>

        {/* 2. Product Logo Branding (Top Center Badge) */}
        <div className="absolute top-[46px] left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
          <div className={`flex items-center gap-1.5 bg-[#020612]/90 rounded-full px-3 py-1 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.95)] border ${primaryBorderColor}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/ball_knowledge_logo.png" 
              alt="Ball Knowledge" 
              className="w-4 h-4 object-contain rounded-full drop-shadow" 
            />
            <span className="text-[8.5px] font-black tracking-widest uppercase text-white">
              {isVerdictCard ? 'VAR' : 'BALL'}<span className={primaryTextColor}>{isVerdictCard ? ' TRIBUNAL' : 'KNOWLEDGE'}</span>
            </span>
          </div>
        </div>

        {/* 3. Country Flag Badge (Top Right Badge) */}
        <div className="absolute top-[46px] right-[26px] z-40 pointer-events-none">
          <div className={`flex items-center justify-center bg-[#020612]/90 rounded-full w-8 h-8 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.9)] border ${primaryBorderColor}`}>
            <span className="text-[14px] leading-none">{data.countryFlag || '🌍'}</span>
          </div>
        </div>

        {/* 4. High-Contrast Stats Panel (Bottom Row) */}
        <div className="absolute bottom-[64px] left-[28px] right-[28px] z-40 pointer-events-none">
          <div className={`w-full h-[52px] bg-[#020612]/95 rounded-xl flex items-center justify-between px-2 py-1 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.95)] border ${primaryBorderColor}`}>
            {metrics.map(m => (
              <div key={m.label} className={`flex flex-col items-center flex-1 border-r last:border-r-0 border-white/10`}>
                <span className={`text-[8.5px] font-black tracking-widest uppercase drop-shadow ${primaryTextColor}`}>
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

/**
 * Mini FUT Shield Card component for displaying actual trading sticker designs in grid slots.
 */
export function MiniSportsCenterCard({
  data,
  isSelected,
  onClick,
  homeFlag,
  awayFlag
}: {
  data: VerdictData;
  isSelected?: boolean;
  onClick?: () => void;
  homeFlag?: string;
  awayFlag?: string;
}) {
  const ovr = data.ovr || 50;
  const rarity = data.rarity || (ovr >= 85 ? 'LEGENDARY' : ovr >= 70 ? 'EPIC' : ovr >= 45 ? 'RARE' : 'COMMON');

  let borderColor = 'border-sky-400/40';
  let textColor = 'text-sky-300';
  let bgGrad = 'from-[#06192A] via-[#0B0F19] to-[#030712]';

  if (rarity === 'LEGENDARY') {
    borderColor = 'border-amber-400/60';
    textColor = 'text-amber-300';
    bgGrad = 'from-[#1F1504] via-[#0B0F19] to-[#030712]';
  } else if (rarity === 'EPIC') {
    borderColor = 'border-purple-400/60';
    textColor = 'text-purple-300';
    bgGrad = 'from-[#1E0B2B] via-[#0B0F19] to-[#030712]';
  } else if (rarity === 'RARE') {
    borderColor = 'border-rose-500/60';
    textColor = 'text-rose-400';
    bgGrad = 'from-[#1E070F] via-[#0B0F19] to-[#030712]';
  }

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-[155px] cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] select-none ${
        isSelected ? 'ring-2 ring-amber-400 scale-[1.03]' : ''
      }`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Mini FUT Shield Clip Container */}
      <div 
        className={`w-full h-full bg-gradient-to-b ${bgGrad} border ${borderColor} rounded-2xl p-2.5 flex flex-col justify-between shadow-xl backdrop-blur-md relative overflow-hidden`}
      >
        {/* Top Section: OVR, Position, Rarity */}
        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col items-center leading-none">
            <span className="font-mono font-black text-xl text-white drop-shadow-md">{ovr}</span>
            <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${textColor}`}>VAR</span>
          </div>
          <span className={`text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/80 border border-white/10 ${textColor}`}>
            {rarity.slice(0, 3)}
          </span>
        </div>

        {/* Center Spotlight: Fixture Flags & Verdict Title */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto z-10 px-0.5 py-1">
          <div className="flex gap-1 mb-1 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={homeFlag || 'https://flagcdn.com/w80/un.png'} alt="" className="w-4 h-3 object-cover rounded shadow border border-white/20" />
            <span className="text-[8px] font-bold text-gray-400">vs</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={awayFlag || 'https://flagcdn.com/w80/un.png'} alt="" className="w-4 h-3 object-cover rounded shadow border border-white/20" />
          </div>

          <h4 className="font-sans font-black text-[10px] text-white tracking-wide uppercase leading-tight line-clamp-2 drop-shadow">
            {data.verdict}
          </h4>
        </div>

        {/* Bottom Bar: Action */}
        <div className="border-t border-white/10 pt-1 flex justify-between items-center text-[7.5px] font-bold text-gray-400 uppercase tracking-widest z-10">
          <span>VERDICT</span>
          <span className="text-amber-400 group-hover:underline">INSPECT &rarr;</span>
        </div>
      </div>
    </div>
  );
}
