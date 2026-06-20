'use client';

import { useId } from 'react';
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
function getThemeColors() {
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

// ─── Theme Label ─────────────────────────────────────────────────────────────
function getThemeLabel(): string {
  return 'GOLD';
}

// ─── 2 Metric Derivation ─────────────────────────────────────────────────────

// ─── 4 Main Metrics Derivation ────────────────────────────────────────────────
function get4Metrics(data: VerdictData): [
  { label: string; val: number },
  { label: string; val: number },
  { label: string; val: number },
  { label: string; val: number }
] {
  const stats = data.stats || [];
  const prdStat = stats.find(s => s.label === 'PRD' || s.name?.toLowerCase().includes('pred') || s.label?.toLowerCase() === 'prd');
  const htkStat = stats.find(s => s.label === 'HTK' || s.name?.toLowerCase().includes('take') || s.label?.toLowerCase() === 'htk');
  const selStat = stats.find(s => s.label === 'SEL' || s.label === 'TAC' || s.name?.toLowerCase().includes('select') || s.name?.toLowerCase().includes('tact') || s.label?.toLowerCase() === 'sel');
  const cmyStat = stats.find(s => s.label === 'CMY' || s.name?.toLowerCase().includes('comm') || s.label?.toLowerCase() === 'cmy');

  const statsJson = (data as any).statsJson || {};

  const prd = prdStat?.val ?? (statsJson.predictionPerfScore ?? (stats.find(s => s.label === 'IQ')?.val ?? data.ovr));
  const htk = htkStat?.val ?? (statsJson.avgTakeOvr ?? Math.max(30, Math.min(99, data.ovr + 2)));
  const sel = selStat?.val ?? (statsJson.tacticalRating ?? Math.max(30, Math.min(99, data.ovr - 3)));
  const cmy = cmyStat?.val ?? (statsJson.communityRating ?? Math.max(30, Math.min(99, data.ovr + 1)));

  return [
    { label: 'PRD', val: prd },
    { label: 'HTK', val: htk },
    { label: 'SEL', val: sel },
    { label: 'CMY', val: cmy },
  ];
}

// ─── Jersey Details & Custom Avatar Rendering ──────────────────────────────────
function getJerseyDetails(flag: string) {
  const normalized = flag.trim();
  
  if (normalized === '🇦🇷') {
    return { primary: '#74ACDF', secondary: '#FFFFFF', collar: '#000000', style: 'stripes' };
  }
  if (normalized === '🇧🇷') {
    return { primary: '#FEDF00', secondary: '#009B3A', collar: '#009B3A', style: 'solid' };
  }
  if (normalized === '🇵🇹') {
    return { primary: '#E42118', secondary: '#006629', collar: '#FEDF00', style: 'halves' };
  }
  if (normalized === '🇫🇷') {
    return { primary: '#0F1E36', secondary: '#FFFFFF', collar: '#E42118', style: 'solid' };
  }
  if (normalized === '🏴\u200d󠁢\u200d󠁥\u200d󠁮\u200d󠁧\u200d󠁿' || normalized === '🏴󠁧󠁢󠁥󠁮󠁧󠁿' || normalized.includes('🏴') || normalized.includes('🇬🇧')) {
    return { primary: '#FFFFFF', secondary: '#0F1E36', collar: '#0F1E36', style: 'solid' };
  }
  if (normalized === '🇩🇪') {
    return { primary: '#FFFFFF', secondary: '#000000', collar: '#000000', style: 'germany-stripes' };
  }
  if (normalized === '🇪🇸') {
    return { primary: '#C60B1E', secondary: '#F1BF00', collar: '#F1BF00', style: 'solid' };
  }
  if (normalized === '🇳🇱') {
    return { primary: '#F15A24', secondary: '#FFFFFF', collar: '#21409A', style: 'solid' };
  }
  if (normalized === '🇮🇹') {
    return { primary: '#0066CC', secondary: '#FFFFFF', collar: '#008C45', style: 'solid' };
  }
  if (normalized === '🇺🇸') {
    return { primary: '#FFFFFF', secondary: '#0A3161', collar: '#B31942', style: 'solid' };
  }
  if (normalized === '🇲🇽') {
    return { primary: '#006847', secondary: '#FFFFFF', collar: '#CE1126', style: 'solid' };
  }
  if (normalized === '🇭🇷') {
    return { primary: '#FFFFFF', secondary: '#C60B1E', collar: '#1D2A44', style: 'checker' };
  }
  if (normalized === '🇺🇾') {
    return { primary: '#55B3FF', secondary: '#FFFFFF', collar: '#FCD116', style: 'solid' };
  }
  if (normalized === '🇲🇦') {
    return { primary: '#C1272D', secondary: '#006233', collar: '#006233', style: 'morocco-band' };
  }
  if (normalized === '🇯🇵') {
    return { primary: '#001E62', secondary: '#FFFFFF', collar: '#BC002D', style: 'solid' };
  }
  if (normalized === '🇨🇦') {
    return { primary: '#C1272D', secondary: '#FFFFFF', collar: '#FFFFFF', style: 'sleeves' };
  }
  
  // Default dynamic fallback based on emoji codepoint to give consistent varied colors
  let code = 0;
  if (normalized.length > 0) {
    code = normalized.charCodeAt(0) + (normalized.charCodeAt(1) || 0);
  }
  const colorFallbacks = [
    { primary: '#1E293B', secondary: '#D97706', collar: '#D97706', style: 'solid' }, // black-gold
    { primary: '#047857', secondary: '#34D399', collar: '#FFFFFF', style: 'solid' }, // green-white
    { primary: '#8B5CF6', secondary: '#F472B6', collar: '#FFFFFF', style: 'solid' }, // purple-pink
    { primary: '#3B82F6', secondary: '#60A5FA', collar: '#FFFFFF', style: 'solid' }, // blue-white
  ];
  return colorFallbacks[code % colorFallbacks.length];
}

function JerseyAvatar({ avatarUrl, flag }: { avatarUrl: string; flag: string; }) {
  const { primary, secondary, collar, style } = getJerseyDetails(flag);
  const baseId = useId();
  const cleanId = baseId.replace(/:/g, '');
  const maskId = `jersey-mask-${cleanId}`;
  const clipId = `face-clip-${cleanId}`;

  return (
    <svg className="w-[180px] h-[180px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* The main jersey shape clip mask */}
        <mask id={maskId}>
          <path 
            d="M 38 20 Q 50 28 62 20 L 78 24 L 92 42 L 82 52 L 74 42 L 74 92 L 26 92 L 26 42 L 18 52 L 8 42 L 22 24 Z" 
            fill="white" 
          />
        </mask>
        
        {/* Circular/oval mask for the uploaded face photo */}
        <clipPath id={clipId}>
          <ellipse cx="50" cy="22" rx="14" ry="17" />
        </clipPath>
        
        {/* Soft shadow blur filter */}
        <filter id="shadow-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        
        {/* Face shading gradient to match game lights */}
        <radialGradient id="face-shading" cx="50%" cy="30%" r="50%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>


      </defs>
      
      {/* ─── JERSEY LAYER ─── */}
      <g mask={`url(#${maskId})`}>
        {/* Base Shirt Color */}
        <path 
          d="M 38 20 Q 50 28 62 20 L 78 24 L 92 42 L 82 52 L 74 42 L 74 92 L 26 92 L 26 42 L 18 52 L 8 42 L 22 24 Z" 
          fill={primary} 
        />
        
        {/* Patterns based on style */}
        {style === 'stripes' && (
          <>
            <rect x="34" y="20" width="6" height="72" fill={secondary} />
            <rect x="46" y="20" width="6" height="72" fill={secondary} />
            <rect x="58" y="20" width="6" height="72" fill={secondary} />
            <rect x="22" y="20" width="6" height="72" fill={secondary} />
            <rect x="70" y="20" width="6" height="72" fill={secondary} />
          </>
        )}
        
        {style === 'halves' && (
          <path d="M 50 20 L 78 24 L 92 42 L 82 52 L 74 42 L 74 92 L 50 92 Z" fill={secondary} />
        )}
        
        {style === 'checker' && (
          <g opacity="0.95">
            <rect x="26" y="20" width="8" height="8" fill={secondary} />
            <rect x="42" y="20" width="8" height="8" fill={secondary} />
            <rect x="58" y="20" width="8" height="8" fill={secondary} />
            
            <rect x="34" y="28" width="8" height="8" fill={secondary} />
            <rect x="50" y="28" width="8" height="8" fill={secondary} />
            <rect x="66" y="28" width="8" height="8" fill={secondary} />
            
            <rect x="26" y="36" width="8" height="8" fill={secondary} />
            <rect x="42" y="36" width="8" height="8" fill={secondary} />
            <rect x="58" y="36" width="8" height="8" fill={secondary} />
            
            <rect x="34" y="44" width="8" height="8" fill={secondary} />
            <rect x="50" y="44" width="8" height="8" fill={secondary} />
            <rect x="66" y="44" width="8" height="8" fill={secondary} />
            
            <rect x="26" y="52" width="8" height="8" fill={secondary} />
            <rect x="42" y="52" width="8" height="8" fill={secondary} />
            <rect x="58" y="52" width="8" height="8" fill={secondary} />
            
            <rect x="34" y="60" width="8" height="8" fill={secondary} />
            <rect x="50" y="60" width="8" height="8" fill={secondary} />
            <rect x="66" y="60" width="8" height="8" fill={secondary} />
            
            <rect x="26" y="68" width="8" height="8" fill={secondary} />
            <rect x="42" y="68" width="8" height="8" fill={secondary} />
            <rect x="58" y="68" width="8" height="8" fill={secondary} />

            <rect x="34" y="76" width="8" height="8" fill={secondary} />
            <rect x="50" y="76" width="8" height="8" fill={secondary} />
            <rect x="66" y="76" width="8" height="8" fill={secondary} />

            <rect x="26" y="84" width="8" height="8" fill={secondary} />
            <rect x="42" y="84" width="8" height="8" fill={secondary} />
            <rect x="58" y="84" width="8" height="8" fill={secondary} />
          </g>
        )}
        
        {style === 'germany-stripes' && (
          <g opacity="0.9">
            <path d="M 26 30 L 74 30 L 74 34 L 26 34 Z" fill="#FF0000" />
            <path d="M 26 34 L 74 34 L 74 38 L 26 38 Z" fill="#FFCC00" />
            <path d="M 26 26 L 74 26 L 74 30 L 26 30 Z" fill="#000000" />
          </g>
        )}
        
        {style === 'morocco-band' && (
          <path d="M 26 42 L 74 42 L 74 52 L 26 52 Z" fill={secondary} />
        )}
        
        {style === 'sleeves' && (
          <>
            <path d="M 22 24 L 8 42 L 18 52 L 26 42 Z" fill={secondary} />
            <path d="M 78 24 L 92 42 L 82 52 L 74 42 Z" fill={secondary} />
          </>
        )}

        {/* Small country flag badge on the left chest */}
        <text x="61" y="45" fontSize="6.5" textAnchor="middle" filter="drop-shadow(0px 1px 1.5px rgba(0,0,0,0.5))">
          {flag}
        </text>
      </g>
      
      {/* Collar Border (drawn on top of patterns) */}
      <path 
        d="M 37.5 19.5 Q 50 28.5 62.5 19.5" 
        stroke={collar} 
        strokeWidth="3.2" 
        fill="none" 
      />
      
      {/* ─── FACE LAYER ─── */}
      {/* 3D drop shadow underneath the face for volume */}
      <ellipse cx="50" cy="23.5" rx="14" ry="17" fill="black" opacity="0.4" filter="url(#shadow-blur)" />
      
      {/* The face photo clipped to the face mask */}
      <image 
        href={avatarUrl} 
        x="34" 
        y="3" 
        width="32" 
        height="38" 
        clipPath={`url(#${clipId})`} 
        preserveAspectRatio="xMidYMid slice" 
      />
      
      {/* Ambient shadow overlay on face to blend with cartoonish card */}
      <ellipse cx="50" cy="22" rx="14" ry="17" fill="url(#face-shading)" opacity="0.15" pointerEvents="none" />
    </svg>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function SportsCenterCard({
  data,
  cardRef,
}: {
  data: VerdictData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const colors = getThemeColors();
  const themeLabel = getThemeLabel();
  const verdictLabel = getVerdictLabel(data.verdict, data.ovr);
  const verdictColor = getVerdictColor(data.verdict, data.ovr);
  const metrics = get4Metrics(data);

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
          <pattern id="gold-premium-pat" width="340" height="480" patternUnits="userSpaceOnUse">
            <image href="/images/card_bg.webp" x="0" y="0" width="340" height="480" preserveAspectRatio="xMidYMid slice" />
          </pattern>

          {/* Theme Border Gradients */}
          <linearGradient id="gold-border" x1="0" y1="0" x2="340" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Radial glow definitions */}
          <radialGradient id="gold-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="1" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
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
        
        {/* OVR, Position, Golden Boot & FUT Badge */}
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
          
          {/* Custom SVG Golden Boot Icon */}
          <svg 
            className="w-9 h-4 mt-1.5 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]" 
            viewBox="0 0 24 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M22 6C22 6 20.5 3 17 2.5C14.5 2.1 11.5 4.5 10 5.5L4.5 7C2.5 7.5 1.5 8.5 1 9.5C0.5 10.5 1 11 2 11H20.5C21.5 11 22 9.5 22 9.5L22 6Z" 
              fill="#FBBF24" 
            />
            <path 
              d="M4 11V12.5M8 11V12.5M12 11V12.5M16 11V12.5M20 11V12.5" 
              stroke="#FBBF24" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
            />
          </svg>

          {/* FUT/Theme Crest Badge */}
          <div className="flex flex-col items-center mt-2">
            <svg 
              className="w-[28px] h-[28px] drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]" 
              viewBox="0 0 32 32" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M16 2 L28 6 L28 16 C28 23.5 22.8 28.5 16 30 C9.2 28.5 4 23.5 4 16 L4 6 Z" 
                stroke="#FBBF24" 
                strokeWidth="1.8" 
                fill="rgba(0,0,0,0.4)" 
              />
              <path 
                d="M16 6 L24 9 L24 16 C24 21 20.5 25 16 26.5 C11.5 25 8 21 8 16 L8 9 Z" 
                fill="#FBBF24" 
                opacity="0.15" 
              />
              <text 
                x="16" 
                y="14.5" 
                fill="#FBBF24" 
                fontSize="7" 
                fontWeight="900" 
                textAnchor="middle" 
                fontFamily="'Oswald', sans-serif"
              >
                FUT
              </text>
              <text 
                x="16" 
                y="21.5" 
                fill="#FFF" 
                fontSize="6" 
                fontWeight="900" 
                textAnchor="middle" 
                fontFamily="'Oswald', sans-serif"
              >
                {themeLabel}
              </text>
            </svg>
          </div>
        </div>

        {/* Player Image (Cutout, Center-aligned) */}
        <div 
          className="absolute top-[52px] left-[15%] w-[70%] h-[192px] flex items-end justify-center z-20 pointer-events-none"
        >
          {hasCustomPhoto ? (
            <JerseyAvatar avatarUrl={data.avatarSeed!} flag={data.countryFlag || '🌍'} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://api.dicebear.com/7.x/${(data.avatarStyle && !data.avatarStyle.startsWith('ai-')) ? data.avatarStyle : 'fun-emoji'}/svg?seed=${encodeURIComponent(data.avatarSeed || data.playerName || 'TAKE MAKER')}`}
              alt="Avatar"
              className="w-32 h-32 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              loading="lazy"
            />
          )}
        </div>

        {/* Player Name */}
        <div className="absolute top-[318px] left-0 right-0 text-center z-30 pointer-events-none">
          <h2 
            className="font-bold text-[24px] tracking-widest uppercase leading-none"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: '900',
              color: '#FFE082', // Gold/champagne color
              textShadow: '0 2.5px 5px rgba(0,0,0,0.95), 0 5px 12px rgba(0,0,0,0.95)'
            }}
          >
            {(data.playerName || 'TAKE MAKER').slice(0, 15)}
          </h2>
        </div>

        {/* Verdict Stamp (Ink style, tilted, overlaps center) */}
        <div className="absolute top-[140px] right-[16px] rotate-[-10deg] z-40 pointer-events-none select-none">
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
          className="absolute top-[246px] left-[24px] right-[24px] h-[62px] bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center text-center px-4 py-2 z-30 shadow-inner"
          style={{
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.65), 0 4px 10px rgba(0,0,0,0.35)',
          }}
        >
          <p 
            className="italic text-[11px] leading-relaxed line-clamp-2 font-semibold text-zinc-150"
            style={{ 
              color: '#FFFFFF',
              fontFamily: "'Outfit', sans-serif",
              textShadow: '0 1px 2px rgba(0,0,0,0.85)'
            }}
          >
            &ldquo;{takeDisplay}&rdquo;
          </p>
        </div>

        {/* Metrics Section (4 Columns) */}
        <div 
          className="absolute top-[350px] left-[24px] right-[24px] h-[48px] flex items-center justify-between z-30"
          style={{
            borderTop: '1.5px solid rgba(255,255,255,0.08)',
            borderBottom: '1.5px solid rgba(255,255,255,0.08)',
          }}
        >
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center flex-1">
              <span 
                className="text-[9.5px] font-black tracking-widest uppercase leading-none" 
                style={{ color: colors.textColor || '#FBBF24' }}
              >
                {m.label}
              </span>
              <span 
                className="text-[19px] mt-1.5 leading-none font-black text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]"
                style={{ 
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 900
                }}
              >
                {m.val}
              </span>
            </div>
          ))}
        </div>

        {/* Country Flag at Bottom Center */}
        <div className="absolute top-[408px] left-0 right-0 flex justify-center items-center z-30 pointer-events-none">
          <span className="text-[26px] leading-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] select-none">
            {data.countryFlag || '🌍'}
          </span>
        </div>

        {/* Footer Section (Charge + Sentence) */}
        <div className="absolute top-[436px] left-[50px] right-[50px] flex flex-col justify-center items-center gap-0.5 text-center z-30">
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
