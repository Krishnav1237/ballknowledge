'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Flame, Star, Crown, Shield,
  BarChart2, Search, Sparkles,
} from 'lucide-react';
import { getStoredProfile, FootballIQProfile } from '@/lib/profileSync';
import type { LeaderboardEntry } from '@/app/api/leaderboard/route';

// ── Constants & Helpers ─────────────────────────────────────────────────────────

const SORT_TABS = [
  { id: 'overall',    label: 'Overall IQ',   icon: Trophy },
  { id: 'prediction', label: 'Prediction',   icon: BarChart2 },
  { id: 'hottake',    label: 'Hot Takes',    icon: Flame },
] as const;

type SortMode = 'overall' | 'prediction' | 'hottake';

function getRarityBand(ovr: number) {
  if (ovr >= 90) return { label: 'LEGENDARY', colour: 'text-amber-400', border: 'border-amber-400/40', bg: 'bg-amber-400/8' };
  if (ovr >= 75) return { label: 'EPIC',      colour: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/8' };
  if (ovr >= 60) return { label: 'RARE',      colour: 'text-blue-400',   border: 'border-blue-400/30',   bg: 'bg-blue-400/8'  };
  return                { label: 'COMMON',    colour: 'text-gray-400',   border: 'border-white/8',       bg: 'bg-white/3'      };
}

function getCountryAbbreviation(countryName: string): string {
  const n = countryName.trim().toLowerCase();
  if (n.includes('arg')) return 'ARG';
  if (n.includes('bra') || n.includes('brasil')) return 'BRA';
  if (n.includes('por')) return 'POR';
  if (n.includes('fra')) return 'FRA';
  if (n.includes('eng') || n.includes('gbr')) return 'ENG';
  if (n.includes('ger') || n.includes('deu') || n.includes('deutsch')) return 'GER';
  if (n.includes('spa') || n.includes('esp')) return 'ESP';
  if (n.includes('net') || n.includes('hol') || n.includes('nld') || n.includes('nether')) return 'NED';
  if (n.includes('uru')) return 'URU';
  if (n.includes('mar') || n.includes('mor')) return 'MAR';
  if (n.includes('jap') || n.includes('jpn')) return 'JPN';
  if (n.includes('sau') || n.includes('ksa') || n.includes('saudi')) return 'KSA';
  if (n.includes('usa') || n.includes('united states') || n.includes('america')) return 'USA';
  if (n.includes('can')) return 'CAN';
  if (n.includes('mex')) return 'MEX';
  if (n.includes('ita')) return 'ITA';
  if (n.includes('cro')) return 'CRO';
  if (n.includes('bel')) return 'BEL';
  if (n.includes('sen')) return 'SEN';
  if (n.includes('swe')) return 'SWE';
  if (n.includes('tun')) return 'TUN';
  if (n.includes('egy')) return 'EGY';
  if (n.includes('irn') || n.includes('iran')) return 'IRN';
  if (n.includes('nzl') || n.includes('new zealand')) return 'NZL';
  if (n.includes('aus')) return 'AUS';
  if (n.includes('qat')) return 'QAT';
  if (n.includes('kor') || n.includes('korea')) return 'KOR';
  if (n.includes('col')) return 'COL';
  if (n.includes('pol')) return 'POL';
  if (n.includes('den') || n.includes('dnk')) return 'DEN';
  if (n.includes('swi') || n.includes('sui') || n.includes('swiss')) return 'SUI';
  if (n.includes('ser') || n.includes('srb')) return 'SRB';
  if (n.includes('aut')) return 'AUT';
  return countryName.substring(0, 3).toUpperCase();
}

const getRatingBadgeStyle = (ovr: number) => {
  if (ovr >= 90) return 'bg-amber-400/10 border-amber-400/20 text-amber-400';
  if (ovr >= 75) return 'bg-purple-400/10 border-purple-400/20 text-purple-400';
  if (ovr >= 60) return 'bg-blue-400/10 border-blue-400/20 text-blue-400';
  return 'bg-white/[0.03] border-white/5 text-gray-400';
};

const PODIUM_CONFIG = [
  { 
    pos: 1, 
    size: 'h-14', 
    order: 'order-2', 
    crown: 'text-amber-400', 
    glow: 'shadow-amber-400/25', 
    ring: 'ring-amber-400/50', 
    label: '1ST',
    colorClass: 'from-amber-400/25 via-amber-400/10 to-transparent border-t border-t-amber-400/40 border-x border-b border-amber-400/10'
  },
  { 
    pos: 2, 
    size: 'h-10', 
    order: 'order-1', 
    crown: 'text-slate-300', 
    glow: 'shadow-slate-300/15', 
    ring: 'ring-slate-300/40', 
    label: '2ND',
    colorClass: 'from-slate-300/25 via-slate-300/10 to-transparent border-t border-t-slate-300/45 border-x border-b border-slate-300/10'
  },
  { 
    pos: 3, 
    size: 'h-7', 
    order: 'order-3', 
    crown: 'text-amber-700', 
    glow: 'shadow-amber-700/15', 
    ring: 'ring-amber-700/40', 
    label: '3RD',
    colorClass: 'from-amber-700/25 via-amber-700/10 to-transparent border-t border-t-amber-700/45 border-x border-b border-amber-700/10'
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function RatingBar({ value, colour }: { value: number; colour: string }) {
  return (
    <div className="relative h-1 w-12 rounded-full bg-white/8 overflow-hidden mx-auto">
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full ${colour}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

function Avatar({ style, seed, size = 36 }: { style: string; seed: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`}
      alt="avatar"
      width={size}
      height={size}
      className="object-contain rounded-full"
    />
  );
}

function PodiumCard({ entry, config, isMe }: {
  entry: LeaderboardEntry;
  config: typeof PODIUM_CONFIG[number];
  isMe: boolean;
}) {
  const rarity = getRarityBand(entry.overallRating);
  return (
    <motion.div
      className={`flex flex-col items-center gap-1 ${config.order}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: config.pos * 0.08 }}
    >
      {/* Avatar ring */}
      <div className={`relative ring-2 ${config.ring} rounded-full p-0.5 shadow-md ${config.glow} ${isMe ? 'ring-[#D97706]' : ''}`}>
        <Avatar style={entry.avatarStyle} seed={entry.avatarSeed} size={config.pos === 1 ? 38 : 30} />
        {isMe && (
          <span className="absolute -top-1 -right-1 text-[6px] font-black uppercase tracking-wider bg-[#D97706] text-black rounded-full px-1.5 py-0.2 leading-none">
            YOU
          </span>
        )}
      </div>

      {/* Name + OVR */}
      <div className="text-center mt-0.5 w-16 md:w-20">
        <p className="font-display font-black text-[9px] md:text-[10px] uppercase tracking-wide text-white truncate px-0.5">
          {entry.username}
        </p>
        <p className="font-black text-[10px] md:text-xs leading-none text-gray-300 mt-0.5">{entry.overallRating}</p>
        <p className={`text-[7px] font-black uppercase tracking-widest ${rarity.colour} opacity-60 leading-none mt-0.5`}>
          {rarity.label.substring(0, 3)}
        </p>
      </div>

      {/* Podium plinth */}
      <div className={`w-16 md:w-20 ${config.size} rounded-t-lg flex items-end justify-center pb-1 bg-gradient-to-t ${config.colorClass}`}>
        <span className={`font-display font-black text-[9px] md:text-[10px] ${config.crown} opacity-80 tracking-wider`}>
          {config.label}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [entries, setEntries]           = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading]           = useState(true);

  const [sortBy, setSortBy]             = useState<SortMode>('overall');
  const [search, setSearch]             = useState('');
  const [myUsername, setMyUsername]     = useState<string | null>(null);
  const [myProfile, setMyProfile]       = useState<FootballIQProfile | null>(null);
  const [myRank, setMyRank]             = useState<number | null>(null);
  const [error, setError]               = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load current user from localStorage
  useEffect(() => {
    const profile = getStoredProfile();
    if (profile?.username) {
      setMyUsername(profile.username);
      setMyProfile(profile);
    }
  }, []);

  const fetchLeaderboard = useCallback(async (sort: SortMode, quiet = false) => {
    if (!quiet) setLoading(true);
    
    setError(false);
    try {
      const res = await fetch(`/api/leaderboard?sort=${sort}&limit=100`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('API error');
      const data: { entries: LeaderboardEntry[]; total: number } = await res.json();
      setEntries(data.entries);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      
    }
  }, []);

  // Initial fetch + sort-change refetch
  useEffect(() => {
    fetchLeaderboard(sortBy);
  }, [sortBy, fetchLeaderboard]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchLeaderboard(sortBy, true), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sortBy, fetchLeaderboard]);

  // Find my rank after data loads
  useEffect(() => {
    if (!myUsername || !entries.length) { setMyRank(null); return; }
    const idx = entries.findIndex(e => e.username.toLowerCase() === myUsername.toLowerCase());
    setMyRank(idx >= 0 ? idx + 1 : null);
  }, [entries, myUsername]);

  // Filtered entries for the table
  const filtered = entries.filter(e =>
    !search || e.username.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = entries.slice(0, 3);

  const getSortValue = (e: LeaderboardEntry) =>
    sortBy === 'prediction' ? e.predictionRating
    : sortBy === 'hottake'  ? e.hotTakeRating
    : e.overallRating;

  // ── Helper Row Renderer ──
  const renderRow = (entry: LeaderboardEntry, idx: number) => {
    const rarity = getRarityBand(entry.overallRating);
    const isMe = myUsername?.toLowerCase() === entry.username.toLowerCase();
    const sortVal = getSortValue(entry);

    return (
      <motion.div
        key={entry.username}
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ delay: Math.min(idx * 0.012, 0.25) }}
      >
        <Link
          href={`/u/${entry.username}`}
          className={`relative group grid grid-cols-[40px_1fr_60px] sm:grid-cols-[48px_1fr_60px_60px_60px_52px] gap-2 items-center
            px-4 py-3.5 transition-all hover:bg-white/[0.03] hover:shadow-[inset_0_0_12px_rgba(217,119,6,0.03)]
            ${isMe ? 'bg-[#D97706]/4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#D97706]' : ''}`}
        >
          {/* Rank */}
          <div className="text-center font-display font-black text-sm md:text-base">
            {entry.rank <= 3 ? (
              <span className={`text-sm md:text-base leading-none px-2 py-0.5 rounded bg-white/[0.03] border ${
                entry.rank === 1 ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' 
                : entry.rank === 2 ? 'text-slate-300 border-slate-300/20 bg-slate-300/5' 
                : 'text-amber-700 border-amber-700/20 bg-amber-700/5'
              }`}>{entry.rank}</span>
            ) : (
              <span className={entry.rank <= 10 ? 'text-[#D97706]' : 'text-gray-500'}>
                {entry.rank}
              </span>
            )}
          </div>

          {/* Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <Avatar style={entry.avatarStyle} seed={entry.avatarSeed} size={32} />
              {isMe && (
                <span className="absolute -top-0.5 -right-0.5 text-[6px] font-black uppercase bg-[#D97706] text-black rounded-full px-0.5 leading-tight">
                  ME
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 leading-none mb-1">
                <span className="font-display font-black text-sm md:text-base text-white uppercase truncate group-hover:text-[#D97706] transition-colors">
                  {entry.username}
                </span>
                {entry.role === 'ADMIN' && (
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 flex-shrink-0 animate-pulse" aria-label="Admin" />
                )}
                {entry.role === 'PREMIUM' && (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20 flex-shrink-0" aria-label="Premium" />
                )}
              </div>
              <div className="flex items-center gap-2 leading-none">
                {entry.favoriteNation && (
                  <span className="text-[10px] md:text-[11px] font-extrabold uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 shadow-sm">
                    {getCountryAbbreviation(entry.favoriteNation)}
                  </span>
                )}
                <span className="text-[10px] md:text-xs text-gray-500 truncate">
                  {entry.matchesPlayed} match{entry.matchesPlayed !== 1 ? 'es' : ''}
                </span>
                {entry.legendaryCards > 0 && (
                  <span className="text-[10px] md:text-xs text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>×{entry.legendaryCards}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="hidden sm:flex flex-col items-center gap-1.5">
            <span className={`font-display font-black text-sm md:text-base leading-none px-2.5 py-1 border rounded shadow-md ${getRatingBadgeStyle(entry.overallRating)}`}>
              {entry.overallRating}
            </span>
            <RatingBar value={entry.overallRating} colour="bg-gradient-to-r from-[#881337] to-[#D97706]" />
          </div>

          {/* Prediction Rating */}
          <div className="hidden sm:flex flex-col items-center gap-1.5">
            <span className="font-bold text-xs md:text-sm text-sky-400 px-2 py-0.5 rounded bg-sky-500/5 border border-sky-500/10">{entry.predictionRating}</span>
            <RatingBar value={entry.predictionRating} colour="bg-sky-500" />
          </div>

          {/* Hot Take Rating */}
          <div className="hidden sm:flex flex-col items-center gap-1.5">
            <span className="font-bold text-xs md:text-sm text-orange-400 px-2 py-0.5 rounded bg-orange-500/5 border border-orange-500/10">{entry.hotTakeRating}</span>
            <RatingBar value={entry.hotTakeRating} colour="bg-orange-500" />
          </div>

          {/* Cards */}
          <div className="hidden sm:flex flex-col items-center">
            <span className="font-bold text-xs md:text-sm text-gray-300 px-2 py-0.5 rounded bg-white/5 border border-white/5">{entry.cardsEarned}</span>
          </div>

          {/* Mobile Rating */}
          <div className="sm:hidden ml-auto text-right">
            <span className={`font-display font-black text-base md:text-lg ${rarity.colour}`}>
              {sortVal}
            </span>
            <p className={`text-[8px] font-black uppercase tracking-widest ${rarity.colour} opacity-60`}>
              {rarity.label.substring(0, 3)}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white pb-16 overflow-hidden pt-[68px] flex flex-col">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(217, 119, 6, 0.3);
        }
      `}</style>

      {/* ── Ambient background with Stadium Backdrop ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Image 
          src="/images/world_cup_stadium.webp" 
          alt="Stadium background"
          fill
          className="object-cover opacity-25 object-center scale-102 filter saturate-110 contrast-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#0A0A0A]/55 to-[#0A0A0A]" />
        
        {/* Glow effects - Football pitch lighting vibe */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] opacity-60" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#881337]/15 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-955/20 rounded-full blur-[150px] opacity-50" />
      </div>

      {/* ── Center Aligned Header ───────────────────────────────────── */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 pt-3 pb-3 flex flex-col items-center justify-center text-center w-full border-b border-white/5 bg-black/20 backdrop-blur-xs shrink-0">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider leading-none"
            style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)' }}>
          GLOBAL MANAGER <span className="text-[#D97706]">LEADERBOARD</span>
        </h1>
        <p className="text-gray-400 text-[10px] sm:text-[11px] mt-2.5 font-bold uppercase tracking-widest leading-none">
          WORLD CUP 2026 SEASON <span className="text-gray-600 mx-2">•</span> RANKED BY FOOTBALL IQ
        </p>
      </div>

      {/* ── Main Layout Connected Console (Unified Grid) ─────────────── */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 pt-3 pb-4 w-full">
        
        <div className="w-full bg-black/45 border border-white/5 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:h-[700px]">
          
          {/* ── Left Panel: Sidebar Deck (lg:col-span-3) ───────────────── */}
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/5 p-5 flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar">
            
            {/* Manager Profile card */}
            {myProfile && (
              <div className="relative bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#881337] to-[#D97706]" />
                <div className="relative mb-2">
                  <Avatar style={myProfile.avatarStyle} seed={myProfile.avatarSeed} size={52} />
                  <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    myProfile.role === 'ADMIN' ? 'bg-[#D97706] text-black' : myProfile.role === 'PREMIUM' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {myProfile.role}
                  </span>
                </div>
                <h3 className="font-display font-black text-sm md:text-base text-white uppercase mt-2.5 leading-none">
                  {myProfile.username}
                </h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">
                  Manager Status
                </p>
                
                <div className="grid grid-cols-2 gap-2.5 w-full mt-3.5 border-t border-white/5 pt-3 text-left">
                  <div>
                    <span className="block text-[8px] text-gray-500 uppercase tracking-widest font-black leading-none">Rank</span>
                    <span className="font-display font-black text-xs md:text-sm text-[#D97706] leading-none mt-1 block">
                      {myRank ? `#${myRank}` : 'Unranked'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-gray-500 uppercase tracking-widest font-black leading-none">Football IQ</span>
                    <span className="font-display font-black text-xs md:text-sm text-white leading-none mt-1 block">
                      {myProfile.overallRating}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-gray-500 uppercase tracking-widest font-black leading-none">Nation</span>
                    <span className="text-[10px] font-black uppercase text-gray-400 mt-1 block leading-none">
                      {myProfile.favoriteNation ? getCountryAbbreviation(myProfile.favoriteNation) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-gray-500 uppercase tracking-widest font-black leading-none">Club</span>
                    <span className="text-[10px] font-black uppercase text-gray-400 truncate mt-1 block leading-none max-w-[80px]" title={myProfile.favoriteClub}>
                      {myProfile.favoriteClub || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Sort Category */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-0.5">Sort Console</span>
              <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2">
                {SORT_TABS.map(tab => {
                  const Icon = tab.icon;
                  const active = sortBy === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSortBy(tab.id as SortMode)}
                      className={`w-full px-3 py-2.5 rounded-xl font-display font-black text-[10px] lg:text-[11px] uppercase tracking-widest text-left transition-all cursor-pointer flex items-center justify-center lg:justify-start gap-2 border ${
                        active
                          ? 'bg-gradient-to-r from-[#881337]/35 to-[#D97706]/20 border-[#D97706] text-white shadow-[0_0_20px_rgba(217,119,6,0.25)] scale-[1.01]'
                          : 'bg-black/35 border-white/5 text-gray-400 hover:text-white hover:border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#D97706]" /> 
                      <span className="hidden sm:inline lg:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Search input */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-0.5">Search Manager</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Manager name…"
                  className="w-full pl-9 pr-7 py-2.5 rounded-xl bg-black/35 border border-white/5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-[9px]"
                  >✕</button>
                )}
              </div>
            </div>

            {/* Section 4: Activity Console */}
            <div className="relative bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-xl p-4 text-center mt-auto overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Activity Console</p>
              <p className="text-gray-500 text-[10px] mt-1.5 leading-normal">
                Submit predictions and hot takes in the match console to raise your rank.
              </p>
              <Link
                href="/world-cup-hub"
                className="mt-3 block w-full py-2 rounded-lg bg-gradient-to-r from-[#881337] to-[#D97706] hover:opacity-90 text-white font-display font-black text-[10px] uppercase tracking-widest text-center transition-all shadow-md active:scale-98"
              >
                Enter World Cup Hub
              </Link>
            </div>
          </aside>

          {/* ── Middle Panel: Leaderboard Table (lg:col-span-6) ────────── */}
          <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col h-full overflow-hidden">
            
            {/* Header row (Sticky) */}
            <div className="bg-white/[0.01] border-b border-white/5 py-3 px-4 shrink-0">
              <div className="grid grid-cols-[40px_1fr_60px] sm:grid-cols-[48px_1fr_60px_60px_60px_52px] gap-2 items-center">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-black text-center">#</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-black text-left">Manager</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-black text-right sm:hidden">OVR</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-black text-center hidden sm:block">OVR</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-black text-center hidden sm:block">Pred</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-black text-center hidden sm:block">Takes</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-black text-center hidden sm:block">Cards</p>
              </div>
            </div>

            {/* List content (Independent Scroll with Lenis Prevent) */}
            <div className="flex-grow overflow-y-auto custom-scrollbar divide-y divide-white/5" data-lenis-prevent>
              {loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-4 h-full">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-[#D97706]/20 animate-ping" />
                    <div className="w-14 h-14 rounded-full border-2 border-t-[#D97706] border-[#881337]/20 animate-spin" />
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="text-center py-24 bg-black/25 flex flex-col justify-center items-center h-full gap-4">
                  <Shield className="w-12 h-12 text-[#881337]/50" />
                  <p className="font-display font-black text-xl uppercase text-gray-400">Tribunal Offline</p>
                  <button
                    onClick={() => fetchLeaderboard(sortBy)}
                    className="px-5 py-2.5 rounded-xl bg-[#881337]/80 hover:bg-[#881337] text-white text-sm font-bold transition-all"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && filtered.length > 0 && (
                <AnimatePresence mode="popLayout">
                  {filtered.map((entry, idx) => renderRow(entry, idx))}
                </AnimatePresence>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div className="text-center py-24 flex flex-col justify-center items-center h-full text-gray-500">
                  <Search className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-xs">No manager found for &quot;<span className="text-white">{search}</span>&quot;</p>
                </div>
              )}
            </div>

          </div>

          {/* ── Right Panel: Podium & Stats Showcase (lg:col-span-3) ───── */}
          <section className="lg:col-span-3 p-5 flex flex-col items-center gap-5 h-full overflow-y-auto custom-scrollbar">
            
            {/* Champions Podium Title */}
            <div className="w-full text-center pb-2 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Champions Podium</p>
            </div>

            {/* Stepped Podium */}
            {entries.length >= 3 && (
              <div className="flex items-end justify-center gap-2 pt-2 pb-4 border-b border-white/5 w-full">
                {PODIUM_CONFIG.map(cfg => {
                  const entry = top3[cfg.pos - 1];
                  if (!entry) return null;
                  return (
                    <PodiumCard
                      key={cfg.pos}
                      entry={entry}
                      config={cfg}
                      isMe={myUsername?.toLowerCase() === entry.username.toLowerCase()}
                    />
                  );
                })}
              </div>
            )}

            {/* Analytics/Summary Panel */}
            {!loading && !error && entries.length > 0 && (
              <div className="w-full pt-2 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 text-center">Leaderboard Stats</p>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 shadow-inner">
                    <span className="block text-[8px] text-gray-500 uppercase tracking-widest font-black leading-none">Active Managers</span>
                    <span className="font-display font-black text-sm text-white mt-1.5 block leading-none">{entries.length}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 shadow-inner">
                    <span className="block text-[8px] text-gray-500 uppercase tracking-widest font-black leading-none">Average IQ</span>
                    <span className="font-display font-black text-sm text-[#D97706] mt-1.5 block leading-none">
                      {entries.length ? Math.round(entries.reduce((acc, curr) => acc + curr.overallRating, 0) / entries.length) : 0}
                    </span>
                  </div>
                </div>
                
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 flex justify-between items-center px-3.5 shadow-md">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                    <span className="text-[9px] text-amber-400/80 uppercase tracking-wider font-extrabold">Legendary Status</span>
                  </div>
                  <span className="font-display font-black text-xs text-amber-400 leading-none">
                    {entries.filter(e => e.overallRating >= 90).length} / {entries.length}
                  </span>
                </div>
              </div>
            )}

          </section>

        </div>

      </div>
    </div>
  );
}
