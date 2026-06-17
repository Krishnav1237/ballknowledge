'use client';

import { VerdictData } from '@/lib/tribunalDB';

// ─── Verdict Label Mapper ────────────────────────────────────────────────────
// Maps raw verdict strings to premium, entertaining tribunal labels
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
  // OVR fallback
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
function getThemeColors(cardTheme?: string) {
  const theme = cardTheme || 'gold';
  switch (theme) {
    case 'toty':
      return {
        bgId: 'toty-premium-pat',
        borderId: 'toty-border',
        accentColor: '#FBBF24',
        textColor: '#60A5FA',
        glow: 'rgba(59,130,246,0.5)',
        glowId: 'toty-glow',
        bgFilter: 'none',
      };
    case 'tots':
      return {
        bgId: 'toty-premium-pat',
        borderId: 'tots-border',
        accentColor: '#22D3EE',
        textColor: '#22D3EE',
        glow: 'rgba(6,182,212,0.45)',
        glowId: 'tots-glow',
        bgFilter: 'hue-rotate(50deg) saturate(1.2)',
      };
    case 'icon':
      return {
        bgId: 'gold-premium-pat',
        borderId: 'icon-border',
        accentColor: '#D97706',
        textColor: '#E2E8F0',
        glow: 'rgba(255,255,255,0.25)',
        glowId: 'icon-glow',
        bgFilter: 'saturate(0.05) brightness(0.95)',
      };
    case 'hero':
      return {
        bgId: 'toty-premium-pat',
        borderId: 'hero-border',
        accentColor: '#EC4899',
        textColor: '#EC4899',
        glow: 'rgba(236,72,153,0.5)',
        glowId: 'hero-glow',
        bgFilter: 'hue-rotate(125deg) saturate(1.2) contrast(1.1)',
      };
    case 'wc_legend':
      return {
        bgId: 'gold-premium-pat',
        borderId: 'wc-legend-border',
        accentColor: '#34D399',
        textColor: '#34D399',
        glow: 'rgba(5,150,105,0.4)',
        glowId: 'wc-glow',
        bgFilter: 'hue-rotate(-50deg) saturate(0.8) contrast(1.15)',
      };
    case 'ballon_dor':
      return {
        bgId: 'gold-premium-pat',
        borderId: 'ballon-dor-border',
        accentColor: '#FBBF24',
        textColor: '#FBBF24',
        glow: 'rgba(251,191,36,0.5)',
        glowId: 'ballon-glow',
        bgFilter: 'brightness(1.1) contrast(1.1)',
      };
    case 'var':
      return {
        bgId: 'toty-premium-pat',
        borderId: 'red-border',
        accentColor: '#EF4444',
        textColor: '#FCA5A5',
        glow: 'rgba(220,38,38,0.5)',
        glowId: 'var-glow',
        bgFilter: 'hue-rotate(195deg) saturate(1.8) brightness(0.7)',
      };
    case 'spinner':
      return {
        bgId: 'toty-premium-pat',
        borderId: 'green-border',
        accentColor: '#10B981',
        textColor: '#A7F3D0',
        glow: 'rgba(16,185,129,0.45)',
        glowId: 'spinner-glow',
        bgFilter: 'hue-rotate(95deg) saturate(1.3) brightness(0.7)',
      };
    case 'bottler':
      return {
        bgId: 'gold-premium-pat',
        borderId: 'silver-border',
        accentColor: '#64748B',
        textColor: '#CBD5E1',
        glow: 'rgba(100,116,139,0.3)',
        glowId: 'bottler-glow',
        bgFilter: 'saturate(0) brightness(0.6)',
      };
    case 'gold':
    default:
      return {
        bgId: 'gold-premium-pat',
        borderId: 'gold-border',
        accentColor: '#D97706',
        textColor: '#FFE082',
        glow: 'rgba(217,119,6,0.4)',
        glowId: 'gold-glow',
        bgFilter: 'none',
      };
  }
}

// ─── Theme Label ─────────────────────────────────────────────────────────────
function getThemeLabel(cardTheme?: string): string {
  switch (cardTheme) {
    case 'toty': return 'TOTY';
    case 'tots': return 'TOTS';
    case 'icon': return 'ICON';
    case 'hero': return 'HERO';
    case 'wc_legend': return 'WC';
    case 'ballon_dor': return 'BdO';
    case 'var': return 'VAR';
    case 'spinner': return 'SPR';
    case 'bottler': return 'BOT';
    default: return 'GOLD';
  }
}

// ─── 2 Metric Derivation ─────────────────────────────────────────────────────
function get2Metrics(data: VerdictData): [{ label: string; val: number }, { label: string; val: number }] {
  const stats = data.stats || [];
  const iqStat = stats.find(s => s.label === 'IQ');
  const delStat = stats.find(s => s.label === 'DEL');
  const iq = iqStat?.val ?? data.ovr;
  const del = delStat?.val ?? Math.max(1, 99 - data.ovr);
  return [
    { label: 'BALL IQ', val: iq },
    { label: 'DELUSION', val: del },
  ];
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function SportsCenterCard({
  data,
  cardRef,
}: {
  data: VerdictData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const colors = getThemeColors(data.cardTheme);
  const themeLabel = getThemeLabel(data.cardTheme);
  const verdictLabel = getVerdictLabel(data.verdict, data.ovr);
  const verdictColor = getVerdictColor(data.verdict, data.ovr);
  const [metric1, metric2] = get2Metrics(data);

  // Truncate take text for card display
  const takeDisplay = data.text.length > 70
    ? data.text.slice(0, 67).trimEnd() + '…'
    : data.text;

  // Truncate charge
  const chargeDisplay = data.charge.length > 40
    ? data.charge.slice(0, 37).trimEnd() + '…'
    : data.charge;

  // Sentence trimmed (max 1 sentence)
  const sentenceDisplay = data.sentence.length > 45
    ? data.sentence.slice(0, 42).trimEnd() + '…'
    : data.sentence;

  const hasCustomPhoto = (data.avatarSeed?.startsWith('data:image/') || data.avatarSeed?.startsWith('/') || data.avatarSeed?.startsWith('http'));

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
          {/* Patterns for background images */}
          <pattern id="toty-premium-pat" width="340" height="480" patternUnits="userSpaceOnUse">
            <image href="/images/toty_bg_premium.png" x="0" y="0" width="340" height="480" preserveAspectRatio="xMidYMid slice" />
          </pattern>
          <pattern id="gold-premium-pat" width="340" height="480" patternUnits="userSpaceOnUse">
            <image href="/images/card_bg.png" x="0" y="0" width="340" height="480" preserveAspectRatio="xMidYMid slice" />
          </pattern>

          {/* Theme Border Gradients */}
          <linearGradient id="toty-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="30%" stopColor="#3B82F6" />
            <stop offset="70%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="tots-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="30%" stopColor="#06B6D4" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="icon-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="hero-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="wc-legend-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="ballon-dor-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="25%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#FFF" />
            <stop offset="75%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="gold-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="red-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
          <linearGradient id="green-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="50%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
          <linearGradient id="silver-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Radial glow definitions */}
          <radialGradient id="toty-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gold-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="1" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tots-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="icon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="1" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#059669" stopOpacity="1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ballon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="1" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="var-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="spinner-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bottler-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#64748B" stopOpacity="1" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
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

          {/* Stadium Light Beam Gradients */}
          <linearGradient id="light-beam-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.accentColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colors.accentColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="light-beam-right" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.accentColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colors.accentColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Curved FUT Shield Base Path with Premium Background Image and Filter */}
        <path
          d="M 6,56 C 6,56 26,10 72,10 C 108,10 126,24 144,24 C 153,24 156,16 162,16 C 168,16 171,24 180,24 C 198,24 216,10 252,10 C 298,10 318,56 318,56 L 318,368 C 318,396 270,442 162,472 C 54,442 6,396 6,368 Z"
          fill={`url(#${colors.bgId})`}
          style={{ filter: colors.bgFilter }}
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
        <circle cx="162" cy="180" r="160" fill={`url(#${colors.glowId})`} opacity="0.3" style={{ mixBlendMode: 'screen' }} />

        {/* Stadium Floodlight Beams */}
        <g opacity="0.5">
          <polygon points="6,56 162,320 60,400" fill="url(#light-beam-left)" style={{ mixBlendMode: 'screen' }} />
          <polygon points="318,56 162,320 264,400" fill="url(#light-beam-right)" style={{ mixBlendMode: 'screen' }} />
        </g>

        {/* Stylized Soccer Ball Watermark */}
        <g opacity="0.08" stroke={colors.accentColor} strokeWidth="1.2" fill="none">
          <circle cx="162" cy="175" r="65" />
          <polygon points="162,145 190,165 179,198 145,198 134,165" />
          <line x1="162" y1="145" x2="162" y2="110" />
          <line x1="190" y1="165" x2="223,153" />
          <line x1="179" y1="198" x2="200,236" />
          <line x1="145" y1="198" x2="124,236" />
          <line x1="134" y1="165" x2="101,153" />
        </g>

        {/* Football Pitch Lines */}
        <g opacity="0.12" stroke="#FFFFFF" strokeWidth="1" fill="none">
          <circle cx="162" cy="400" r="55" />
          <line x1="6" y1="400" x2="318" y2="400" />
          <path d="M 65,480 L 65,435 L 259,435 L 259,480" />
          <path d="M 112,480 L 112,458 L 212,458 L 212,480" />
          <circle cx="162" cy="447" r="1.5" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Layer 2: Card Content Overlay - Absolute Positioned */}
      <div className="absolute inset-0 w-full h-full text-white pointer-events-none">
        
        {/* OVR, Position & VAR Shield */}
        <div className="absolute top-[25px] left-[22px] w-[55px] flex flex-col items-center pointer-events-none">
          <span 
            className="text-[52px] tracking-tighter leading-none text-white drop-shadow-[0_2.5px_5px_rgba(0,0,0,0.95)]"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: '900',
            }}
          >
            {data.ovr}
          </span>
          <span 
            className="text-[10px] font-bold tracking-widest uppercase leading-none mt-0.5" 
            style={{ 
              color: colors.textColor,
              textShadow: '0 1px 2px rgba(0,0,0,0.95)'
            }}
          >
            {data.playerPosition || 'TKT'}
          </span>
          
          {/* VAR Badge Shield Graphic */}
          <svg className="w-[30px] h-[22px] mt-1.5 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="none">
            <path d="M 12 2 L 2 5 L 2 12 C 2 17 6 21 12 23 C 18 21 22 17 22 12 L 22 5 L 12 2 Z" fill="rgba(0,0,0,0.5)" stroke={colors.accentColor} strokeWidth="1.8" />
            <text x="12" y="14.5" fill="#FFF" fontSize="7" fontWeight="950" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif">VAR</text>
          </svg>
        </div>

        {/* Flag & Theme badge */}
        <div className="absolute top-[28px] right-[24px] w-[55px] flex flex-col items-center pointer-events-none">
          <span className="text-[34px] leading-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] select-none">
            {data.countryFlag || '🌍'}
          </span>
          <span 
            className="text-[7.5px] font-mono font-black tracking-widest px-1.5 py-0.5 rounded border bg-black/65 border-white/10 uppercase leading-none mt-2"
            style={{ 
              color: colors.textColor,
              textShadow: '0 0.5px 1px rgba(0,0,0,0.95)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
            }}
          >
            {themeLabel}
          </span>
        </div>

        {/* Player Image (Cutout, Center-aligned) */}
        <div 
          className="absolute top-[62px] left-[15%] w-[70%] h-[216px] flex items-end justify-center z-20 pointer-events-none"
        >
          {hasCustomPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatarSeed}
              alt="Player Portrait"
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://api.dicebear.com/7.x/${data.avatarStyle || 'fun-emoji'}/svg?seed=${encodeURIComponent(data.avatarSeed || data.playerName || 'TAKE MAKER')}`}
              alt="Avatar"
              className="w-36 h-36 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              loading="lazy"
            />
          )}
        </div>

        {/* Player Name */}
        <div className="absolute top-[275px] left-0 right-0 text-center z-30 pointer-events-none">
          <h2 
            className="font-bold text-[24px] text-white tracking-widest uppercase leading-none"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: '900',
              textShadow: '0 2.5px 5px rgba(0,0,0,0.95), 0 5px 12px rgba(0,0,0,0.95)'
            }}
          >
            {(data.playerName || 'TAKE MAKER').slice(0, 15)}
          </h2>
        </div>

        {/* Verdict Stamp (Ink style, tilted, overlaps center) */}
        <div className="absolute top-[145px] right-[16px] rotate-[-10deg] z-40 pointer-events-none select-none">
          <div 
            className="px-3.5 py-1.5 border-4 border-double text-[14px] font-bold tracking-widest uppercase rounded shadow-2xl"
            style={{
              borderColor: verdictColor.color,
              color: verdictColor.color,
              backgroundColor: `${verdictColor.color}15`,
              textShadow: `0 0 6px ${verdictColor.glow}`,
              boxShadow: `0 8px 20px rgba(0,0,0,0.65), inset 0 0 6px ${verdictColor.color}35`,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            ⚖️ {verdictLabel}
          </div>
        </div>

        {/* Hot Take Quote Plaque */}
        <div 
          className="absolute top-[305px] left-[24px] right-[24px] h-[72px] bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center text-center px-4 py-2 z-30 shadow-inner"
          style={{
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.65), 0 4px 10px rgba(0,0,0,0.35)',
          }}
        >
          <p 
            className="italic text-[11.5px] leading-relaxed line-clamp-3 font-semibold text-zinc-150"
            style={{ 
              color: '#FFFFFF',
              fontFamily: "'Outfit', sans-serif",
              textShadow: '0 1px 2px rgba(0,0,0,0.85)'
            }}
          >
            &ldquo;{takeDisplay}&rdquo;
          </p>
        </div>

        {/* Metrics Section (BALL IQ and DELUSION Side-by-Side) */}
        <div 
          className="absolute top-[384px] left-[32px] right-[32px] h-[38px] flex justify-between items-center px-6 rounded-xl z-30"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.01) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex flex-col items-center flex-1">
            <span 
              className="text-[7.5px] font-black tracking-widest uppercase leading-none" 
              style={{ color: colors.textColor }}
            >
              BALL IQ
            </span>
            <span 
              className="text-[17px] mt-0.5 leading-none"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: '700',
                color: '#FFFFFF'
              }}
            >
              {metric1.val}
            </span>
          </div>
          <div className="w-[1px] h-5 bg-white/10" />
          <div className="flex flex-col items-center flex-1">
            <span 
              className="text-[7.5px] font-black tracking-widest uppercase leading-none" 
              style={{ color: colors.textColor }}
            >
              DELUSION
            </span>
            <span 
              className="text-[17px] mt-0.5 leading-none"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: '700',
                color: '#FFFFFF'
              }}
            >
              {metric2.val}
            </span>
          </div>
        </div>

        {/* Footer Section (Charge + Sentence) */}
        <div className="absolute top-[428px] left-[50px] right-[50px] flex flex-col justify-center items-center gap-0.5 text-center z-30">
          <p className="margin-0 text-[8.5px] font-bold text-zinc-300 leading-snug line-clamp-1">
            <span className="uppercase mr-1" style={{ color: colors.textColor }}>CHARGE:</span> {chargeDisplay}
          </p>
          <p className="margin-0 text-[7.5px] font-medium text-zinc-400 italic leading-snug line-clamp-1">
            {sentenceDisplay}
          </p>
        </div>

      </div>
    </div>
  );
}
