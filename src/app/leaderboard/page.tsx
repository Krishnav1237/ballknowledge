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
  if (ovr >= 90) return { label: 'LEGENDARY', colour: 'text-[#E11D48]', border: 'border-[#E11D48]/40', bg: 'bg-[#E11D48]/8' };
  if (ovr >= 75) return { label: 'EPIC',      colour: 'text-purple-600', border: 'border-purple-600/30', bg: 'bg-purple-600/8' };
  if (ovr >= 60) return { label: 'RARE',      colour: 'text-blue-400',   border: 'border-blue-600/30',   bg: 'bg-blue-600/8'  };
  return                { label: 'COMMON',    colour: 'text-zinc-400',   border: 'border-white/5',      bg: 'bg-white/5'      };
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
  if (ovr >= 90) return 'bg-[#E11D48]/10 border-[#E11D48]/20 text-[#E11D48]';
  if (ovr >= 75) return 'bg-purple-500/10 border-purple-500/20 text-purple-600';
  if (ovr >= 60) return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
  return 'bg-white/5 border-white/10 text-gray-400';
};

const PODIUM_CONFIG = [
  { 
    pos: 1, 
    size: 'h-14', 
    order: 'order-2', 
    crown: 'text-[#E11D48]', 
    glow: 'shadow-rose-500/20', 
    ring: 'ring-[#E11D48]/50', 
    label: '1ST',
    colorClass: 'from-[#E11D48]/15 via-[#E11D48]/5 to-transparent border-t border-t-[#E11D48]/30 border-x border-b border-white/10'
  },
  { 
    pos: 2, 
    size: 'h-10', 
    order: 'order-1', 
    crown: 'text-zinc-500', 
    glow: 'shadow-zinc-400/15', 
    ring: 'ring-zinc-400/40', 
    label: '2ND',
    colorClass: 'from-white/10 via-white/5 to-transparent border-t border-t-white/20 border-x border-b border-white/10'
  },
  { 
    pos: 3, 
    size: 'h-7', 
    order: 'order-3', 
    crown: 'text-[#881337]', 
    glow: 'shadow-[#881337]/15', 
    ring: 'ring-[#881337]/40', 
    label: '3RD',
    colorClass: 'from-[#881337]/15 via-[#881337]/5 to-transparent border-t border-t-[#881337]/35 border-x border-b border-white/10'
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function RatingBar({ value, colour }: { value: number; colour: string }) {
  return (
    <div className="relative h-1 w-12 rounded-full bg-white/10 overflow-hidden mx-auto">
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
      <div className={`relative ring-2 ${config.ring} rounded-full p-0.5 shadow-md ${config.glow} ${isMe ? 'ring-[#E11D48]' : ''}`}>
        <Avatar style={entry.avatarStyle} seed={entry.avatarSeed} size={config.pos === 1 ? 38 : 30} />
        {isMe && (
          <span className="absolute -top-1 -right-1 text-[6px] font-black uppercase tracking-wider bg-[#E11D48] text-white rounded-full px-1.5 py-0.2 leading-none">
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
        <p className={`text-[7px] font-black uppercase tracking-widest ${rarity.colour} opacity-80 leading-none mt-0.5`}>
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
            px-4 py-3.5 transition-all hover:bg-white/5 border-b border-white/5
            ${isMe ? 'bg-rose-950/20 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#E11D48]' : ''}`}
        >
          {/* Rank */}
          <div className="text-center font-display font-black text-sm md:text-base">
            {entry.rank <= 3 ? (
              <span className={`text-sm md:text-base leading-none px-2 py-0.5 rounded border ${
                entry.rank === 1 ? 'text-[#E11D48] border-[#E11D48]/20 bg-[#E11D48]/5' 
                : entry.rank === 2 ? 'text-zinc-400 border-white/10 bg-white/5' 
                : 'text-[#881337] border-[#881337]/20 bg-[#881337]/5'
              }`}>{entry.rank}</span>
            ) : (
              <span className={entry.rank <= 10 ? 'text-[#E11D48]' : 'text-zinc-400'}>
                {entry.rank}
              </span>
            )}
          </div>

          {/* Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <Avatar style={entry.avatarStyle} seed={entry.avatarSeed} size={32} />
              {isMe && (
                <span className="absolute -top-0.5 -right-0.5 text-[6px] font-black uppercase bg-[#E11D48] text-white rounded-full px-0.5 leading-tight">
                  ME
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 leading-none mb-1">
                <span className="font-display font-black text-sm md:text-base text-white uppercase truncate group-hover:text-[#E11D48] transition-colors">
                  {entry.username}
                </span>
                {entry.role === 'ADMIN' && (
                  <Crown className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48]/10 flex-shrink-0 animate-pulse" aria-label="Admin" />
                )}
                {entry.role === 'PREMIUM' && (
                  <Sparkles className="w-3.5 h-3.5 text-purple-500 fill-purple-500/10 flex-shrink-0" aria-label="Premium" />
                )}
              </div>
              <div className="flex items-center gap-2 leading-none">
                {entry.favoriteNation && (
                  <span className="text-[10px] md:text-[11px] font-extrabold uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 shadow-xs">
                    {getCountryAbbreviation(entry.favoriteNation)}
                  </span>
                )}
                <span className="text-[10px] md:text-xs text-zinc-400 truncate">
                  {entry.matchesPlayed} match{entry.matchesPlayed !== 1 ? 'es' : ''}
                </span>
                {entry.legendaryCards > 0 && (
                  <span className="text-[10px] md:text-xs text-[#E11D48] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#E11D48] fill-[#E11D48]" />
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
            <RatingBar value={entry.overallRating} colour="bg-gradient-to-r from-[#881337] to-[#E11D48]" />
          </div>

          {/* Prediction Rating */}
          <div className="hidden sm:flex flex-col items-center gap-1.5">
            <span className="font-bold text-xs md:text-sm text-sky-400 px-2 py-0.5 rounded bg-sky-950/20 border border-sky-900/30">{entry.predictionRating}</span>
            <RatingBar value={entry.predictionRating} colour="bg-sky-500" />
          </div>

          {/* Hot Take Rating */}
          <div className="hidden sm:flex flex-col items-center gap-1.5">
            <span className="font-bold text-xs md:text-sm text-[#E11D48] px-2 py-0.5 rounded bg-rose-950/20 border border-rose-900/30">{entry.hotTakeRating}</span>
            <RatingBar value={entry.hotTakeRating} colour="bg-rose-500" />
          </div>

          {/* Cards */}
          <div className="hidden sm:flex flex-col items-center">
            <span className="font-bold text-xs md:text-sm text-white px-2 py-0.5 rounded bg-white/5 border border-white/10">{entry.cardsEarned}</span>
          </div>

          {/* Mobile Rating */}
          <div className="sm:hidden ml-auto text-right">
            <span className={`font-display font-black text-base md:text-lg ${rarity.colour}`}>
              {sortVal}
            </span>
            <p className={`text-[8px] font-black uppercase tracking-widest ${rarity.colour} opacity-80`}>
              {rarity.label.substring(0, 3)}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-16 overflow-hidden pt-[52px] flex flex-col">
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
          background: rgba(225, 29, 72, 0.3);
        }
      `}</style>

      {/* ── Ambient background with Stadium Backdrop ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Image 
          src="/images/world_cup_stadium.webp" 
          alt="Stadium background"
          fill
          className="object-cover opacity-[0.66] object-center scale-102 filter saturate-100 contrast-100"
          preload
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-background/35 to-background" />
        
        {/* Glow effects - Football pitch lighting vibe */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] opacity-40" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-rose-500/5 rounded-full blur-[120px] opacity-40" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#881337]/5 rounded-full blur-3xl opacity-40" />
      </div>

      {/* ── Main Layout Connected Console (Unified Grid) ─────────────── */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 pt-1 pb-4 w-full flex-grow flex flex-col min-h-0">
        
        <div className="w-full bg-[#0B0F19]/85 border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col flex-grow min-h-0">
          
          {/* ── Unified Header Panel ── */}
          <div className="shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xs p-4 flex flex-col items-center justify-center text-center w-full">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider leading-none">
              GLOBAL MANAGER <span className="text-[#E11D48]">LEADERBOARD</span>
            </h1>
            <p className="text-zinc-400 text-[9px] sm:text-[10px] mt-1.5 font-bold uppercase tracking-widest leading-none">
              WORLD CUP 2026 SEASON <span className="text-zinc-500 mx-2">•</span> RANKED BY FOOTBALL IQ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[650px] flex-grow min-h-0">
            {/* ── Left Panel: Sidebar Deck (lg:col-span-3) ───────────────── */}
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/10 p-5 flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar bg-black/10">
            
            {/* Manager Profile card */}
            {myProfile && (
              <div className="relative bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#881337] to-[#E11D48]" />
                <div className="relative mb-2">
                  <Avatar style={myProfile.avatarStyle} seed={myProfile.avatarSeed} size={52} />
                  <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    myProfile.role === 'ADMIN' ? 'bg-[#E11D48] text-white' : myProfile.role === 'PREMIUM' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {myProfile.role}
                  </span>
                </div>
                <h3 className="font-display font-black text-sm md:text-base text-white uppercase mt-2.5 leading-none">
                  {myProfile.username}
                </h3>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1.5">
                  Manager Status
                </p>
                
                <div className="grid grid-cols-3 gap-2 w-full mt-3.5 border-t border-white/5 pt-3 text-left">
                  <div>
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-widest font-black leading-none">Rank</span>
                    <span className="font-display font-black text-xs md:text-sm text-[#E11D48] leading-none mt-1 block">
                      {myRank ? `#${myRank}` : 'Unranked'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-widest font-black leading-none">Football IQ</span>
                    <span className="font-display font-black text-xs md:text-sm text-white leading-none mt-1 block">
                      {myProfile.overallRating}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-widest font-black leading-none">Nation</span>
                    <span className="text-[10px] font-black uppercase text-gray-400 mt-1 block leading-none truncate max-w-[56px]" title={myProfile.favoriteNation || 'N/A'}>
                      {myProfile.favoriteNation ? getCountryAbbreviation(myProfile.favoriteNation) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Sort Category */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-0.5">Sort Console</span>
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
                          ? 'bg-gradient-to-r from-[#881337]/5 to-[#E11D48]/10 border-[#E11D48] text-[#E11D48] shadow-sm scale-[1.01]'
                          : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:border-white/15 hover:bg-black/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#E11D48]' : 'text-zinc-400'}`} /> 
                      <span className="hidden sm:inline lg:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Search input */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-0.5">Search Manager</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Manager name…"
                  className="w-full pl-9 pr-7 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors text-[9px]"
                  >✕</button>
                )}
              </div>
            </div>

            {/* Section 4: Activity Console */}
            <div className="relative bg-gradient-to-b from-black/40 to-transparent border border-white/5 rounded-xl p-4 text-center mt-auto overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Activity Console</p>
              <p className="text-zinc-400 text-[10px] mt-1.5 leading-normal">
                Submit predictions and hot takes in the match console to raise your rank.
              </p>
              <Link
                href="/world-cup-hub"
                className="mt-3 block w-full py-2 rounded-lg bg-gradient-to-r from-[#881337] to-[#E11D48] hover:opacity-90 text-white font-display font-black text-[10px] uppercase tracking-widest text-center transition-all shadow-md active:scale-98"
              >
                Enter World Cup Hub
              </Link>
            </div>
          </aside>

          {/* ── Middle Panel: Leaderboard Table (lg:col-span-6) ────────── */}
          <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col h-full overflow-hidden">
            
            {/* Header row (Sticky) */}
            <div className="bg-black/20 border-b border-white/5 py-3 px-4 shrink-0">
              <div className="grid grid-cols-[40px_1fr_60px] sm:grid-cols-[48px_1fr_60px_60px_60px_52px] gap-2 items-center">
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-black text-center">#</p>
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-black text-left">Manager</p>
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-black text-right sm:hidden">OVR</p>
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-black text-center hidden sm:block">OVR</p>
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-black text-center hidden sm:block">Pred</p>
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-black text-center hidden sm:block">Takes</p>
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-black text-center hidden sm:block">Cards</p>
              </div>
            </div>

            {/* List content (Independent Scroll with Lenis Prevent) */}
            <div className="flex-grow overflow-y-auto custom-scrollbar divide-y divide-zinc-100" data-lenis-prevent>
              {loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-4 h-full">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-[#E11D48]/20 animate-ping" />
                    <div className="w-14 h-14 rounded-full border-2 border-t-[#E11D48] border-[#881337]/20 animate-spin" />
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="text-center py-24 bg-black/20 flex flex-col justify-center items-center h-full gap-4">
                  <Shield className="w-12 h-12 text-[#881337]/30" />
                  <p className="font-display font-black text-xl uppercase text-zinc-400">Tribunal Offline</p>
                  <button
                    onClick={() => fetchLeaderboard(sortBy)}
                    className="px-5 py-2.5 rounded-xl bg-[#881337] hover:bg-[#881337]/90 text-white text-sm font-bold transition-all"
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
                <div className="text-center py-24 flex flex-col justify-center items-center h-full text-zinc-400">
                  <Search className="w-6 h-6 text-zinc-500 mb-2" />
                  <p className="text-xs">No manager found for &quot;<span className="text-white font-semibold">{search}</span>&quot;</p>
                </div>
              )}
            </div>

          </div>

          {/* ── Right Panel: Podium & Stats Showcase (lg:col-span-3) ───── */}
          <section className="lg:col-span-3 p-5 flex flex-col items-center gap-5 h-full overflow-y-auto custom-scrollbar bg-black/15">
            
            {/* Champions Podium Title */}
            <div className="w-full text-center pb-2 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Champions Podium</p>
            </div>

            {/* Stepped Podium */}
            {entries.length >= 3 && (
              <div className="flex items-end justify-center gap-2 pt-2 pb-4 border-b border-white/10 w-full">
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
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 text-center">Leaderboard Stats</p>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 shadow-md">
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-widest font-black leading-none">Active Managers</span>
                    <span className="font-display font-black text-sm text-white mt-1.5 block leading-none">{entries.length}</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 shadow-md">
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-widest font-black leading-none">Average IQ</span>
                    <span className="font-display font-black text-sm text-[#E11D48] mt-1.5 block leading-none">
                      {entries.length ? Math.round(entries.reduce((acc, curr) => acc + curr.overallRating, 0) / entries.length) : 0}
                    </span>
                  </div>
                </div>
                
                <div className="bg-rose-950/25 border border-rose-900/35 rounded-lg p-2.5 flex justify-between items-center px-3.5 shadow-md">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48] animate-pulse" />
                    <span className="text-[9px] text-[#E11D48]/80 uppercase tracking-wider font-extrabold">Legendary Status</span>
                  </div>
                  <span className="font-display font-black text-xs text-[#E11D48] leading-none">
                    {entries.filter(e => e.overallRating >= 90).length} / {entries.length}
                  </span>
                </div>
              </div>
            )}

          </section>

          </div> {/* Closes grid */}
        </div> {/* Closes unified container */}

      </div>
    </div>
  );
}
