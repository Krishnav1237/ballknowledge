'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SportsCenterCard from '@/components/SportsCenterCard';
import { Award, ShieldAlert, Trophy, Eye, Lock, Sparkles, Share2, CheckCircle } from 'lucide-react';
import { getFlagEmoji, parseLocalDate } from '@/lib/matchUtils';
import matchesDataFallback from '@/lib/worldcup2026/football.matches.json';
import teamsDataFallback from '@/lib/worldcup2026/football.teams.json';

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



export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Tournament data states
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedMatchday, setSelectedMatchday] = useState('1');
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [loadingMatches, setLoadingMatches] = useState(true);

  // 3D Tilt states
  const [pedestalTiltStyle, setPedestalTiltStyle] = useState({});
  const [miniCardTilts, setMiniCardTilts] = useState<Record<string, any>>({});
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const handleCopyLink = (platform: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  useEffect(() => {
    const fetchProfileAndTournament = async () => {
      try {
        const res = await fetch(`/api/profile/${username}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError('Profile not found in the database. Sync the profile details first by saving settings.');
        }

        // Fetch tournament matches & teams
        const [matchesRes, teamsRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/teams')
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
        console.warn('Failed to load public profile details, falling back to local files:', err);
        try {
          setMatches(matchesDataFallback);
          setTeams(teamsDataFallback);
        } catch (localErr) {
          console.error(localErr);
        }
      } finally {
        setLoading(false);
        setLoadingMatches(false);
      }
    };

    fetchProfileAndTournament();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-gray-500">Retrieving Football IQ profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md bg-[#0B0F19] border border-white/5 p-8 rounded-3xl shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4 mx-auto" />
          <h2 className="font-display font-black text-xl text-white uppercase mb-2">Profile Unavailable</h2>
          <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">{error}</p>
          <Link
            href="/world-cup-hub"
            className="inline-block py-3 px-6 rounded-xl bg-[#881337] text-white font-display font-black text-xs uppercase tracking-wider shadow-md hover:bg-[#881337]/90 transition-colors"
          >
            Start Your Own Campaign
          </Link>
        </div>
      </div>
    );
  }

  const { profile, cards } = data;

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
    const timeDiff = new Date().getTime() - kickoff.getTime();
    if (timeDiff >= 2 * 60 * 60 * 1000) {
      return 'COMPLETED';
    } else if (timeDiff >= 0) {
      return 'LIVE';
    } else {
      return 'UPCOMING';
    }
  };

  const getPublicCardForMatch = (matchId: string) => {
    return cards.find((c: any) => c.matchId === matchId);
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

  // 3D Parallax Tilt Handlers for Mini Cards
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

  // Filter matches for matchday
  const matchdayMatches = matches.filter(m => m.matchday === selectedMatchday && m.type === 'group');

  const filteredMatches = matchdayMatches.filter(match => {
    const card = getPublicCardForMatch(match.id);
    const status = getMatchStatus(match);

    if (filterRarity === 'ALL') return true;
    if (filterRarity === 'LOCKED') return status === 'LIVE';
    if (filterRarity === 'MISSED') return status === 'COMPLETED' && !card;
    
    if (card) {
      return card.rarity === filterRarity;
    }
    return false;
  });

  const totalAlbumSlots = matches.filter(m => m.type === 'group').length || 48;
  const albumProgressPercent = Math.round((cards.length / totalAlbumSlots) * 100);

  // Rarity deck counts for inventory stats bar
  const legendaryCount = cards.filter((c: any) => c.rarity === 'LEGENDARY').length;
  const epicCount = cards.filter((c: any) => c.rarity === 'EPIC').length;
  const rareCount = cards.filter((c: any) => c.rarity === 'RARE').length;
  const commonCount = cards.filter((c: any) => c.rarity === 'COMMON').length;

  return (
    <div className="relative min-h-screen bg-[#030712] text-foreground pb-20 overflow-hidden">

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
        <div className="pt-[70px] pb-3 px-10 flex flex-col items-center text-center max-w-lg mx-auto rounded-b-3xl border-x border-b border-white/10 bg-gradient-to-b from-black/80 via-black/55 to-black/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.85)] relative z-20">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider leading-none"
              style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)' }}>
            {profile.username}&apos;S ALBUM <span className="text-[#D97706]">BINDER</span>
          </h1>
          <p className="text-gray-400 text-[10px] sm:text-[11px] mt-2.5 font-bold uppercase tracking-widest leading-none">
            COLLECTIBLES BINDER <span className="text-gray-600 mx-2">•</span> EARNED VERDICT CARDS
          </p>
        </div>

        {/* ────────────────────────────────────────────────────────────────── */}
        {/* LEATHER BINDER SYSTEM                                             */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <div className="mt-6 relative">
          
          {/* Protruding divider Tabs */}
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

          {/* Main Leather Binder */}
          <div className="binder-container p-2 sm:p-3.5">
            <div className="binder-stitching" />
            
            {/* Content split grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 relative z-10">
              
              {/* LEFT PAGE: STICKER BINDER GRID */}
              <div className="lg:col-span-7 binder-page-left p-3.5 sm:p-4.5 flex flex-col justify-between border border-white/5 bg-black/55">
                
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-2 mb-3 gap-2">
                    <div>
                      <h2 className="font-display font-black text-base text-white uppercase tracking-wider">
                        Page Matchday {selectedMatchday} Slots
                      </h2>
                      {/* FUT Inventory counts */}
                      <div className="flex gap-2.5 mt-1 text-[8.5px] font-black uppercase text-gray-500">
                        <span className="text-amber-500">🏆 {legendaryCount} LEG</span>
                        <span className="text-rose-500">🔥 {epicCount} EPC</span>
                        <span className="text-blue-400">⚡ {rareCount} RRE</span>
                        <span className="text-gray-400">🪙 {commonCount} CMN</span>
                      </div>
                    </div>
                  </div>

                  {/* System Log / Public Profile Description */}
                  <div className="bg-black/25 border border-white/5 rounded-xl px-3 py-2.5 mb-3 text-[10px] text-gray-400 leading-relaxed flex items-start gap-2.5">
                    <span className="text-[#F43F5E] font-black tracking-wider uppercase shrink-0 mt-0.5 text-[8.5px] bg-[#F43F5E]/10 px-1 py-0.5 rounded border border-[#F43F5E]/20">PUBLIC LOG</span>
                    <p>
                      Explore this collector&apos;s persistent reputation card cabinet. Check their predictions outcome, hot takes verdicts, and see if they know ball.
                    </p>
                  </div>

                  {/* FUT Album & Rank Statistics Dashboard */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 bg-black/40 border border-white/5 rounded-xl p-3 shadow-inner">
                    {/* Album Completion */}
                    <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-white/5 pb-2 sm:pb-0 sm:pr-3">
                      <div className="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Binder Progress</span>
                        <span className="font-mono text-white text-[10.5px] font-bold">{cards.length} / {totalAlbumSlots} STICKERS</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-rose-500 to-rose-300 rounded-full transition-all duration-700" 
                            style={{ width: `${albumProgressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] font-black text-rose-400 shrink-0">{albumProgressPercent}%</span>
                      </div>
                    </div>

                    {/* Platform Ranking */}
                    <div className="flex flex-col gap-1 sm:pl-1">
                      <div className="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Platform Rank</span>
                        <span className="font-mono text-white text-[10.5px] font-bold">{profile.overallRating} OVR</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700" 
                            style={{ width: `${profile.overallRating}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] font-black text-amber-400 shrink-0">{playstyle}</span>
                      </div>
                    </div>
                  </div>



                  {/* Filters (Bigger & more readable) */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {[
                      { id: 'ALL', label: 'All Slots' },
                      { id: 'LEGENDARY', label: 'Legendary' },
                      { id: 'EPIC', label: 'Epic' },
                      { id: 'RARE', label: 'Rare' },
                      { id: 'COMMON', label: 'Common' },
                      { id: 'MISSED', label: 'Missed' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFilterRarity(f.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
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
                  {loadingMatches ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-3" />
                      <p className="text-xs text-gray-500 font-semibold uppercase">Consulting database...</p>
                    </div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-black/10">
                      <ShieldAlert className="w-8 h-8 text-gray-600 mb-2.5" />
                      <p className="font-display font-black text-xs text-gray-500 uppercase tracking-widest">No matching slots on page</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {filteredMatches.map(match => {
                        const homeTeam = teams.find(t => t.id === match.home_team_id) || {
                          id: match.home_team_id,
                          name_en: (match as any).home_team_label || 'Home',
                          flag: 'https://flagcdn.com/w80/un.png',
                          fifa_code: (match as any).home_team_label ? ((match as any).home_team_label.slice(0, 3).toUpperCase()) : 'TBD',
                          groups: match.group || 'A'
                        };
                        const awayTeam = teams.find(t => t.id === match.away_team_id) || {
                          id: match.away_team_id,
                          name_en: (match as any).away_team_label || 'Away',
                          flag: 'https://flagcdn.com/w80/un.png',
                          fifa_code: (match as any).away_team_label ? ((match as any).away_team_label.slice(0, 3).toUpperCase()) : 'TBD',
                          groups: match.group || 'A'
                        };

                        const card = getPublicCardForMatch(match.id);
                        const status = getMatchStatus(match);

                        // ─── Case A: Card claimed ──────────────────────────────────
                        if (card) {
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
                                    <span className="font-card-fut font-bold text-xl leading-none text-white">
                                      {card.rating}
                                    </span>
                                    <img src={homeTeam.flag} alt="" className="w-5 h-3.5 object-cover rounded shadow-xs mt-1 shrink-0 border border-white/5" />
                                  </div>
                                  <span className={`text-[6.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-black/60 border border-white/5 ${textGlow}`}>
                                    {card.rarity.slice(0, 3)}
                                  </span>
                                </div>

                                <div className="text-center my-auto">
                                  <p className="font-card-fut font-black text-[9px] text-white tracking-tight uppercase leading-tight line-clamp-2 px-1 break-words">
                                    {card.verdict.split(' MERCHANT')[0].split(' PROPHET')[0].split(' MASTERMIND')[0]}
                                  </p>
                                </div>

                                <div className="border-t border-white/10 pt-1 flex justify-between items-center text-[7px] font-bold text-gray-400 uppercase tracking-widest">
                                  <span>MD {selectedMatchday}</span>
                                  <span className="text-amber-400 group-hover:underline">INSPECT</span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // ─── Case B: Completed but no card ──────────────────────────
                        if (status === 'COMPLETED') {
                          return (
                            <div
                              key={match.id}
                              className="card-mini-fut-slot card-mini-missed group relative overflow-hidden"
                            >
                              <div className="card-mini-fut-inner">
                                <div className="flex justify-between items-start opacity-40">
                                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider">SLOT {match.id}</span>
                                  <span className="text-[8px] font-mono font-bold text-red-500">MISSED</span>
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

                                <div className="text-center text-[8px] font-black text-red-500/70 uppercase tracking-wide">
                                  Missed Slot
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // ─── Case C: Empty Slot / Upcoming Match ────────────────────
                        return (
                          <div
                            key={match.id}
                            className="card-mini-fut-slot card-mini-empty group relative overflow-hidden"
                          >
                            <div className="card-mini-fut-inner">
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider">SLOT {match.id}</span>
                                <span className="text-[8px] font-mono font-bold text-gray-400">EMPTY</span>
                              </div>

                              <div className="text-center my-auto flex flex-col items-center">
                                <div className="flex gap-1.5 mb-1">
                                  <img src={homeTeam.flag} alt="" className="w-5.5 h-4 object-cover rounded shadow-xs border border-white/5" />
                                  <img src={awayTeam.flag} alt="" className="w-5.5 h-4 object-cover rounded shadow-xs border border-white/5" />
                                </div>
                                <p className="text-[9.5px] font-bold text-gray-300 truncate w-full max-w-[95px]">{homeTeam.fifa_code} vs {awayTeam.fifa_code}</p>
                              </div>

                              <div className="text-center text-[8px] font-black text-gray-500/60 uppercase tracking-wider">
                                Upcoming game
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 mt-8 pt-4 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>Matchday {selectedMatchday} group stage page</span>
                  <span>VAR Album v1.02</span>
                </div>
              </div>

              {/* RIGHT PAGE: THE STICKY PEDESTAL SHOWCASE (Borderless column, no scroll) */}
              <div className="lg:col-span-5 p-2 sm:p-4 flex flex-col justify-start items-center lg:sticky lg:top-[95px] lg:h-[calc(100vh-185px)] overflow-hidden pt-2 gap-2">
                
                {/* Spotlight glowing effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[160px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-xl rounded-full pointer-events-none" />

                {/* Pedestal and Card display side-by-side with vertical Share dock */}
                <div className="flex flex-row items-center justify-center gap-3 sm:gap-4.5 w-full relative">
                  
                  {/* Rotating platform base (Scaled to fit screen perfectly) */}
                  <div className="relative flex justify-center items-center py-1">
                    
                    {/* Glowing Aura Ring */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[360px] rounded-full blur-[80px] pointer-events-none -z-10 opacity-70 bg-gradient-to-tr from-[#881337]/35 via-transparent to-[#D97706]/35" />
                    
                    {/* Metal pedestal base glow */}
                    <div className="absolute bottom-1 w-60 h-2.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent blur-md rounded-full pointer-events-none" />

                    {/* Bounding box wrapper with exact layout size of the scaled card */}
                    <div className="relative flex items-center justify-center h-[360px] w-[255px] sm:h-[384px] sm:w-[272px] md:h-[408px] md:w-[289px] lg:h-[384px] lg:w-[272px] xl:h-[408px] xl:w-[289px] shrink-0">
                      {/* 3D tilt frame wrapper */}
                      <div 
                        onMouseMove={handlePedestalMouseMove}
                        onMouseLeave={handlePedestalMouseLeave}
                        style={pedestalTiltStyle}
                        className="absolute card-3d-tilt transform origin-center scale-[0.75] sm:scale-[0.80] md:scale-[0.85] lg:scale-[0.80] xl:scale-[0.85]"
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
                            countryFlag: profile.favoriteNation ? getFlagEmoji(profile.favoriteNation) : '🌍',
                            playerName: profile.username,
                            playerPosition: selectedCard.rating >= 75 ? 'CF' : 'DM',
                            avatarStyle: profile.avatarStyle,
                            avatarSeed: profile.avatarSeed
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
                            charge: `ACCURACY RATING AT KICKOFF`,
                            sentence: `Total Matches Predicted: ${cards.length} Resolved`,
                            ach: { title: 'Reputation', desc: 'Active Profile', badge },
                            stats: [
                              { label: 'IQ', name: 'Ball IQ', val: profile.overallRating },
                              { label: 'DEL', name: 'Delusion', val: 100 - profile.overallRating }
                            ],
                            cardTheme: profile.overallRating >= 85 ? 'toty' : (profile.overallRating >= 70 ? 'gold' : (profile.overallRating >= 45 ? 'var' : 'bottler')),
                            countryFlag: profile.favoriteNation ? getFlagEmoji(profile.favoriteNation) : '🌍',
                            playerName: profile.username,
                            playerPosition: profile.overallRating >= 75 ? 'CF' : 'DM',
                            avatarStyle: profile.avatarStyle,
                            avatarSeed: profile.avatarSeed
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
                    {((selectedCard ? copiedCard : copiedProfile) || copiedPlatform === 'copy') && (
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
                          `Check out ${profile.username}'s World Cup prediction card graded at ${selectedCard.rating} OVR! VAR Verdict: ${selectedCard.verdict.toUpperCase()}:`
                        )}&url=${encodeURIComponent(getShareUrl('card', selectedCard.id))}`
                      ) : (
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `Explore ${profile.username}'s Football IQ rating card and collectibles album: `
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
                          `Check out ${profile.username}'s World Cup prediction card graded at ${selectedCard.rating} OVR! VAR Verdict: ${selectedCard.verdict.toUpperCase()} - ${getShareUrl('card', selectedCard.id)}`
                        )}`
                      ) : (
                        `https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Explore ${profile.username}'s Football IQ rating card and collectibles album: ${getShareUrl('profile')}`
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
                          `Check out ${profile.username}'s World Cup prediction card graded at ${selectedCard.rating} OVR! VAR Verdict: ${selectedCard.verdict.toUpperCase()}:`
                        )}`
                      ) : (
                        `https://t.me/share/url?url=${encodeURIComponent(getShareUrl('profile'))}&text=${encodeURIComponent(
                          `Explore ${profile.username}'s Football IQ rating card and collectibles album: `
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
                          `Check out ${profile.username}'s World Cup prediction card graded at ${selectedCard.rating} OVR! VAR Verdict: ${selectedCard.verdict.toUpperCase()}:`
                        )}&url=${encodeURIComponent(getShareUrl('card', selectedCard.id))}`
                      ) : (
                        `https://www.reddit.com/submit?title=${encodeURIComponent(
                          `Explore ${profile.username}'s Football IQ rating card and collectibles album:`
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

        {/* Guest invitation call to action */}
        <div className="mt-12 text-center max-w-sm mx-auto relative z-10">
          <p className="text-xs text-gray-400 mb-4 font-semibold">
            Think you have better tactical ball knowledge than {profile.username}?
          </p>
          <Link
            href="/world-cup-hub"
            className="inline-flex items-center gap-2 py-4 px-8 rounded-xl bg-gradient-to-r from-[#881337] to-[#D97706] text-white font-display font-black text-xs uppercase tracking-widest shadow-md hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Trophy className="w-4 h-4 text-white" /> Challenge Them / Build Your IQ
          </Link>
        </div>

      </div>
    </div>
  );
}
