'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import SportsCenterCard from '@/components/SportsCenterCard';
import { getStoredProfile, getStoredPredictions, FootballIQProfile } from '@/lib/profileSync';
import { Share2, ShieldAlert, CheckCircle, Lock, Download, Trophy, Shield } from 'lucide-react';
import { getFlagEmoji, parseLocalDate } from '@/lib/matchUtils';

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
  stadium_id: string;
  home_team_label?: string;
  away_team_label?: string;
}

const SYSTEM_DATE = new Date('2026-06-16T19:20:00Z');

export default function FootballIQPage() {
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [userPreds, setUserPreds] = useState<any>({});
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [activePedestalTab, setActivePedestalTab] = useState<'manager' | 'verdict'>('manager');

  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const pedestalCardRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = (platform: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleDownloadPedestalPng = async () => {
    if (!pedestalCardRef.current || !profile) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(pedestalCardRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      const label = activePedestalTab === 'verdict' && selectedCard ? `Verdict_Match_${selectedCard.matchId}` : 'Manager_Deck';
      link.download = `${profile.username.replace(/\s+/g, '_')}_${label}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
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
        console.error('Failed to fetch remote World Cup data:', err);
        setError('Failed to retrieve tournament standings and matches from the server.');
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchTournamentData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 text-center pt-[52px]">
        <div className="max-w-md bg-[#0B0F19]/90 border border-white/15 p-8 rounded-3xl shadow-xl backdrop-blur-md">
          <ShieldAlert className="w-12 h-12 text-[#E11D48] mb-4 mx-auto" />
          <h2 className="font-display font-black text-xl text-white uppercase mb-2">Connection Failure</h2>
          <p className="text-gray-300 text-xs leading-relaxed mb-6 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block py-3 px-6 rounded-xl bg-[#E11D48] text-white font-display font-black text-xs uppercase tracking-wider shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#E11D48] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-zinc-300">Retrieving Football reputation card...</p>
      </div>
    );
  }

  const playstyle = profile.overallRating >= 85 ? 'TACTICAL MASTERMIND' : (profile.overallRating >= 70 ? 'CERTIFIED CHEF' : (profile.overallRating >= 45 ? 'ROOKIE TACTICIAN' : 'DELUSION MERCHANT'));
  const badge = profile.overallRating >= 85 ? '👑' : (profile.overallRating >= 70 ? '⚖️' : (profile.overallRating >= 45 ? '🔥' : '⚠️'));

  // Filter matches by selected matchday
  const matchdayMatches = matches.filter(m => m.matchday === selectedMatchday);

  // Generate cards and calculate metrics for current matchday
  const matchdayCards = matchdayMatches.map(m => {
    const p = userPreds[m.id];
    const finished = m.finished === 'TRUE' || m.finished === 'true';
    const mDate = parseLocalDate(m.local_date);
    const expired = !finished && mDate < SYSTEM_DATE;

    const homeTeam = teams.find(t => t.id === m.home_team_id) || { name_en: m.home_team_label || 'Home', flag: '', groups: 'A' };
    const awayTeam = teams.find(t => t.id === m.away_team_id) || { name_en: m.away_team_label || 'Away', flag: '', groups: 'A' };

    let status: 'LOCKED' | 'GRADED' | 'EXPIRED' = 'LOCKED';
    let cardData: any = null;

    if (finished && p) {
      status = 'GRADED';
      const actualHome = parseInt(m.home_score, 10);
      const actualAway = parseInt(m.away_score, 10);
      const exactScore = p.homeScore === actualHome && p.awayScore === actualAway;
      const correctOutcome = (p.homeScore > p.awayScore && actualHome > actualAway) ||
                             (p.homeScore < p.awayScore && actualHome < actualAway) ||
                             (p.homeScore === p.awayScore && actualHome === actualAway);

      let rating = profile.overallRating;
      let rarity = 'COMMON';
      let verdict = 'NEUTRAL RULING';
      let charge = 'Standard Match Prediction';
      let sentence = 'Case Closed';

      if (exactScore) {
        rating = Math.min(99, profile.overallRating + 8);
        rarity = 'LEGENDARY';
        verdict = 'TACTICAL MASTERMIND';
        charge = `EXACT SCORE PREDICTION (${p.homeScore}-${p.awayScore})`;
        sentence = 'Awarded Maximum VAR Distinction (+15 Pts)';
      } else if (correctOutcome) {
        rating = Math.min(99, profile.overallRating + 4);
        rarity = 'EPIC';
        verdict = 'CERTIFIED CHEF';
        charge = `CORRECT OUTCOME PREDICTED`;
        sentence = 'VAR Approved Tactical Take (+5 Pts)';
      } else {
        rating = Math.max(30, profile.overallRating - 5);
        rarity = 'RARE';
        verdict = 'DELUSION MERCHANT';
        charge = `INCORRECT OUTCOME PREDICTED`;
        sentence = 'Sentenced to Tactical Re-education (-2 Pts)';
      }

      cardData = {
        id: `card_${m.id}`,
        matchId: m.id,
        rating,
        rarity,
        verdict,
        charge,
        sentence,
        evidence: p.hotTake ? `Hot Take statement: "${p.hotTake}" (VAR grading: ${verdict})` : `Score prediction submitted: ${p.homeScore}-${p.awayScore}`,
        homeTeam: homeTeam.name_en,
        awayTeam: awayTeam.name_en,
        homeScore: m.home_score,
        awayScore: m.away_score,
        cardTheme: rarity === 'LEGENDARY' ? 'gold' : (rarity === 'EPIC' ? 'purple' : 'blue'),
        statsJson: { prd: rating, mgr: Math.max(30, rating - 3), hot: Math.min(99, rating + 2), rst: Math.min(99, rating + 1) }
      };
    } else if (expired) {
      status = 'EXPIRED';
    }

    return { match: m, status, card: cardData, homeTeam, awayTeam };
  });

  // Filter slot cards by rarity tab
  const filteredMatches = matchdayCards.filter(item => {
    if (filterRarity === 'ALL') return true;
    if (filterRarity === 'LOCKED') return item.status === 'LOCKED';
    if (filterRarity === 'MISSED') return item.status === 'EXPIRED';
    return item.status === 'GRADED' && item.card?.rarity === filterRarity;
  });

  // Calculate album metrics
  const totalMatches = matchdayCards.length;
  const gradedCount = matchdayCards.filter(c => c.status === 'GRADED').length;
  const legendaryCount = matchdayCards.filter(c => c.card?.rarity === 'LEGENDARY').length;
  const epicCount = matchdayCards.filter(c => c.card?.rarity === 'EPIC').length;
  const rareCount = matchdayCards.filter(c => c.card?.rarity === 'RARE').length;
  const commonCount = matchdayCards.filter(c => c.card?.rarity === 'COMMON').length;
  
  const totalAlbumSlots = 72;
  const albumProgressPercent = Math.round((gradedCount / totalAlbumSlots) * 100);
  const exactCount = matchdayCards.filter(c => c.card?.rarity === 'LEGENDARY').length;
  const accuracy = gradedCount > 0 ? Math.round((exactCount / gradedCount) * 100) : 0;

  // Handle Card Slot Click
  const handleSlotClick = (item: any) => {
    if (item.status === 'GRADED' && item.card) {
      setSelectedCard(item.card);
      setActivePedestalTab('verdict');
    }
  };

  const handleMiniMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = -(y / (box.height / 2)) * 12;
    const tiltY = (x / (box.width / 2)) * 12;
    setMiniCardTilts(prev => ({
      ...prev,
      [id]: { transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.04, 1.04, 1.04)`, transition: 'transform 0.05s ease' }
    }));
  };

  const handleMiniMouseLeave = (id: string) => {
    setMiniCardTilts(prev => ({
      ...prev,
      [id]: { transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)', transition: 'transform 0.4s ease' }
    }));
  };

  const handlePedestalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = -(y / (box.height / 2)) * 14;
    const tiltY = (x / (box.width / 2)) * 14;
    setPedestalTiltStyle({ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`, transition: 'transform 0.05s ease' });
  };

  const handlePedestalMouseLeave = () => {
    setPedestalTiltStyle({ transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)', transition: 'transform 0.4s ease' });
  };

  const getShareUrl = (type: 'profile' | 'card', id?: string) => {
    if (typeof window === 'undefined') return '';
    if (type === 'card' && id) return `${window.location.origin}/card/${id}`;
    return `${window.location.origin}/u/${profile.username}`;
  };

  // Render individual card slot
  const renderCardSlot = (item: any) => {
    const { match: m, status, card: c, homeTeam, awayTeam } = item;
    const slotId = m.id;
    const tilt = miniCardTilts[slotId] || {};

    let rarityBorder = 'border-white/10 bg-black/40';
    let badgeBg = 'bg-zinc-800 text-zinc-400';

    if (status === 'GRADED' && c) {
      if (c.rarity === 'LEGENDARY') {
        rarityBorder = 'border-amber-400/60 bg-gradient-to-b from-amber-950/40 to-black/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
        badgeBg = 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black';
      } else if (c.rarity === 'EPIC') {
        rarityBorder = 'border-purple-500/60 bg-gradient-to-b from-purple-950/40 to-black/80 shadow-[0_0_15px_rgba(168,85,247,0.25)]';
        badgeBg = 'bg-purple-600 text-white font-black';
      } else {
        rarityBorder = 'border-blue-500/60 bg-gradient-to-b from-blue-950/40 to-black/80 shadow-[0_0_15px_rgba(59,130,246,0.25)]';
        badgeBg = 'bg-blue-600 text-white font-black';
      }
    } else if (status === 'EXPIRED') {
      rarityBorder = 'border-rose-900/40 bg-rose-950/20 opacity-60';
    }

    const isSelected = selectedCard?.id === c?.id;

    return (
      <div
        key={slotId}
        onMouseMove={(e) => handleMiniMouseMove(slotId, e)}
        onMouseLeave={() => handleMiniMouseLeave(slotId)}
        onClick={() => handleSlotClick(item)}
        style={tilt}
        className={`relative aspect-[3/4] rounded-2xl border ${rarityBorder} p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 select-none overflow-hidden group ${
          isSelected ? 'ring-2 ring-[#E11D48] scale-[1.03] z-20 shadow-2xl' : ''
        }`}
      >
        {/* Top Header Badge */}
        <div className="flex justify-between items-center z-10">
          <span className="text-[9px] font-mono font-bold text-gray-300 uppercase">M{m.id}</span>
          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${badgeBg}`}>
            {status === 'GRADED' ? c.rarity : status}
          </span>
        </div>

        {/* Center Slot Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-1 z-10">
          {status === 'GRADED' && c ? (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white font-display tracking-tighter leading-none mb-1">{c.rating}</span>
              <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider truncate max-w-[90px]">{c.verdict}</span>
            </div>
          ) : status === 'EXPIRED' ? (
            <div className="flex flex-col items-center opacity-60">
              <ShieldAlert className="w-6 h-6 text-rose-500 mb-1" />
              <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">MISSED</span>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-40">
              <Lock className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">LOCKED</span>
            </div>
          )}
        </div>

        {/* Bottom Teams Label */}
        <div className="text-center z-10 border-t border-white/10 pt-1.5 mt-auto">
          <p className="text-[9px] font-black text-white uppercase truncate">
            {homeTeam.name_en} vs {awayTeam.name_en}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-foreground flex flex-col justify-between pt-[52px] pb-6 select-none">
      
      {/* Ambient Stadium Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/game_stadium_showcase.webp" 
          alt="World Cup Stadium background" 
          fill 
          className="object-cover object-center opacity-[0.20]" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#030712]/75 to-[#030712]" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-8 pt-2 pb-4 w-full flex-grow flex flex-col min-h-0">
        
        <div className="relative w-full bg-[#0B0F19]/90 border border-white/15 rounded-3xl shadow-2xl flex flex-col flex-grow min-h-0 mt-2 backdrop-blur-xl overflow-hidden">
          
          {/* ── Unified Header Bar ── */}
          <div className="shrink-0 border-b border-white/15 bg-black/40 backdrop-blur-md p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider leading-none">
                COLLECTIBLES <span className="text-[#E11D48]">BINDER</span>
              </h1>
              <p className="text-gray-300 text-[10px] sm:text-xs mt-1.5 font-bold uppercase tracking-widest leading-none">
                YOUR SHIELD COLLECTION <span className="text-zinc-500 mx-2">•</span> EARNED VERDICT CARDS
              </p>
            </div>

            {/* Clean Horizontal Matchday Navigation Bar */}
            <div className="flex bg-black/60 border border-white/15 p-1 rounded-2xl gap-1">
              {[
                { id: '1', label: 'Matchday 1' },
                { id: '2', label: 'Matchday 2' },
                { id: '3', label: 'Matchday 3' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedMatchday(tab.id);
                    setSelectedCard(null);
                  }}
                  className={`px-4 py-2 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    selectedMatchday === tab.id
                      ? 'bg-gradient-to-r from-[#881337] to-[#E11D48] text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 relative flex-grow flex flex-col min-h-0">

            {/* Content split grid (Double page display) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-grow min-h-0">
              
              {/* ──────────────────────────────────────────────────────── */}
              {/* LEFT PAGE: ALBUM SLOTS GRID & HIGH CONTRAST STATS        */}
              {/* ──────────────────────────────────────────────────────── */}
              <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col gap-4 border border-white/15 bg-black/40 rounded-3xl backdrop-blur-md shadow-xl overflow-hidden">
                
                {/* Album Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 gap-3">
                  <div>
                    <h2 className="font-display font-black text-lg text-white uppercase tracking-wider">
                      Matchday {selectedMatchday} — Sticker Slots
                    </h2>
                    <div className="flex gap-3 mt-1.5 text-xs font-black uppercase">
                      <span className="text-amber-400">🏆 {legendaryCount} LEG</span>
                      <span className="text-purple-400">🔥 {epicCount} EPC</span>
                      <span className="text-blue-400">⚡ {rareCount} RRE</span>
                      <span className="text-gray-300">🪙 {commonCount} CMN</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedCard(null);
                      setFilterRarity('ALL');
                    }}
                    className="px-3.5 py-2 text-xs font-black text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl uppercase tracking-wider hover:bg-rose-500/25 transition-all cursor-pointer shrink-0"
                  >
                    Reset Slots
                  </button>
                </div>

                {/* Compact High-Contrast Stats Row */}
                <div className="grid grid-cols-2 gap-3 bg-black/60 border border-white/10 rounded-2xl p-3.5 shadow-md">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-black text-gray-300 uppercase tracking-widest">
                      <span>Album Progress</span>
                      <span className="font-mono text-white font-bold">{totalMatches}/{totalAlbumSlots}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#881337] to-[#E11D48] rounded-full transition-all duration-700" style={{ width: `${albumProgressPercent}%` }} />
                      </div>
                      <span className="font-mono text-xs font-black text-rose-400 shrink-0">{albumProgressPercent}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-black text-gray-300 uppercase tracking-widest">
                      <span>VAR Accuracy</span>
                      <span className="font-mono text-white font-bold">{accuracy}% exact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700" style={{ width: `${accuracy}%` }} />
                      </div>
                      <span className="font-mono text-xs font-black text-amber-400 shrink-0">EXACT</span>
                    </div>
                  </div>
                </div>

                {/* Album Slot Filter Pills */}
                <div className="flex flex-wrap gap-2">
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
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        filterRarity === f.id
                          ? 'bg-[#E11D48]/20 border-[#E11D48] text-white shadow-sm'
                          : 'bg-black/40 border-white/10 text-gray-300 hover:bg-black/60 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Slots Grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {loadingMatches ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-[#881337] border-t-[#E11D48] animate-spin mb-3" />
                      <p className="text-xs text-gray-400 font-bold uppercase">Consulting VAR database...</p>
                    </div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-white/15 rounded-2xl bg-black/20">
                      <ShieldAlert className="w-8 h-8 text-gray-400 mb-2.5" />
                      <p className="font-display font-black text-xs text-gray-300 uppercase tracking-widest">No matching slots on page</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {filteredMatches.map(match => renderCardSlot(match))}
                    </div>
                  )}
                </div>

                {/* Footer notes */}
                <div className="border-t border-white/10 pt-2 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <span>Matchday {selectedMatchday} group stage</span>
                  <span>VAR Collectibles v2.0</span>
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────── */}
              {/* RIGHT PAGE: STICKY SHOWCASE SHOWCASING BOTH CARDS         */}
              {/* ──────────────────────────────────────────────────────── */}
              <div className="lg:col-span-5 p-4 sm:p-6 border border-white/15 bg-black/40 rounded-3xl flex flex-col justify-between shadow-2xl backdrop-blur-md relative overflow-hidden">
                
                {/* Pedestal Tab Switcher */}
                <div className="flex bg-black/60 border border-white/15 p-1 rounded-2xl mb-4 shadow-md w-full relative z-30">
                  <button
                    onClick={() => setActivePedestalTab('manager')}
                    className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePedestalTab === 'manager'
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" /> Manager Deck
                  </button>
                  <button
                    onClick={() => setActivePedestalTab('verdict')}
                    className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePedestalTab === 'verdict'
                        ? 'bg-gradient-to-r from-[#881337] to-[#E11D48] text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Verdict Card
                  </button>
                </div>

                {/* Pedestal and Card Display */}
                <div className="flex flex-col items-center justify-center gap-4 w-full relative z-20 flex-grow">
                  
                  <div 
                    onMouseMove={handlePedestalMouseMove}
                    onMouseLeave={handlePedestalMouseLeave}
                    style={pedestalTiltStyle}
                    className="relative card-3d-tilt transform origin-center scale-[0.80] sm:scale-[0.85] lg:scale-[0.82] xl:scale-[0.88]"
                  >
                    {activePedestalTab === 'verdict' && selectedCard ? (
                      <SportsCenterCard cardRef={pedestalCardRef} data={{
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
                          { label: 'PRD', name: 'Prediction', val: (selectedCard.statsJson as any)?.prd ?? (selectedCard.statsJson as any)?.predictionPerfScore ?? selectedCard.rating },
                          { label: 'MGR', name: 'Manager Score', val: (selectedCard.statsJson as any)?.mgr ?? (selectedCard.statsJson as any)?.tacticalRating ?? Math.max(30, Math.min(99, selectedCard.rating - 3)) },
                          { label: 'HOT', name: 'Hot Take', val: (selectedCard.statsJson as any)?.hot ?? (selectedCard.statsJson as any)?.avgTakeOvr ?? Math.max(30, Math.min(99, selectedCard.rating + 2)) },
                          { label: 'RST', name: 'Roast Score', val: (selectedCard.statsJson as any)?.rst ?? (selectedCard.statsJson as any)?.communityRating ?? Math.max(50, Math.min(99, selectedCard.rating + 1)) }
                        ],
                        cardTheme: selectedCard.cardTheme || 'gold',
                        countryFlag: profile.favoriteNation ? getFlagEmoji(profile.favoriteNation) : '🌍',
                        playerName: profile.username,
                        playerPosition: selectedCard.rating >= 75 ? 'CF' : 'DM',
                        avatarStyle: profile.avatarStyle,
                        avatarSeed: profile.avatarSeed,
                        matchTitle: `${selectedCard.homeTeam} vs ${selectedCard.awayTeam}`,
                        matchScore: `${selectedCard.homeScore} - ${selectedCard.awayScore}`
                      }} />
                    ) : (
                      <SportsCenterCard cardRef={pedestalCardRef} data={{
                        text: `Loyal supporter of ${profile.favoriteNation || 'Argentina'}. Fighting for tactical ball knowledge in the 2026 tournament.`,
                        mode: 'court',
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
                          { label: 'PRD', name: 'Prediction', val: profile.predictionRating },
                          { label: 'MGR', name: 'Manager Score', val: profile.managerRating },
                          { label: 'HOT', name: 'Hot Take', val: profile.hotTakeRating },
                          { label: 'RST', name: 'Roast Score', val: profile.roastScore }
                        ],
                        cardTheme: 'gold',
                        countryFlag: profile.favoriteNation ? getFlagEmoji(profile.favoriteNation) : '🌍',
                        playerName: profile.username,
                        playerPosition: profile.overallRating >= 75 ? 'CF' : 'DM',
                        avatarStyle: profile.avatarStyle,
                        avatarSeed: profile.avatarSeed
                      }} />
                    )}
                  </div>

                  {/* Horizontal Social Share Dock & High-Res PNG Download */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-white/15 bg-black/60 shadow-xl w-full relative z-30">
                    <span className="text-xs font-black text-gray-300 uppercase tracking-widest pl-1">
                      Share {activePedestalTab === 'verdict' && selectedCard ? 'Verdict Card' : 'Manager Deck'}
                    </span>
                    
                    <div className="flex gap-2 items-center">
                      {/* Download PNG Button */}
                      <button
                        onClick={handleDownloadPedestalPng}
                        disabled={downloading}
                        className="p-2.5 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 rounded-xl transition-all cursor-pointer shadow-md"
                        title="Download Card PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* X/Twitter Share */}
                      <a
                        href={activePedestalTab === 'verdict' && selectedCard ? (
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `My VAR Verdict Card for ${selectedCard.homeTeam} vs ${selectedCard.awayTeam} (${selectedCard.homeScore}-${selectedCard.awayScore}) graded at ${selectedCard.rating} OVR! ${selectedCard.verdict.toUpperCase()}:`
                          )}&url=${encodeURIComponent(getShareUrl('card', selectedCard.id))}`
                        ) : (
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `My official Football IQ Manager Deck is ${profile.overallRating} OVR (${playstyle}) on the World Cup 2026 VAR Tribunal! Inspect my card binder:`
                          )}&url=${encodeURIComponent(getShareUrl('profile'))}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all cursor-pointer"
                        title="Share on X"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>

                      {/* WhatsApp Share */}
                      <a
                        href={activePedestalTab === 'verdict' && selectedCard ? (
                          `https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `My VAR Verdict Card for ${selectedCard.homeTeam} vs ${selectedCard.awayTeam} (${selectedCard.homeScore}-${selectedCard.awayScore}) graded at ${selectedCard.rating} OVR! ${selectedCard.verdict.toUpperCase()}: ${getShareUrl('card', selectedCard.id)}`
                          )}`
                        ) : (
                          `https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `My official Football IQ Manager Deck is ${profile.overallRating} OVR (${playstyle}) on the World Cup 2026 VAR Tribunal! Inspect my card binder: ${getShareUrl('profile')}`
                          )}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-400 rounded-xl transition-all cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.79-4.396c1.598.947 3.51 1.448 5.466 1.449 5.518 0 10.006-4.486 10.01-10.001.002-2.673-1.039-5.184-2.929-7.076-1.89-1.89-4.4-2.93-7.08-2.932-5.521 0-10.007 4.486-10.012 10.002-.002 1.897.486 3.754 1.412 5.37L2.836 21.3l4.01-.105z"/></svg>
                      </a>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink('copy', activePedestalTab === 'verdict' && selectedCard ? getShareUrl('card', selectedCard.id) : getShareUrl('profile'))}
                        className="p-2.5 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer"
                        title="Copy URL"
                      >
                        {copiedPlatform === 'copy' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
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
