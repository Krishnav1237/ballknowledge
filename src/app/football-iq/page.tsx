'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import SportsCenterCard from '@/components/SportsCenterCard';
import { getStoredProfile, getStoredPredictions, FootballIQProfile } from '@/lib/profileSync';
import { Share2, ShieldAlert, CheckCircle, Trophy, Shield, Download } from 'lucide-react';
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

const SYSTEM_DATE = new Date('2026-06-11T12:00:00Z');

export default function FootballIQPage() {
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [userPreds, setUserPreds] = useState<Record<string, any>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  const [selectedMatchday, setSelectedMatchday] = useState('1');
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'verdict' | 'deck'>('verdict');
  
  const [pedestalTiltStyle, setPedestalTiltStyle] = useState({});
  const [miniCardTilts, setMiniCardTilts] = useState<Record<string, any>>({});
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const cardPedestalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = getStoredProfile();
    setProfile(p);
    const preds = getStoredPredictions();
    setUserPreds(preds);

    async function fetchData() {
      try {
        const [resM, resT] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/teams')
        ]);
        if (resM.ok && resT.ok) {
          const datM = await resM.json();
          const datT = await resT.json();
          setMatches(Array.isArray(datM) ? datM : (datM.matches || []));
          setTeams(Array.isArray(datT) ? datT : (datT.teams || []));
        }
      } catch (e) {
        console.error('Failed to load matches/teams', e);
      } finally {
        setLoadingMatches(false);
      }
    }
    fetchData();

    const handleStorage = () => {
      setProfile(getStoredProfile());
      setUserPreds(getStoredPredictions());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!profile) return null;

  const predArray = Object.values(userPreds);
  const totalMatches = predArray.length;
  const exactCount = predArray.filter(p => p.exactScore).length;
  const accuracy = totalMatches > 0 ? Math.round((exactCount / totalMatches) * 100) : 0;

  let legendaryCount = 0;
  let epicCount = 0;
  let rareCount = 0;
  let commonCount = 0;

  predArray.forEach(p => {
    const ovr = p.cardRating || 50;
    if (ovr >= 85) legendaryCount++;
    else if (ovr >= 70) epicCount++;
    else if (ovr >= 45) rareCount++;
    else commonCount++;
  });

  const totalAlbumSlots = 72;
  const albumProgressPercent = Math.min(100, Math.round((totalMatches / totalAlbumSlots) * 100));

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
    const kickoff = parseLocalDate(match.local_date, match.stadium_id);
    const timeDiff = SYSTEM_DATE.getTime() - kickoff.getTime();
    if (timeDiff >= 2 * 60 * 60 * 1000) {
      return 'COMPLETED';
    } else if (timeDiff >= 0) {
      return 'LIVE';
    } else {
      return 'UPCOMING';
    }
  };

  const handlePedestalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = -(y / (box.height / 2)) * 10;
    const tiltY = (x / (box.width / 2)) * 10;
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

  const handleMiniMouseMove = (e: React.MouseEvent<HTMLDivElement>, matchId: string) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = -(y / (box.height / 2)) * 12;
    const tiltY = (x / (box.width / 2)) * 12;
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

  const getShareUrl = (type: 'profile' | 'card', idStr?: string) => {
    if (typeof window === 'undefined') return '';
    return type === 'profile' 
      ? `${window.location.origin}/u/${profile.username}` 
      : `${window.location.origin}/card/${idStr}`;
  };

  const handleCopyLink = (platformStr: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedPlatform(platformStr);
    setTimeout(() => setCopiedPlatform(null), 2500);
  };

  const handleDownloadPng = async () => {
    if (!cardPedestalRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardPedestalRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      const label = selectedCard ? `Verdict_Match_${selectedCard.matchId}` : 'Tournament_Deck';
      link.download = `${profile.username.replace(/\s+/g, '_')}_${label}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const matchdayMatches = matches.filter(m => String(m.matchday) === String(selectedMatchday) && (m.type === 'group' || !m.type));

  const constructMatchCardObj = (match: Match) => {
    const homeTeam = teams.find(t => String(t.id) === String(match.home_team_id)) || { name_en: match.home_team_label || (match as any).home_team_name_en || 'Home', flag: '' };
    const awayTeam = teams.find(t => String(t.id) === String(match.away_team_id)) || { name_en: match.away_team_label || (match as any).away_team_name_en || 'Away', flag: '' };
    const userPred = userPreds[match.id];

    const ovr = userPred?.cardRating || (profile.overallRating >= 80 ? 88 : profile.overallRating >= 70 ? 76 : profile.overallRating >= 50 ? 62 : 42);
    let rarity = 'COMMON';
    if (ovr >= 85) rarity = 'LEGENDARY';
    else if (ovr >= 70) rarity = 'EPIC';
    else if (ovr >= 45) rarity = 'RARE';

    const verdictText = userPred?.verdict || (ovr >= 85 ? 'VISIONARY PROPHET' : ovr >= 70 ? 'TACTICAL MASTERMIND' : ovr >= 45 ? 'DELUSION MERCHANT' : 'PENALTY MERCHANT');

    return {
      id: userPred?.cardId || match.id,
      matchId: match.id,
      rating: ovr,
      verdict: verdictText,
      charge: userPred?.charge || `${homeTeam.name_en} vs ${awayTeam.name_en}`,
      sentence: userPred?.sentence || (userPred ? `Predicted ${userPred.homeScore}-${userPred.awayScore}` : `Matchday ${match.matchday} Fixture`),
      evidence: `Hot Take statement: "${userPred?.hotTakes?.[0]?.statement || 'Tactical Mastermind'}"`,
      rarity,
      matchTitle: `${homeTeam.name_en} vs ${awayTeam.name_en}`,
      matchScore: userPred?.homeScore !== undefined ? `${userPred.homeScore} - ${userPred.awayScore}` : (match.home_score !== '' ? `${match.home_score} - ${match.away_score}` : undefined),
      statsJson: {
        prd: userPred?.homeScore !== undefined ? 92 : profile.predictionRating || 75,
        mgr: userPred?.managerRating || profile.managerRating || 85,
        hot: userPred?.hotTakeRating || profile.hotTakeRating || 88,
        rst: userPred?.roastScore || profile.roastScore || 80
      }
    };
  };

  const filteredMatches = matchdayMatches.filter(match => {
    const cardObj = constructMatchCardObj(match);
    const userPred = userPreds[match.id];
    const status = getMatchStatus(match);

    if (filterRarity === 'ALL') return true;
    if (filterRarity === 'LOCKED') return !userPred;
    if (filterRarity === 'MISSED') return status === 'COMPLETED' && (!userPred || !userPred.resolved);

    return cardObj.rarity === filterRarity;
  });

  const renderCardSlot = (match: Match) => {
    const homeTeam = teams.find(t => String(t.id) === String(match.home_team_id)) || { name_en: match.home_team_label || (match as any).home_team_name_en || 'Home', flag: 'https://flagcdn.com/w80/un.png' };
    const awayTeam = teams.find(t => String(t.id) === String(match.away_team_id)) || { name_en: match.away_team_label || (match as any).away_team_name_en || 'Away', flag: 'https://flagcdn.com/w80/un.png' };
    const cardObj = constructMatchCardObj(match);
    const isSelected = selectedCard?.matchId === match.id;

    let borderGlow = 'border-white/20';
    let textGlow = 'text-gray-300';
    if (cardObj.rarity === 'LEGENDARY') { borderGlow = 'border-amber-400/50'; textGlow = 'text-amber-300'; }
    else if (cardObj.rarity === 'EPIC') { borderGlow = 'border-purple-400/50'; textGlow = 'text-purple-300'; }
    else if (cardObj.rarity === 'RARE') { borderGlow = 'border-rose-500/50'; textGlow = 'text-rose-300'; }
    else { borderGlow = 'border-sky-400/40'; textGlow = 'text-sky-300'; }

    return (
      <div
        key={match.id}
        onMouseMove={(e) => handleMiniMouseMove(e, match.id)}
        onMouseLeave={() => handleMiniMouseLeave(match.id)}
        style={miniCardTilts[match.id] || {}}
        onClick={() => {
          setSelectedCard(cardObj);
          setActiveRightTab('verdict');
        }}
        className={`card-mini-fut-slot card-3d-tilt cursor-pointer relative z-10 group filter drop-shadow-md transition-all ${
          isSelected ? 'ring-2 ring-amber-400 scale-[1.03]' : ''
        }`}
      >
        <div className={`h-full w-full bg-[#0B0F19]/90 border ${borderGlow} rounded-xl p-2 flex flex-col justify-between backdrop-blur-md`}>
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center">
              <span className="font-mono font-black text-lg leading-none text-white">{cardObj.rating}</span>
              <div className="flex gap-1 mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={homeTeam.flag || 'https://flagcdn.com/w80/un.png'} alt="" className="w-4 h-3 object-cover rounded shadow-xs border border-white/10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={awayTeam.flag || 'https://flagcdn.com/w80/un.png'} alt="" className="w-4 h-3 object-cover rounded shadow-xs border border-white/10" />
              </div>
            </div>
            <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/80 border border-white/10 ${textGlow}`}>
              {cardObj.rarity.slice(0, 3)}
            </span>
          </div>

          <div className="text-center my-auto py-1">
            <p className="font-sans font-black text-[9.5px] text-white tracking-wide uppercase leading-tight line-clamp-2 px-0.5">
              {cardObj.verdict.split(' MERCHANT')[0].split(' PROPHET')[0]}
            </p>
          </div>

          <div className="border-t border-white/10 pt-1 flex justify-between items-center text-[7.5px] font-bold text-gray-400 uppercase tracking-widest">
            <span>MD {selectedMatchday}</span>
            <span className="text-amber-400 group-hover:underline">INSPECT</span>
          </div>
        </div>
      </div>
    );
  };

  const activeVerdictCard = selectedCard || (matchdayMatches.length > 0 ? constructMatchCardObj(matchdayMatches[0]) : null);

  return (
    <div className="relative min-h-screen bg-[#030712] text-white flex flex-col justify-between pt-[52px] pb-8 select-none">
      
      {/* Background Stadium Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/world_cup_stadium.webp" 
          alt="World Cup Stadium background" 
          fill 
          className="object-cover object-center opacity-[0.22]" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-[#030712]/80 to-[#030712]" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-8 pt-2 pb-4 w-full flex-grow flex flex-col min-h-0">
        <div className="relative w-full bg-[#0B0F19]/90 border border-white/15 rounded-3xl shadow-2xl flex flex-col flex-grow min-h-0 mt-2 backdrop-blur-xl overflow-hidden">
          
          {/* Header Panel */}
          <div className="shrink-0 border-b border-white/10 bg-black/40 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider leading-none">
                COLLECTIBLES <span className="text-[#E11D48]">BINDER</span>
              </h1>
              <p className="text-gray-400 text-[10px] sm:text-xs mt-1.5 font-bold uppercase tracking-widest leading-none">
                YOUR SHIELD COLLECTION <span className="text-zinc-500 mx-2">•</span> EARNED VERDICT CARDS
              </p>
            </div>

            {/* Horizontal Matchday Selector Pills */}
            <div className="flex items-center gap-2 bg-black/60 border border-white/15 p-1.5 rounded-2xl">
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
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    selectedMatchday === tab.id
                      ? 'bg-gradient-to-r from-[#881337] to-[#E11D48] text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 relative flex-grow flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-grow">
              
              {/* LEFT PAGE: ALBUM SLOTS GRID */}
              <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col gap-4 border border-white/10 bg-[#070B14]/80 rounded-2xl backdrop-blur-md shadow-xl">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 gap-2">
                  <div>
                    <h2 className="font-display font-black text-lg text-white uppercase tracking-wider">
                      Matchday {selectedMatchday} — Sticker Slots
                    </h2>
                    <div className="flex gap-3 mt-1.5 text-xs font-black uppercase tracking-wider">
                      <span className="text-amber-400">🏆 {legendaryCount} LEG</span>
                      <span className="text-purple-400">🔥 {epicCount} EPC</span>
                      <span className="text-blue-400">⚡ {rareCount} RRE</span>
                      <span className="text-gray-400">🪙 {commonCount} CMN</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedCard(null);
                      setFilterRarity('ALL');
                    }}
                    className="px-3.5 py-1.5 text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl uppercase tracking-wider hover:bg-rose-500/20 transition-all cursor-pointer shrink-0"
                  >
                    Reset Filter
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-black/50 border border-white/10 rounded-2xl p-3.5 shadow-md">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-black text-gray-300 uppercase tracking-widest">
                      <span>Album Progress</span>
                      <span className="font-mono text-white font-bold">{totalMatches}/{totalAlbumSlots}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-700" style={{ width: `${albumProgressPercent}%` }} />
                      </div>
                      <span className="font-mono text-xs font-black text-[#E11D48] shrink-0">{albumProgressPercent}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-black text-gray-300 uppercase tracking-widest">
                      <span>Exact Accuracy</span>
                      <span className="font-mono text-white font-bold">{accuracy}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${accuracy}%` }} />
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-400 shrink-0">EXACT</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'ALL', label: 'All Slots' },
                    { id: 'LEGENDARY', label: 'Legendary' },
                    { id: 'EPIC', label: 'Epic' },
                    { id: 'RARE', label: 'Rare' },
                    { id: 'COMMON', label: 'Common' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilterRarity(f.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        filterRarity === f.id
                          ? 'bg-[#E11D48]/20 border-[#E11D48] text-white shadow-md'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:bg-black/60 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px]">
                  {loadingMatches ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-[#881337] border-t-[#E11D48] animate-spin mb-3" />
                      <p className="text-xs text-gray-400 font-semibold uppercase">Consulting database...</p>
                    </div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-white/15 rounded-2xl bg-black/20">
                      <ShieldAlert className="w-8 h-8 text-gray-400 mb-2.5" />
                      <p className="font-display font-black text-xs text-gray-300 uppercase tracking-widest">No matching slots found on this matchday</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {filteredMatches.map(match => renderCardSlot(match))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PAGE: DUAL CARD PREVIEW & DIRECT VERDICT SHARING */}
              <div className="lg:col-span-5 p-4 sm:p-6 border border-white/10 bg-[#070B14]/80 rounded-2xl flex flex-col justify-between shadow-xl backdrop-blur-md relative overflow-hidden">
                
                <div className="flex bg-black/60 border border-white/15 p-1.5 rounded-2xl mb-4 shadow-md w-full z-20">
                  <button
                    onClick={() => setActiveRightTab('deck')}
                    className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeRightTab === 'deck'
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" /> Tournament Deck
                  </button>
                  <button
                    onClick={() => setActiveRightTab('verdict')}
                    className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeRightTab === 'verdict'
                        ? 'bg-gradient-to-r from-[#881337] to-[#E11D48] text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Verdict Card
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center w-full relative z-20 flex-grow py-2">
                  <div ref={cardPedestalRef} className="relative flex justify-center items-center">
                    <div 
                      onMouseMove={handlePedestalMouseMove}
                      onMouseLeave={handlePedestalMouseLeave}
                      style={pedestalTiltStyle}
                      className="relative card-3d-tilt origin-center scale-[0.82] sm:scale-[0.88] lg:scale-[0.88] xl:scale-[0.92]"
                    >
                      {activeRightTab === 'verdict' && activeVerdictCard ? (
                        <SportsCenterCard data={{
                          text: activeVerdictCard.evidence.replace('Hot Take statement: "', '').replace('" (VAR grading:', ''),
                          mode: 'take',
                          caseId: 2026,
                          fanbase: null,
                          isRivalry: false,
                          rarity: activeVerdictCard.rarity,
                          ovr: activeVerdictCard.rating,
                          rulingText: activeVerdictCard.verdict,
                          verdict: activeVerdictCard.verdict,
                          charge: activeVerdictCard.charge,
                          sentence: activeVerdictCard.sentence,
                          ach: { title: 'Reputation', desc: 'Graded Sticker', badge: '🔥' },
                          stats: [
                            { label: 'PRD', name: 'Prediction', val: (activeVerdictCard.statsJson as any)?.prd ?? 85 },
                            { label: 'MGR', name: 'Manager Score', val: (activeVerdictCard.statsJson as any)?.mgr ?? 80 },
                            { label: 'HOT', name: 'Hot Take', val: (activeVerdictCard.statsJson as any)?.hot ?? 88 },
                            { label: 'RST', name: 'Roast Score', val: (activeVerdictCard.statsJson as any)?.rst ?? 82 }
                          ],
                          countryFlag: profile.favoriteNation ? getFlagEmoji(profile.favoriteNation) : '🌍',
                          playerName: profile.username,
                          playerPosition: activeVerdictCard.rating >= 75 ? 'CF' : 'DM',
                          avatarStyle: profile.avatarStyle,
                          avatarSeed: profile.avatarSeed,
                          matchTitle: activeVerdictCard.matchTitle,
                          matchScore: activeVerdictCard.matchScore
                        }} />
                      ) : (
                        <SportsCenterCard data={{
                          text: `Loyal supporter of ${profile.favoriteNation || 'Argentina'}. Fighting for tactical ball knowledge in the 2026 tournament.`,
                          mode: 'court',
                          caseId: 1000,
                          fanbase: null,
                          isRivalry: false,
                          rarity: profile.overallRating >= 85 ? 'LEGENDARY' : (profile.overallRating >= 70 ? 'EPIC' : (profile.overallRating >= 45 ? 'RARE' : 'COMMON')),
                          ovr: profile.overallRating || 88,
                          rulingText: playstyle,
                          verdict: playstyle,
                          charge: `ACCURACY: ${accuracy}% OVER MATCHDAYS`,
                          sentence: `Total Matches Predicted: ${totalMatches} Resolved`,
                          ach: { title: 'Reputation', desc: 'Active Profile', badge },
                          stats: [
                            { label: 'PRD', name: 'Prediction', val: profile.predictionRating || 90 },
                            { label: 'MGR', name: 'Manager Score', val: profile.managerRating || 88 },
                            { label: 'HOT', name: 'Hot Take', val: profile.hotTakeRating || 85 },
                            { label: 'RST', name: 'Roast Score', val: profile.roastScore || 92 }
                          ],
                          countryFlag: profile.favoriteNation ? getFlagEmoji(profile.favoriteNation) : '🌍',
                          playerName: profile.username,
                          playerPosition: 'MGR',
                          avatarStyle: profile.avatarStyle,
                          avatarSeed: profile.avatarSeed
                        }} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4 z-20 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center bg-black/60 border border-white/15 rounded-2xl p-2.5 backdrop-blur-md">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest pl-1">
                      Share {activeRightTab === 'verdict' && activeVerdictCard ? 'Verdict Card' : 'Tournament Deck'}:
                    </span>

                    <div className="flex gap-2 items-center">
                      <button
                        onClick={handleDownloadPng}
                        disabled={downloading}
                        className="p-2 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 rounded-xl transition-all cursor-pointer"
                        title="Download Card PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          activeRightTab === 'verdict' && activeVerdictCard
                            ? `Check out my VAR Verdict Card for Match ${activeVerdictCard.matchId}! Rated ${activeVerdictCard.rating} OVR: ${activeVerdictCard.verdict.toUpperCase()}.`
                            : `Check out my official World Cup 2026 Tournament Manager Deck! Rated ${profile.overallRating} OVR (${playstyle}).`
                        )}&url=${encodeURIComponent(activeVerdictCard ? getShareUrl('card', activeVerdictCard.id) : getShareUrl('profile'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all cursor-pointer"
                        title="Post to X/Twitter"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          activeRightTab === 'verdict' && activeVerdictCard
                            ? `Check out my VAR Verdict Card for Match ${activeVerdictCard.matchId}! Rated ${activeVerdictCard.rating} OVR: ${activeVerdictCard.verdict.toUpperCase()}. ${getShareUrl('card', activeVerdictCard.id)}`
                            : `Check out my official World Cup 2026 Tournament Manager Deck! Rated ${profile.overallRating} OVR (${playstyle}). ${getShareUrl('profile')}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-400 rounded-xl transition-all cursor-pointer"
                        title="Send via WhatsApp"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.79-4.396c1.598.947 3.51 1.448 5.466 1.449 5.518 0 10.006-4.486 10.01-10.001.002-2.673-1.039-5.184-2.929-7.076-1.89-1.89-4.4-2.93-7.08-2.932-5.521 0-10.007 4.486-10.012 10.002-.002 1.897.486 3.754 1.412 5.37L2.836 21.3l4.01-.105z"/></svg>
                      </a>

                      <button
                        onClick={() => handleCopyLink('copy', activeVerdictCard ? getShareUrl('card', activeVerdictCard.id) : getShareUrl('profile'))}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer"
                        title="Copy Link"
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
