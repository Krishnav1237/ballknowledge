'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import SportsCenterCard from '@/components/SportsCenterCard';
import { getStoredProfile, getStoredPredictions, FootballIQProfile } from '@/lib/profileSync';
import { Trophy, Award, Sparkles, Share2, Eye, ShieldAlert, Lock, Calendar, CheckCircle, ChevronRight, Bookmark } from 'lucide-react';

interface Team {
  id: string;
  name_en: string;
  flag: string;
  fifa_code: string;
  groups: string;
}

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  group: string;
  matchday: string;
  local_date: string;
  finished: string;
  time_elapsed: string;
  type: string;
}

const SYSTEM_DATE = new Date('2026-06-16T19:20:00');

function parseLocalDate(localDateStr: string): Date {
  const [datePart, timePart] = localDateStr.split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export default function FootballIQPage() {
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [userPreds, setUserPreds] = useState<any>({});
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const handleCopyLink = (platform: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  // Tournament data states
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedMatchday, setSelectedMatchday] = useState('1');
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [loadingMatches, setLoadingMatches] = useState(true);

  // 3D Tilt states
  const [pedestalTiltStyle, setPedestalTiltStyle] = useState({});
  const [miniCardTilts, setMiniCardTilts] = useState<Record<string, any>>({});

  useEffect(() => {
    setProfile(getStoredProfile());
    setUserPreds(getStoredPredictions());

    const fetchTournamentData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetch('https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.matches.json'),
          fetch('https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.teams.json')
        ]);

        if (matchesRes.ok && teamsRes.ok) {
          const [matchesData, teamsData] = await Promise.all([
            matchesRes.json(),
            teamsRes.json()
          ]);
          setMatches(matchesData);
          setTeams(teamsData);
        } else {
          throw new Error('Remote fetch failed');
        }
      } catch (err) {
        console.warn('Failed to fetch remote World Cup data, falling back to local files:', err);
        try {
          const matchesData = require('@/lib/worldcup2026/football.matches.json');
          const teamsData = require('@/lib/worldcup2026/football.teams.json');
          setMatches(matchesData);
          setTeams(teamsData);
        } catch (localErr) {
          console.error('Failed to load local data files:', localErr);
        }
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchTournamentData();
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-gray-500">Retrieving Football reputation card...</p>
      </div>
    );
  }

  // Get all resolved match cards in their deck
  const collectedCards = Object.values(userPreds)
    .filter((pred: any) => pred.resolved && pred.card)
    .map((pred: any) => pred.card);

  const totalMatches = collectedCards.length;
  
  // Calculate average score prediction accuracy
  const exactMatches = Object.values(userPreds).filter((pred: any) => {
    if (!pred.resolved || !pred.card) return false;
    return pred.card.charge.includes('Actual Result') && 
           pred.card.charge.split('Predicted Score: ')[1]?.split('.')[0] === 
           pred.card.charge.split('Actual Result: ')[1]?.split('.')[0];
  }).length;
  
  const accuracy = totalMatches > 0 ? Math.round((exactMatches / totalMatches) * 100) : 0;

  // Album completion progress details
  const totalAlbumSlots = matches.filter(m => m.type === 'group').length || 48;
  const albumProgressPercent = Math.round((totalMatches / totalAlbumSlots) * 100);

  // Rarity deck counts for inventory stats bar
  const legendaryCount = collectedCards.filter((c: any) => c.rarity === 'LEGENDARY').length;
  const epicCount = collectedCards.filter((c: any) => c.rarity === 'EPIC').length;
  const rareCount = collectedCards.filter((c: any) => c.rarity === 'RARE').length;
  const commonCount = collectedCards.filter((c: any) => c.rarity === 'COMMON').length;

  // Playstyle / Title mapping
  let playstyle = 'Rookie Fan';
  let badge = '🌍';
  if (profile.overallRating >= 85) {
    playstyle = 'VISIONARY PROPHET';
    badge = '🧠';
  } else if (profile.overallRating >= 70) {
    playstyle = 'ELITE MASTERMIND';
    badge = '🔥';
  } else if (profile.overallRating >= 45) {
    playstyle = 'DELUSION MERCHANT';
    badge = '⚖️';
  } else {
    playstyle = 'FOOTBALL TERRORIST';
    badge = '💀';
  }

  const getMatchStatus = (match: Match) => {
    const kickoff = parseLocalDate(match.local_date);
    const timeDiff = SYSTEM_DATE.getTime() - kickoff.getTime();
    if (timeDiff >= 2 * 60 * 60 * 1000) {
      return 'COMPLETED';
    } else if (timeDiff >= 0) {
      return 'LIVE';
    } else {
      return 'UPCOMING';
    }
  };

  // 3D Parallax Tilt Handlers for Pedestal
  const handlePedestalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = -(y / (box.height / 2)) * 12;
    const tiltY = (x / (box.width / 2)) * 12;
    setPedestalTiltStyle({
      transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.05s ease'
    });
  };

  const handlePedestalMouseLeave = () => {
    setPedestalTiltStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease'
    });
  };

  // 3D Parallax Tilt Handlers for Mini Cards in Slots
  const handleMiniMouseMove = (e: React.MouseEvent<HTMLDivElement>, matchId: string) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = -(y / (box.height / 2)) * 15;
    const tiltY = (x / (box.width / 2)) * 15;
    setMiniCardTilts(prev => ({
      ...prev,
      [matchId]: {
        transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`,
        zIndex: 10,
        transition: 'transform 0.05s ease'
      }
    }));
  };

  const handleMiniMouseLeave = (matchId: string) => {
    setMiniCardTilts(prev => ({
      ...prev,
      [matchId]: {
        transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        zIndex: 1,
        transition: 'transform 0.3s ease'
      }
    }));
  };

  // Copy share URLs
  const getShareUrl = (type: 'profile' | 'card', idStr?: string) => {
    if (typeof window === 'undefined') return '';
    return type === 'profile' 
      ? `${window.location.origin}/u/${profile.username}` 
      : `${window.location.origin}/card/${idStr}`;
  };

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(getShareUrl('profile'));
    setCopiedProfile(true);
    setTimeout(() => setCopiedProfile(false), 2000);
  };

  const handleCopyCard = () => {
    if (selectedCard) {
      navigator.clipboard.writeText(getShareUrl('card', selectedCard.id));
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    }
  };

  // Filter matches for active matchday
  const matchdayMatches = matches.filter(m => m.matchday === selectedMatchday && m.type === 'group');

  // Multi-tier filtering
  const filteredMatches = matchdayMatches.filter(match => {
    const userPred = userPreds[match.id];
    const status = getMatchStatus(match);

    if (filterRarity === 'ALL') return true;
    if (filterRarity === 'LOCKED') return userPred && !userPred.resolved;
    if (filterRarity === 'MISSED') return status === 'COMPLETED' && (!userPred || !userPred.resolved);
    
    // Rarity matches
    if (userPred?.resolved && userPred?.card) {
      return userPred.card.rarity === filterRarity;
    }
    return false;
  });

  // Helper to render a single card slot (larger fonts & modern styling)
  const renderCardSlot = (match: typeof matches[0]) => {
    const homeTeam = teams.find(t => t.id === match.home_team_id);
    const awayTeam = teams.find(t => t.id === match.away_team_id);
    if (!homeTeam || !awayTeam) return null;

    const userPred = userPreds[match.id];
    const status = getMatchStatus(match);

    // Case A: Card Unlocked / Claimed
    if (userPred?.resolved && userPred?.card) {
      const card = userPred.card;
      const miniThemeClass = {
        LEGENDARY: 'card-mini-toty',
        EPIC: 'card-mini-var',
        RARE: 'card-mini-gold',
        COMMON: 'card-mini-bottler'
      }[card.rarity as 'LEGENDARY'|'EPIC'|'RARE'|'COMMON'] || 'card-mini-bottler';

      const textGlow = {
        LEGENDARY: 'text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]',
        EPIC: 'text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]',
        RARE: 'text-amber-400',
        COMMON: 'text-gray-400'
      }[card.rarity as 'LEGENDARY'|'EPIC'|'RARE'|'COMMON'] || 'text-gray-400';

      return (
        <div
          key={card.id}
          onMouseMove={(e) => handleMiniMouseMove(e, match.id)}
          onMouseLeave={() => handleMiniMouseLeave(match.id)}
          style={miniCardTilts[match.id] || {}}
          onClick={() => setSelectedCard(card)}
          className={`card-mini-fut-slot ${miniThemeClass} card-3d-tilt cursor-pointer relative z-10 group filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]`}
        >
          <div className="holographic-sheen-mini" />
          <div className="card-mini-fut-inner">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center">
                <span className="font-card-fut font-bold text-xl sm:text-2.2xl leading-none text-white">
                  {card.rating}
                </span>
                <img src={homeTeam.flag} alt="" className="w-5 h-3.5 object-cover rounded shadow-xs mt-1 shrink-0 border border-white/5" />
              </div>
              <span className={`text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-black/60 border border-white/5 ${textGlow}`}>
                {card.rarity.slice(0, 3)}
              </span>
            </div>

            <div className="text-center my-auto">
              <p className="font-card-fut font-black text-[9.5px] sm:text-[10.5px] text-white tracking-tight uppercase leading-tight line-clamp-2 px-1 break-words">
                {card.verdict.split(' MERCHANT')[0].split(' PROPHET')[0].split(' MASTERMIND')[0]}
              </p>
            </div>

            <div className="border-t border-white/10 pt-1 flex justify-between items-center text-[7.5px] sm:text-[8.5px] font-bold text-gray-400 uppercase tracking-widest">
              <span>MD {selectedMatchday}</span>
              <span className="text-amber-400 group-hover:underline">OPEN</span>
            </div>
          </div>
        </div>
      );
    }

    // Case B: Prediction Locked
    if (userPred && !userPred.resolved) {
      return (
        <div
          key={match.id}
          className="card-mini-fut-slot card-mini-locked relative overflow-hidden"
        >
          <div className="card-mini-fut-inner">
            <div className="flex justify-between items-start">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-500 tracking-wider">LOCKED</span>
              <Lock className="w-3 h-3 text-amber-500 animate-pulse" />
            </div>

            <div className="text-center my-auto">
              <div className="flex gap-1.5 justify-center mb-1">
                <img src={homeTeam.flag} alt="" className="w-5.5 h-4 object-cover rounded shadow-xs border border-white/5" />
                <span className="text-[9.5px] font-black text-amber-500/60">VS</span>
                <img src={awayTeam.flag} alt="" className="w-5.5 h-4 object-cover rounded shadow-xs border border-white/5" />
              </div>
              <p className="text-[9.5px] sm:text-[10px] font-black text-amber-200/90 leading-tight">PRED LOCK</p>
              <p className="text-[9px] sm:text-[9.5px] font-mono font-bold text-amber-400 mt-0.5">
                {userPred.homeScore} - {userPred.awayScore}
              </p>
            </div>

            <div className="text-center text-[8px] sm:text-[9px] font-black text-amber-500/70 uppercase tracking-wide">
              Awaiting outcome
            </div>
          </div>
        </div>
      );
    }

    // Case C: Missed Fixture
    if (status === 'COMPLETED') {
      return (
        <div
          key={match.id}
          className="card-mini-fut-slot card-mini-missed group relative overflow-hidden"
        >
          <div className="card-mini-fut-inner">
            <div className="flex justify-between items-start opacity-40">
              <span className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-wider">SLOT {match.id}</span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-red-500">MISSED</span>
            </div>

            <div className="text-center my-auto flex flex-col items-center relative z-10">
              <div className="flex gap-1.5 grayscale opacity-30 mb-1">
                <img src={homeTeam.flag} alt="" className="w-5.5 h-4 object-cover rounded border border-white/5" />
                <img src={awayTeam.flag} alt="" className="w-5.5 h-4 object-cover rounded border border-white/5" />
              </div>
              <div className="stamp-expired-mini absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                EXPIRED
              </div>
            </div>

            <div className="text-center text-[8px] sm:text-[9px] font-black text-red-500/70 uppercase tracking-wide">
              Lost Opportunity
            </div>
          </div>
        </div>
      );
    }

    // Case D: Empty
    return (
      <div
        key={match.id}
        className="card-mini-fut-slot card-mini-empty group relative overflow-hidden"
      >
        <div className="card-mini-fut-inner">
          <div className="flex justify-between items-start">
            <span className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-wider">SLOT {match.id}</span>
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-gray-400">EMPTY</span>
          </div>

          <div className="text-center my-auto flex flex-col items-center">
            <div className="flex gap-1.5 mb-1">
              <img src={homeTeam.flag} alt="" className="w-5.5 h-4 object-cover rounded shadow-xs border border-white/5" />
              <img src={awayTeam.flag} alt="" className="w-5.5 h-4 object-cover rounded shadow-xs border border-white/5" />
            </div>
            <p className="text-[9.5px] sm:text-[10px] font-bold text-gray-300 truncate w-full max-w-[95px]">{homeTeam.fifa_code} vs {awayTeam.fifa_code}</p>
          </div>

          <Link 
            href={`/match/${match.id}`} 
            className="text-center py-1 rounded bg-amber-500/10 hover:bg-amber-500/25 text-[8.5px] sm:text-[9.5px] font-black text-amber-500 hover:text-white transition-all uppercase tracking-widest border border-amber-500/20 relative z-30"
          >
            CHALLENGE
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-foreground pb-20 overflow-hidden">
      <Navbar />

      {/* Immersive Game-style Stadium Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/game_stadium_showcase.webp" 
          alt="World Cup Stadium background" 
          fill 
          className="object-cover opacity-65 object-center" 
          priority 
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#030712]/50 to-[#030712]" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-8">
        
        {/* Centered Heading (Hanging HUD Panel) */}
        <div className="pt-[70px] pb-3 px-10 flex flex-col items-center text-center max-w-md mx-auto rounded-b-3xl border-x border-b border-white/10 bg-gradient-to-b from-black/80 via-black/55 to-black/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.85)] relative z-20">
          <h1 className="font-display font-black text-xl sm:text-2.2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500 uppercase tracking-widest leading-none drop-shadow-[0_2px_10px_rgba(217,119,6,0.25)]">
            Collectibles Binder
          </h1>
        </div>

        {/* ────────────────────────────────────────────────────────────────── */}
        {/* LEATHER BINDER SYSTEM                                             */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <div className="mt-6 relative">
          
          {/* Protruding binder Divider Tabs */}
          <div className="binder-tabs-container">
            {[
              { id: '1', label: 'MD 1', bg: 'bg-[#881337]/90 text-rose-100 hover:bg-[#881337]' },
              { id: '2', label: 'MD 2', bg: 'bg-[#D97706]/90 text-amber-100 hover:bg-[#D97706]' },
              { id: '3', label: 'MD 3', bg: 'bg-[#059669]/90 text-emerald-100 hover:bg-[#059669]' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedMatchday(tab.id);
                  setSelectedCard(null);
                }}
                className={`binder-index-tab cursor-pointer text-center font-black ${tab.bg} ${
                  selectedMatchday === tab.id 
                    ? 'scale-x-[1.25] shadow-2xl border-l border-white/25 z-10' 
                    : 'opacity-70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Leather Binder body */}
          <div className="binder-container p-2 sm:p-3.5">
            <div className="binder-stitching" />

            {/* Content split grid (Double page display) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 relative z-10">
              
              {/* ──────────────────────────────────────────────────────── */}
              {/* LEFT PAGE: ALBUM SLOTS GRID                               */}
              {/* ──────────────────────────────────────────────────────── */}
              {/* LEFT PAGE: ALBUM SLOTS GRID                               */}
              {/* ──────────────────────────────────────────────────────── */}
              <div className="lg:col-span-7 binder-page-left p-3.5 sm:p-4.5 flex flex-col gap-3 border border-white/5 bg-black/55">
                
                {/* Album Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-2 gap-2">
                  <div>
                    <h2 className="font-display font-black text-base text-white uppercase tracking-wider">
                      Matchday {selectedMatchday} — Sticker Slots
                    </h2>
                    <div className="flex gap-2.5 mt-1 text-[8.5px] font-black uppercase text-gray-500">
                      <span className="text-amber-500">🏆 {legendaryCount} LEG</span>
                      <span className="text-rose-500">🔥 {epicCount} EPC</span>
                      <span className="text-blue-400">⚡ {rareCount} RRE</span>
                      <span className="text-gray-400">🪙 {commonCount} CMN</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedCard(null);
                      setFilterRarity('ALL');
                    }}
                    className="px-3 py-1.5 text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/25 rounded-md uppercase tracking-wider hover:bg-amber-500/20 transition-all cursor-pointer shrink-0"
                  >
                    Reset Slots
                  </button>
                </div>

                {/* Compact Stats Row */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 rounded-xl p-2.5 shadow-inner">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8.5px] font-black text-gray-500 uppercase tracking-widest">
                      <span>Progress</span>
                      <span className="font-mono text-white font-bold">{totalMatches}/{totalAlbumSlots}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700" style={{ width: `${albumProgressPercent}%` }} />
                      </div>
                      <span className="font-mono text-[9px] font-black text-amber-400 shrink-0">{albumProgressPercent}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8.5px] font-black text-gray-500 uppercase tracking-widest">
                      <span>Accuracy</span>
                      <span className="font-mono text-white font-bold">{accuracy}% exact</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-700" style={{ width: `${accuracy}%` }} />
                      </div>
                      <span className="font-mono text-[9px] font-black text-rose-400 shrink-0">EXACT</span>
                    </div>
                  </div>
                </div>

                {/* Album Slot Filters */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'LEGENDARY', label: 'Legendary' },
                    { id: 'EPIC', label: 'Epic' },
                    { id: 'RARE', label: 'Rare' },
                    { id: 'COMMON', label: 'Common' },
                    { id: 'LOCKED', label: 'Locked' },
                    { id: 'MISSED', label: 'Missed' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilterRarity(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                        filterRarity === f.id
                          ? 'bg-[#881337]/15 border-[#881337] text-rose-300 shadow-sm'
                          : 'bg-black/30 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Slots Grid */}
                <div className="flex-1 overflow-y-auto">
                  {loadingMatches ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-3" />
                      <p className="text-xs text-gray-500 font-semibold uppercase">Consulting database...</p>
                    </div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-black/10">
                      <ShieldAlert className="w-8 h-8 text-gray-600 mb-2.5" />
                      <p className="font-display font-black text-xs text-gray-500 uppercase tracking-widest">No matching slots on page</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {filteredMatches.map(match => renderCardSlot(match))}
                    </div>
                  )}
                </div>

                {/* Footer notes */}
                <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>Matchday {selectedMatchday} group stage</span>
                  <span>VAR Album v1.02</span>
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────── */}
              {/* RIGHT PAGE: THE STICKY PEDESTAL SHOWCASE & SHARE INTENTS  */}
              {/* ──────────────────────────────────────────────────────── */}
              <div className="lg:col-span-5 p-3.5 sm:p-4.5 border border-white/5 bg-black/55 rounded-2xl flex flex-col justify-between lg:sticky lg:top-[95px] lg:h-[calc(100vh-185px)] overflow-hidden">
                
                {/* Spotlight glowing effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[160px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-xl rounded-full pointer-events-none" />

                {/* Pedestal and Card display side-by-side with vertical Share dock */}
                <div className="flex flex-row items-center justify-center gap-3 sm:gap-4.5 w-full relative">
                  
                  {/* Rotating platform base (Scaled to fit screen perfectly) */}
                  <div className="relative flex justify-center items-center py-1">
                    
                    {/* Glowing Aura Ring */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[400px] rounded-full blur-[85px] pointer-events-none -z-10 opacity-70 bg-gradient-to-tr from-[#881337]/35 via-transparent to-[#D97706]/35" />
                    
                    {/* Metal pedestal base glow */}
                    <div className="absolute bottom-1 w-60 h-2.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent blur-md rounded-full pointer-events-none" />

                    {/* Bounding box wrapper with exact layout size of the scaled card */}
                    <div className="relative flex items-center justify-center h-[360px] w-[255px] sm:h-[384px] sm:w-[272px] md:h-[408px] md:w-[289px] lg:h-[396px] lg:w-[280px] xl:h-[420px] xl:w-[297px] shrink-0">
                      {/* 3D tilt frame wrapper */}
                      <div 
                        onMouseMove={handlePedestalMouseMove}
                        onMouseLeave={handlePedestalMouseLeave}
                        style={pedestalTiltStyle}
                        className="absolute card-3d-tilt transform origin-center scale-[0.75] sm:scale-[0.80] md:scale-[0.85] lg:scale-[0.85] xl:scale-[0.90]"
                      >
                        {selectedCard ? (
                          <SportsCenterCard data={{
                            text: selectedCard.evidence.replace('Hot Take statement: "', '').replace('" (VAR grading:', ''),
                            mode: 'take',
                            caseId: 2026,
                            fanbase: null,
                            isRivalry: false,
                            rarity: selectedCard.rarity,
                            ovr: selectedCard.rating,
                            rulingText: selectedCard.verdict,
                            verdict: selectedCard.verdict,
                            charge: selectedCard.charge,
                            sentence: selectedCard.sentence,
                            ach: { title: 'Reputation', desc: 'Graded Sticker', badge: '🔥' },
                            stats: [
                              { label: 'IQ', name: 'Ball IQ', val: selectedCard.rating },
                              { label: 'DEL', name: 'Delusion', val: 100 - selectedCard.rating }
                            ],
                            cardTheme: selectedCard.cardTheme || 'gold',
                            countryFlag: profile.favoriteNation === 'Argentina' ? '🇦🇷' : '🌍',
                            playerName: profile.username,
                            playerPosition: selectedCard.rating >= 75 ? 'CF' : 'DM'
                          }} />
                        ) : (
                          <SportsCenterCard data={{
                            text: `Loyal supporter of ${profile.favoriteClub || 'VAR FC'}. Fighting for tactical ball knowledge in the 2026 tournament.`,
                            mode: 'take',
                            caseId: 1000,
                            fanbase: null,
                            isRivalry: false,
                            rarity: profile.overallRating >= 85 ? 'LEGENDARY' : (profile.overallRating >= 70 ? 'EPIC' : (profile.overallRating >= 45 ? 'RARE' : 'COMMON')),
                            ovr: profile.overallRating,
                            rulingText: playstyle,
                            verdict: playstyle,
                            charge: `ACCURACY: ${accuracy}% OVER MATCHDAYS`,
                            sentence: `Total Matches Predicted: ${totalMatches} Resolved`,
                            ach: { title: 'Reputation', desc: 'Active Profile', badge },
                            stats: [
                              { label: 'IQ', name: 'Ball IQ', val: profile.overallRating },
                              { label: 'DEL', name: 'Delusion', val: 100 - profile.overallRating }
                            ],
                            cardTheme: profile.overallRating >= 85 ? 'toty' : (profile.overallRating >= 70 ? 'gold' : (profile.overallRating >= 45 ? 'var' : 'bottler')),
                            countryFlag: profile.favoriteNation === 'Argentina' ? '🇦🇷' : '🌍',
                            playerName: profile.username,
                            playerPosition: profile.overallRating >= 75 ? 'CF' : 'DM'
                          }} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vertical Branded Social Share Dock (Placed to the Right of the Card) */}
                  <div className="flex flex-col items-center gap-2 p-2 rounded-2xl border border-white/5 bg-black/45 shadow-2xl backdrop-blur-md shrink-0 relative z-30">
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest select-none pb-0.5">
                      <Share2 className="w-3 h-3 text-gray-500" />
                    </span>
                    
                    {/* Copy notification overlay */}
                    {(selectedCard ? copiedCard : copiedProfile) && (
                      <div className="absolute top-1/2 left-[-90px] -translate-y-1/2 px-2.5 py-1 bg-green-500 text-black text-[9px] font-black uppercase rounded shadow-lg animate-bounce z-40">
                        Copied!
                      </div>
                    )}

                    {/* Branded social buttons dock */}
                    <div className="flex flex-col items-center gap-2">
                      {/* X/Twitter Share */}
                    <a
                      href={selectedCard ? (
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `My prediction for World Cup Match ${selectedCard.matchId} graded at ${selectedCard.rating} OVR! VAR Verdict: ${selectedCard.verdict.toUpperCase()}. Beat my Football IQ:`
                        )}&url=${encodeURIComponent(getShareUrl('card', selectedCard.id))}`
                      ) : (
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `My Football IQ is ${profile.overallRating} OVR (${playstyle}) on the World Cup 2026 VAR Tribunal! Inspect my card binder:`
                        )}&url=${encodeURIComponent(getShareUrl('profile'))}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-share-btn social-share-btn-sm social-btn-x"
                      title="Share on X"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>

                    {/* WhatsApp Share */}
                    <a
                      href={selectedCard ? (
                        `https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `My prediction for World Cup Match ${selectedCard.matchId} graded at ${selectedCard.rating} OVR! VAR Verdict: ${selectedCard.verdict.toUpperCase()}. Beat my Football IQ: ${getShareUrl('card', selectedCard.id)}`
                        )}`
                      ) : (
                        `https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `My Football IQ is ${profile.overallRating} OVR (${playstyle}) on the World Cup 2026 VAR Tribunal! Inspect my card binder: ${getShareUrl('profile')}`
                        )}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-share-btn social-share-btn-sm social-btn-wa"
                      title="Share on WhatsApp"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.79-4.396c1.598.947 3.51 1.448 5.466 1.449 5.518 0 10.006-4.486 10.01-10.001.002-2.673-1.039-5.184-2.929-7.076-1.89-1.89-4.4-2.93-7.08-2.932-5.521 0-10.007 4.486-10.012 10.002-.002 1.897.486 3.754 1.412 5.37L2.836 21.3l4.01-.105z"/></svg>
                    </a>

                    {/* Telegram Share */}
                    <a
                      href={selectedCard ? (
                        `https://t.me/share/url?url=${encodeURIComponent(getShareUrl('card', selectedCard.id))}&text=${encodeURIComponent(
                          `My prediction for World Cup Match ${selectedCard.matchId} graded at ${selectedCard.rating} OVR! VAR Verdict: ${selectedCard.verdict.toUpperCase()}. Beat my Football IQ:`
                        )}`
                      ) : (
                        `https://t.me/share/url?url=${encodeURIComponent(getShareUrl('profile'))}&text=${encodeURIComponent(
                          `My Football IQ is ${profile.overallRating} OVR (${playstyle}) on the World Cup 2026 VAR Tribunal! Inspect my card binder:`
                        )}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-share-btn social-share-btn-sm social-btn-tg"
                      title="Share on Telegram"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.393c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.87 4.326-2.96-.924c-.643-.204-.658-.643.136-.953l11.57-4.46c.538-.196 1.006.128.832.941z"/></svg>
                    </a>

                    {/* Reddit Share */}
                    <a
                      href={selectedCard ? (
                        `https://www.reddit.com/submit?title=${encodeURIComponent(
                          `My prediction for World Cup Match ${selectedCard.matchId} graded at ${selectedCard.rating} OVR! VAR Verdict: ${selectedCard.verdict.toUpperCase()}. Beat my Football IQ:`
                        )}&url=${encodeURIComponent(getShareUrl('card', selectedCard.id))}`
                      ) : (
                        `https://www.reddit.com/submit?title=${encodeURIComponent(
                          `My Football IQ is ${profile.overallRating} OVR (${playstyle}) on the World Cup 2026 VAR Tribunal! Inspect my card binder:`
                        )}&url=${encodeURIComponent(getShareUrl('profile'))}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-share-btn social-share-btn-sm social-btn-reddit"
                      title="Share on Reddit"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.09-3.43 3.58.77c.06 1.05.94 1.88 2.02 1.88 1.1 0 2-1 2-2s-1-2-2-2c-.93 0-1.7.63-1.92 1.48l-3.88-.83c-.35-.08-.71.15-.79.5l-1.37 4.3c-2.49.04-4.75.68-6.42 1.7-.56-.75-1.45-1.22-2.41-1.22-1.65 0-3 1.35-3 3 0 1.25.77 2.32 1.86 2.77-.05.25-.08.5-.08.76 0 3.86 4.49 7 10 7s10-3.14 10-7c0-.26-.03-.51-.08-.76 1.09-.45 1.86-1.52 1.86-2.77zM6 14.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm10.74 3.7c-1.35 1.35-3.89 1.48-4.74 1.48-.85 0-3.39-.13-4.74-1.48-.3-.3-.3-.79 0-1.09.3-.3.79-.3 1.09 0 1 .1 2.87.23 3.65.23.78 0 2.65-.13 3.65-.23.3-.3.79-.3 1.09 0 .3.3.3.79 0 1.09zM16 16.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                    </a>

                    {/* Instagram Share */}
                    <button
                      onClick={() => handleCopyLink('instagram', selectedCard ? getShareUrl('card', selectedCard.id) : getShareUrl('profile'))}
                      className="social-share-btn social-share-btn-sm social-btn-ig cursor-pointer"
                      title="Copy & Share on Instagram"
                    >
                      {copiedPlatform === 'instagram' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      )}
                    </button>

                    {/* Discord Share */}
                    <button
                      onClick={() => handleCopyLink('discord', selectedCard ? getShareUrl('card', selectedCard.id) : getShareUrl('profile'))}
                      className="social-share-btn social-share-btn-sm social-btn-discord cursor-pointer"
                      title="Copy & Share on Discord"
                    >
                      {copiedPlatform === 'discord' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 01-1.873-.894.077.077 0 01-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 01.077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 01.078.009c.12.099.246.195.373.289a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/></svg>
                      )}
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopyLink('copy', selectedCard ? getShareUrl('card', selectedCard.id) : getShareUrl('profile'))}
                      className="social-share-btn social-share-btn-sm social-btn-copy cursor-pointer"
                      title="Copy URL"
                    >
                      {(selectedCard ? copiedCard : copiedProfile) ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
        
      </div>
    </div>
    </div>
  );
}
