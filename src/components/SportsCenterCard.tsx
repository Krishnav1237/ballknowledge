'use client';

import { VerdictData } from '@/lib/tribunalDB';

// ─── Verdict Label Mapper ────────────────────────────────────────────────────
function getVerdictLabel(verdict: string, ovr: number): string {
  const v = verdict.toUpperCase();
  if (v.includes('CERTIFIED COOKING') || v.includes('APPROVED')) {
    return ovr >= 90 ? 'CERTIFIED CHEF' : 'KNOWS BALL';
  }
  if (v.includes('BALL IQ') || v.includes('HISTORICALLY CORRECT')) return 'BALL KNOWLEDGE DETECTED';
  if (v.includes('TERRORISM') || v.includes('TERRORIST')) return 'FOOTBALL TERRORIST';
  if (v.includes('FRAUD') || v.includes('DELUSION') || v.includes('SPIN')) return 'DELUSION MERCHANT';
  if (v.includes('MID TAKE') || v.includes('COMMON')) return 'AVERAGE FAN ENERGY';
  if (v.includes('CHOKING') || v.includes('BOTTLE')) return 'GENERATIONAL BOTTLER';
  if (v.includes('GREED') || v.includes('HATING') || v.includes('HATE')) return 'GENERATIONAL HATER';
  if (v.includes('TACTICAL') || v.includes('GENIUS')) return 'TACTICAL GENIUS';
  if (v.includes('ACQUITTED') || v.includes('DISMISSED')) return 'CASE DISMISSED';
  if (v.includes('RIVALRY') || v.includes('RIVAL')) return 'RIVALRY INSTIGATOR';
  if (v.includes('PENDING') || v.includes('ASSESSMENT')) return 'UNDER REVIEW';
  if (ovr >= 90) return 'CERTIFIED CHEF';
  if (ovr >= 72) return 'KNOWS BALL';
  if (ovr >= 50) return 'MID TAKE MERCHANT';
  if (ovr >= 30) return 'DELUSION MERCHANT';
  return 'FOOTBALL TERRORIST';
}

// ─── Verdict Color ───────────────────────────────────────────────────────────
function getVerdictColor(verdict: string, ovr: number): { color: string; glow: string } {
  const label = getVerdictLabel(verdict, ovr);
  if (label === 'CERTIFIED CHEF' || label === 'KNOWS BALL' || label === 'BALL KNOWLEDGE DETECTED' || label === 'CASE DISMISSED' || label === 'TACTICAL GENIUS') {
    return { color: '#10B981', glow: 'rgba(16,185,129,0.45)' };
  }
  if (label === 'FOOTBALL TERRORIST' || label === 'DELUSION MERCHANT' || label === 'GENERATIONAL BOTTLER') {
    return { color: '#EF4444', glow: 'rgba(239,68,68,0.45)' };
  }
  if (label === 'GENERATIONAL HATER' || label === 'RIVALRY INSTIGATOR') {
    return { color: '#F97316', glow: 'rgba(249,115,22,0.45)' };
  }
  return { color: '#F59E0B', glow: 'rgba(245,158,11,0.45)' };
}

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
  const verdictLabel = getVerdictLabel(data.verdict, data.ovr);
  const verdictColor = getVerdictColor(data.verdict, data.ovr);
  const metrics = get4Metrics(data);

  // Truncations to ensure zero overflow outside the shield
  const takeDisplay = data.text
    ? (data.text.length > 85 ? data.text.slice(0, 82).trimEnd() + '…' : data.text)
    : 'Registered Manager Verdict Record';

  const chargeDisplay = data.charge
    ? (data.charge.length > 45 ? data.charge.slice(0, 42).trimEnd() + '…' : data.charge)
    : 'Tactical Analysis Approved';

  const sentenceDisplay = data.sentence
    ? (data.sentence.length > 50 ? data.sentence.slice(0, 47).trimEnd() + '…' : data.sentence)
    : 'VERDICT AUDITED';

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

        {/* Ambient Glows */}
        <circle cx="162" cy="160" r="130" fill={`url(#${colors.glowId})`} opacity="0.3" style={{ mixBlendMode: 'screen' }} />
      </svg>

      {/* Layer 2: Card Content Overlay - Strictly Contained inside Shield Pads */}
      <div className="absolute inset-0 w-full h-full text-white pointer-events-none flex flex-col justify-between px-6 pt-7 pb-6 overflow-hidden">
        
        {/* Top Section: OVR Badge + Brand Logo + Verdict Pill Stamp */}
        <div className="flex justify-between items-start w-full z-30 shrink-0">
          {/* OVR + Position Stack */}
          <div className="flex flex-col items-center">
            <span 
              className="text-[48px] tracking-tighter leading-none text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: '900',
                textShadow: '0 0 20px rgba(225,29,72,0.6), 0 3px 8px rgba(0,0,0,0.9)'
              }}
            >
              {data.ovr}
            </span>
            <span 
              className="text-[9.5px] font-black tracking-widest uppercase leading-none mt-0.5" 
              style={{ color: colors.textColor }}
            >
              {data.playerPosition || 'MGR'}
            </span>
          </div>

          {/* Center Brand Logo + Country Flag */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-full px-2.5 py-1 backdrop-blur-md shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ball_knowledge_logo.png"
              alt="Ball Knowledge"
              className="w-5 h-5 object-contain rounded-full"
            />
            <span className="text-[14px] leading-none">{data.countryFlag || '🌍'}</span>
          </div>

          {/* Verdict Pill Stamp */}
          <div 
            className="px-2.5 py-1 border-2 text-[9px] font-black tracking-wider uppercase rounded-md shadow-lg truncate max-w-[120px]"
            style={{
              borderColor: verdictColor.color,
              color: verdictColor.color,
              backgroundColor: `${verdictColor.color}20`,
              textShadow: `0 0 4px ${verdictColor.glow}`,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            ⚖️ {verdictLabel}
          </div>
        </div>

        {/* Middle Section: Player Name & Detailed Report Console */}
        <div className="flex flex-col items-center justify-center my-auto w-full gap-2 z-30 pointer-events-none">
          {/* Player / Manager Name */}
          <div className="text-center w-full">
            <h2 
              className="font-bold text-[21px] tracking-widest uppercase leading-none truncate max-w-[280px] mx-auto"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: '900',
                color: '#FFE082',
                textShadow: '0 2px 6px rgba(0,0,0,0.95)'
              }}
            >
              {data.playerName || 'MANAGER'}
            </h2>
            {data.clubName && (
              <p className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 mt-1 truncate">
                {data.clubName}
              </p>
            )}
          </div>

          {/* Hot Take Quote & Audited Charge Glass Console */}
          <div 
            className="w-full bg-black/55 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 text-center backdrop-blur-md"
            style={{
              boxShadow: 'inset 0 1px 6px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <p className="italic text-[10.5px] leading-tight text-white font-semibold line-clamp-2">
              &ldquo;{takeDisplay}&rdquo;
            </p>
            <div className="border-t border-white/10 pt-1.5 flex flex-col gap-0.5">
              <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-wide truncate">
                <span style={{ color: colors.textColor }}>CHARGE:</span> {chargeDisplay}
              </p>
              {data.sentence && (
                <p className="text-[7.5px] font-medium text-rose-300 italic truncate">
                  &ldquo;{sentenceDisplay}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: 4 Core Stats Panel (Strictly Enclosed) */}
        <div 
          className="w-full h-[54px] flex items-center justify-between z-30 px-2 py-1.5 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md shrink-0"
          style={{
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6), 0 4px 10px rgba(0,0,0,0.5)',
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
                  className="text-[8.5px] font-black tracking-widest uppercase leading-none flex items-center gap-0.5" 
                  style={{ color: colors.textColor }}
                >
                  <span>{m.label}</span>
                  <span className="text-[6.5px] opacity-60 font-normal">({getWeightLabel(m.label)})</span>
                </span>
                <span 
                  className="text-[17px] mt-1 leading-none font-black text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]"
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
