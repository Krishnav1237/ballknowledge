'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import SportsCenterCard from '@/components/SportsCenterCard';
import { ShieldAlert, Trophy, Share2, CheckCircle, Shield, Download, Send } from 'lucide-react';
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

const getSystemDate = () => new Date();

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = use(params);
  const username = decodeURIComponent(rawUsername);

  const [profile, setProfile] = useState<any | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'UPCOMING' | 'PREDICTED'>('ALL');
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'verdict' | 'deck'>('verdict');

  const [pedestalTiltStyle, setPedestalTiltStyle] = useState({});
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const cardPedestalRef = useRef<HTMLDivElement>(null);
  // Separate ref attached directly to the SportsCenterCard root (340×480) for clean PNG export
  const cardCaptureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
        if (!res.ok) {
          setErrorMsg('Manager Dossier not found or classified.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProfile(data.profile);
        setCards(data.cards || []);

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
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to connect to VAR Tribunal Database.');
      } finally {
        setLoading(false);
      }
    }
    fetchPublicProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#881337] border-t-[#E11D48] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-zinc-400">Authenticating Dossier Access...</p>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-center items-center px-4">
        <div className="bg-[#0B0F19]/90 border border-rose-900/40 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-xl">
          <ShieldAlert className="w-12 h-12 text-[#E11D48] mx-auto mb-4" />
          <h2 className="font-display font-black text-2xl uppercase tracking-wider mb-2">DOSSIER NOT FOUND</h2>
          <p className="text-gray-400 text-xs mb-6 leading-relaxed">{errorMsg || 'The requested manager profile does not exist.'}</p>
          <Link href="/" className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-[#881337] to-[#E11D48] text-white font-display font-black text-xs uppercase tracking-widest shadow-md hover:scale-105 transition-transform">
            Return to Hub
          </Link>
        </div>
      </div>
    );
  }

  const totalMatches = cards.length;
  let exactCount = 0;

  cards.forEach(c => {
    if ((c.statsJson as any)?.exactScore) exactCount++;
  });

  const accuracy = totalMatches > 0 ? Math.round((exactCount / totalMatches) * 100) : 0;
  const totalAlbumSlots = 16;
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
    const now = getSystemDate();
    const timeDiff = now.getTime() - kickoff.getTime();
    if (match.finished === 'TRUE' || timeDiff >= 2 * 60 * 60 * 1000) {
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
    // Use the direct card ref (340×480 intrinsic) rather than the scaled pedestal wrapper
    const captureTarget = cardCaptureRef.current || cardPedestalRef.current;
    if (!captureTarget) return;
    setDownloading(true);
    try {
      // Temporarily zero out any inline transform so html-to-image captures at true size
      const prevTransform = captureTarget.style.transform;
      captureTarget.style.transform = 'none';

      const dataUrl = await toPng(captureTarget, {
        cacheBust: true,
        width: 340,
        height: 480,
        pixelRatio: 3,
        backgroundColor: 'transparent',
        // Prevents cross-origin CSS fetch error for Google Fonts in production
        skipFonts: true,
      });

      captureTarget.style.transform = prevTransform;

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

  const handleInstaShare = async (urlStr: string) => {
    await handleDownloadPng();
    handleCopyLink('insta', urlStr);
  };


  const getPublicCardForMatch = (matchId: string) => {
    return cards.find(c => c.matchId === matchId);
  };

  const constructPublicMatchCardObj = (match: Match) => {
    const homeTeam = teams.find(t => String(t.id) === String(match.home_team_id)) || { name_en: match.home_team_label || (match as any).home_team_name_en || 'Home', flag: '', fifa_code: '' };
    const awayTeam = teams.find(t => String(t.id) === String(match.away_team_id)) || { name_en: match.away_team_label || (match as any).away_team_name_en || 'Away', flag: '', fifa_code: '' };
    const claimedCard = getPublicCardForMatch(match.id);

    if (!claimedCard) {
      // Unpredicted match slot: LOCKED state with actual match info, no mock ratings/verdicts
      return {
        id: `unpredicted-${match.id}`,
        matchId: match.id,
        rating: 0,
        verdict: 'UNPREDICTED',
        charge: 'LOCKED FIXTURE',
        sentence: 'No prediction submitted',
        evidence: 'No prediction data found.',
        rarity: 'COMMON',
        matchTitle: `${homeTeam.name_en} vs ${awayTeam.name_en}`,
        matchScore: (match.finished === 'TRUE' || getMatchStatus(match) === 'COMPLETED') ? `${match.home_score} - ${match.away_score}` : undefined,
        homeFlag: homeTeam.flag,
        awayFlag: awayTeam.flag,
        homeFifaCode: (homeTeam as any).fifa_code || homeTeam.name_en?.slice(0, 3).toUpperCase(),
        awayFifaCode: (awayTeam as any).fifa_code || awayTeam.name_en?.slice(0, 3).toUpperCase(),
        isPredicted: false,
        statsJson: { prd: 0, mgr: 0, hot: 0, rst: 0 }
      };
    }

    // Resolved card: pull actual database card payload (no mock data)
    return {
      id: claimedCard.id,
      matchId: match.id,
      rating: claimedCard.rating,
      verdict: claimedCard.verdict,
      charge: claimedCard.charge,
      sentence: claimedCard.sentence,
      evidence: claimedCard.evidence,
      rarity: claimedCard.rarity,
      matchTitle: `${homeTeam.name_en} vs ${awayTeam.name_en}`,
      matchScore: (match.finished === 'TRUE' || getMatchStatus(match) === 'COMPLETED') ? `${match.home_score} - ${match.away_score}` : undefined,
      homeFlag: homeTeam.flag,
      awayFlag: awayTeam.flag,
      homeFifaCode: (homeTeam as any).fifa_code || homeTeam.name_en?.slice(0, 3).toUpperCase(),
      awayFifaCode: (awayTeam as any).fifa_code || awayTeam.name_en?.slice(0, 3).toUpperCase(),
      isPredicted: true,
      statsJson: claimedCard.statsJson
    };
  };

  // ── Round of 32 only ──────────────────────────────────────────────────────
  const r32Matches = matches.filter(m => m.type === 'r32');
  const predictedMatches = r32Matches.filter(m => getPublicCardForMatch(m.id));
  const earnedCards = predictedMatches.map(m => constructPublicMatchCardObj(m));

  // 2. Exactly one locked card for each rarity to showcase tiers
  const lockedCards = [
    {
      id: 'locked-common',
      matchId: 'locked-common',
      rating: 42,
      rarity: 'COMMON',
      verdict: 'LOCKED COMMON',
      charge: 'LOCKED STICKER SLOT',
      sentence: 'Predict matches to unlock Common cards',
      evidence: 'No prediction data found.',
      matchTitle: 'LOCKED SLOT',
      isPredicted: false,
      countryFlag: '🔒',
      statsJson: { prd: 40, mgr: 40, hot: 40, rst: 40, ovr: 40 }
    },
    {
      id: 'locked-rare',
      matchId: 'locked-rare',
      rating: 62,
      rarity: 'RARE',
      verdict: 'LOCKED RARE',
      charge: 'LOCKED STICKER SLOT',
      sentence: 'Predict matches to unlock Rare cards',
      evidence: 'No prediction data found.',
      matchTitle: 'LOCKED SLOT',
      isPredicted: false,
      countryFlag: '🔒',
      statsJson: { prd: 60, mgr: 60, hot: 60, rst: 60, ovr: 60 }
    },
    {
      id: 'locked-epic',
      matchId: 'locked-epic',
      rating: 76,
      rarity: 'EPIC',
      verdict: 'LOCKED EPIC',
      charge: 'LOCKED STICKER SLOT',
      sentence: 'Predict matches to unlock Epic cards',
      evidence: 'No prediction data found.',
      matchTitle: 'LOCKED SLOT',
      isPredicted: false,
      countryFlag: '🔒',
      statsJson: { prd: 75, mgr: 75, hot: 75, rst: 75, ovr: 75 }
    },
    {
      id: 'locked-legendary',
      matchId: 'locked-legendary',
      rating: 88,
      rarity: 'LEGENDARY',
      verdict: 'LOCKED LEGENDARY',
      charge: 'LOCKED STICKER SLOT',
      sentence: 'Predict matches to unlock Legendary cards',
      evidence: 'No prediction data found.',
      matchTitle: 'LOCKED SLOT',
      isPredicted: false,
      countryFlag: '🔒',
      statsJson: { prd: 90, mgr: 90, hot: 90, rst: 90, ovr: 90 }
    }
  ];

  const allDisplayCards = [...earnedCards, ...lockedCards];

  // ── Filter + slice logic (R32 only) ──────────────────────────────────────
  const getFilteredCards = () => {
    if (filterStatus === 'ALL') {
      return allDisplayCards;
    }

    if (filterStatus === 'COMPLETED') {
      return r32Matches
        .filter(m => getMatchStatus(m) === 'COMPLETED')
        .sort((a, b) =>
          parseLocalDate(b.local_date, b.stadium_id).getTime() -
          parseLocalDate(a.local_date, a.stadium_id).getTime()
        )
        .slice(0, 5)
        .map(m => constructPublicMatchCardObj(m));
    }

    if (filterStatus === 'UPCOMING') {
      return r32Matches
        .filter(m => getMatchStatus(m) === 'UPCOMING' || getMatchStatus(m) === 'LIVE')
        .sort((a, b) =>
          parseLocalDate(a.local_date, a.stadium_id).getTime() -
          parseLocalDate(b.local_date, b.stadium_id).getTime()
        )
        .slice(0, 5)
        .map(m => constructPublicMatchCardObj(m));
    }

    if (filterStatus === 'PREDICTED') {
      return earnedCards;
    }

    return allDisplayCards;
  };

  const filteredCards = getFilteredCards();

  const renderCardSlot = (cardObj: any) => {
    const isLocked = cardObj.matchId.startsWith('locked-');
    const match = matches.find(m => m.id === cardObj.matchId);
    
    const homeTeam = match 
      ? (teams.find(t => String(t.id) === String(match.home_team_id)) || { name_en: match.home_team_label || (match as any).home_team_name_en || 'Home', flag: 'https://flagcdn.com/w80/un.png' }) 
      : { name_en: 'Locked', flag: '' };
    const awayTeam = match 
      ? (teams.find(t => String(t.id) === String(match.away_team_id)) || { name_en: match.away_team_label || (match as any).away_team_name_en || 'Away', flag: 'https://flagcdn.com/w80/un.png' }) 
      : { name_en: 'Slot', flag: '' };

    const isSelected = selectedCard?.matchId === cardObj.matchId;

    let borderGlow = 'border-white/20';
    let textGlow = 'text-gray-300';
    let ringColor = 'ring-white';
    if (cardObj.rarity === 'LEGENDARY') { borderGlow = 'border-amber-400/50'; textGlow = 'text-amber-400'; ringColor = 'ring-amber-400'; }
    else if (cardObj.rarity === 'EPIC') { borderGlow = 'border-purple-400/50'; textGlow = 'text-purple-400'; ringColor = 'ring-purple-400'; }
    else if (cardObj.rarity === 'RARE') { borderGlow = 'border-blue-500/50'; textGlow = 'text-blue-400'; ringColor = 'ring-blue-400'; }
    else { borderGlow = 'border-rose-500/40'; textGlow = 'text-rose-400'; ringColor = 'ring-rose-500'; }

    const publicCard = match ? getPublicCardForMatch(match.id) : null;

    return (
      <div
        key={cardObj.id}
        onClick={() => {
          setSelectedCard(cardObj);
          setActiveRightTab('verdict');
        }}
        className={`cursor-pointer relative z-10 group filter drop-shadow-md transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${
          isSelected ? `ring-2 ${ringColor} ring-offset-2 ring-offset-black scale-[1.02]` : ''
        }`}
      >
        <div className={`min-h-[116px] w-full overflow-hidden bg-[#0B0F19]/95 border ${borderGlow} rounded-2xl p-3 flex flex-col justify-between backdrop-blur-md shadow-lg transition-all duration-200 hover:shadow-xl`}>
          {/* TOP: rating + flags + rarity badge */}
          <div className="flex justify-between items-start gap-2 min-w-0">
            <div className="flex flex-col items-start min-w-0 shrink-0">
              <span className="font-display font-black text-xl leading-none text-white tracking-tighter">{cardObj.rating}</span>
              <div className="flex gap-1 mt-1 items-center flex-wrap">
                {isLocked ? (
                  <span className="text-[10px]">🔒</span>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={homeTeam.flag || 'https://flagcdn.com/w80/un.png'} alt="" className="w-4 h-3 object-cover rounded-sm border border-white/10" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={awayTeam.flag || 'https://flagcdn.com/w80/un.png'} alt="" className="w-4 h-3 object-cover rounded-sm border border-white/10" />
                  </>
                )}
                {!isLocked && match && getMatchStatus(match) === 'COMPLETED' && (
                  <span className="font-mono text-[7px] font-black text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/20 whitespace-nowrap">
                    {match.home_score}-{match.away_score}
                  </span>
                )}
                {!isLocked && match && publicCard && getMatchStatus(match) === 'UPCOMING' && (
                  <span className="font-mono text-[7px] font-black text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/20 whitespace-nowrap">
                    {publicCard.homeScore || publicCard.predHomeScore || 0}-{publicCard.awayScore || publicCard.predAwayScore || 0}
                  </span>
                )}
              </div>
            </div>
            <span className={`shrink-0 text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/80 border border-white/10 ${textGlow}`}>
              {cardObj.rarity.slice(0, 3)}
            </span>
          </div>

          {/* MIDDLE: verdict label */}
          <div className="overflow-hidden py-1">
            <p className="font-display font-black text-[10px] text-white tracking-wide uppercase leading-tight line-clamp-1 text-center">
              {cardObj.verdict}
            </p>
          </div>

          {/* BOTTOM: group / inspect */}
          <div className="border-t border-white/10 pt-1.5 flex justify-between items-center gap-1 min-w-0">
            <span className="text-[7.5px] font-black text-zinc-400 uppercase tracking-widest truncate min-w-0">
              {isLocked ? 'LOCKED SLOT' : match?.type === 'r32' ? 'ROUND OF 32' : match?.type === 'r16' ? 'ROUND OF 16' : match?.type === 'qf' ? 'QUARTER FINAL' : match?.type === 'sf' ? 'SEMI FINAL' : `GROUP ${match?.group || 'STAGE'}`}
            </span>
            <span className="shrink-0 text-[7.5px] text-amber-400 group-hover:text-amber-300 transition-all font-black uppercase tracking-widest">INSPECT</span>
          </div>
        </div>
      </div>
    );
  };

  const activeVerdictCard = selectedCard || (earnedCards.length > 0 ? earnedCards[0] : lockedCards[3]);

  const activeShareUrl = activeVerdictCard ? getShareUrl('card', activeVerdictCard.id) : getShareUrl('profile');
  const activeShareText = activeRightTab === 'verdict' && activeVerdictCard
    ? `Check out ${profile.username}'s VAR Verdict Card for Match ${activeVerdictCard.matchId}! Rated ${activeVerdictCard.rating} OVR: ${activeVerdictCard.verdict.toUpperCase()}.`
    : `Check out ${profile.username}'s official World Cup 2026 Tournament Manager Deck! Rated ${profile.overallRating} OVR (${playstyle}).`;

  return (
    <div className="relative min-h-screen bg-[#030712] text-white flex flex-col justify-between pt-[52px] select-none">
      
      {/* Background Stadium Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/world_cup_stadium.webp" 
          alt="World Cup Stadium background" 
          fill 
          className="object-cover object-center opacity-[0.48]" 
          priority 
        />
        <div className="absolute inset-0 bg-[#030712]/75" />
      </div>

      <div className="relative z-10 w-full flex-grow flex flex-col min-h-0">
        
        {/* Header Panel merged seamlessly with Navbar */}
        <div className="shrink-0 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md px-6 sm:px-12 py-5 flex flex-col items-center justify-center text-center w-full shadow-lg">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider leading-none">
            {profile.username}&apos;S <span className="text-[#E11D48]">BINDER</span>
          </h1>
          <p className="text-zinc-400 text-[10px] sm:text-xs mt-2.5 font-black uppercase tracking-widest leading-none">
            WORLD CUP 2026 DOSSIER <span className="text-zinc-600 mx-2">•</span> EARNED VERDICT CARDS
          </p>
        </div>

        <div className="px-6 sm:px-12 py-8 relative flex-grow w-full flex flex-col">
          
          {/* TOP ROW: Filters (left) + Deck/Verdict Switcher (right) — exact same horizontal line */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 mb-3 items-center">
            {/* LEFT: Filters + Stats */}
            <div className="lg:col-span-7 flex flex-wrap items-center gap-5">
              <div className="bg-black/40 border border-white/5 p-1 rounded-xl flex gap-0.5 w-fit shadow-inner">
                {[
                  { id: 'ALL',       label: 'R32',        sub: 'all 16'    },
                  { id: 'COMPLETED', label: 'Completed',  sub: 'last 5'    },
                  { id: 'UPCOMING',  label: 'Upcoming',   sub: 'next 5'    },
                  { id: 'PREDICTED', label: 'My Picks',   sub: 'predicted' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex flex-col items-center ${
                      filterStatus === f.id
                        ? 'bg-[#E11D48] text-white shadow-[0_0_8px_rgba(225,29,72,0.3)]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight">{f.label}</span>
                    <span className={`text-[7px] uppercase tracking-widest leading-none mt-0.5 ${ filterStatus === f.id ? 'text-white/70' : 'text-zinc-600' }`}>{f.sub}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Progress:</span>
                  <span className="text-xs font-black text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                    {totalMatches}/{totalAlbumSlots} <span className="text-[#E11D48] text-[10px] ml-1 font-bold">{albumProgressPercent}%</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Accuracy:</span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    {accuracy}%
                  </span>
                </div>
              </div>
            </div>
            {/* SPACER: divider column */}
            <div className="hidden lg:block lg:col-span-1" />
            {/* RIGHT: Deck/Verdict Switcher — same row as filters */}
            <div className="lg:col-span-4 flex">
              <div className="flex bg-black/60 border border-white/15 p-1 rounded-xl shadow-md w-full z-20">
                <button
                  onClick={() => setActiveRightTab('deck')}
                  className={`flex-1 py-2 px-3 rounded-lg font-display font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeRightTab === 'deck'
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Trophy className="w-4 h-4" /> Tournament Deck
                </button>
                <button
                  onClick={() => setActiveRightTab('verdict')}
                  className={`flex-1 py-2 px-3 rounded-lg font-display font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeRightTab === 'verdict'
                      ? 'bg-gradient-to-r from-[#881337] to-[#E11D48] text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4" /> Verdict Card
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT GRID: card slots (left) + divider + card preview (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 flex-grow items-stretch">
            
            {/* LEFT PAGE: ALBUM SLOTS GRID WITH SMOOTH TRACKPAD SCROLL CONTAINER */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
                {/* Trackpad & Touch Native Scroll Container */}
                <div 
                  className="overflow-y-auto max-h-[660px] pr-2 space-y-2.5 custom-scrollbar touch-pan-y overscroll-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {filteredCards.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center border border-dashed border-white/15 rounded-2xl bg-black/20">
                      <ShieldAlert className="w-8 h-8 text-gray-400 mb-2.5" />
                      <p className="font-display font-black text-xs text-gray-300 uppercase tracking-widest">No matching slots found on this matchday</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-1">
                      {filteredCards.map(card => renderCardSlot(card))}
                    </div>
                  )}
                </div>
              </div>

              {/* VERTICAL DIVIDER LINE */}
              <div className="hidden lg:flex lg:col-span-1 justify-center items-stretch">
                <div className="w-[1px] h-full bg-gradient-to-b from-white/0 via-white/10 to-white/0" />
              </div>

              <div className="lg:col-span-4 lg:sticky lg:top-4 h-fit flex flex-col items-center justify-start gap-2 relative overflow-hidden self-start bg-[#090D16]/98 border border-white/10 rounded-2xl pt-3 pb-4 px-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)] w-full">

                <div className="flex flex-col items-center justify-center w-full relative z-20">
                  <div ref={cardPedestalRef} className="relative flex justify-center items-center h-full w-full">
                    <div 
                      onMouseMove={handlePedestalMouseMove}
                      onMouseLeave={handlePedestalMouseLeave}
                      style={pedestalTiltStyle}
                      className="relative card-3d-tilt origin-center scale-[0.82] min-[380px]:scale-[0.84] sm:scale-[0.86] lg:scale-[0.84] xl:scale-[0.88] -my-8 lg:-my-10"
                    >
                      {activeRightTab === 'verdict' && activeVerdictCard ? (
                        <SportsCenterCard cardRef={cardCaptureRef} data={{
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
                          aiImageUrl: activeVerdictCard.aiImageUrl || undefined,
                          matchTitle: activeVerdictCard.matchTitle,
                          matchScore: activeVerdictCard.matchScore,
                          homeFlag: activeVerdictCard.homeFlag,
                          awayFlag: activeVerdictCard.awayFlag,
                          homeFifaCode: (activeVerdictCard as any).homeFifaCode,
                          awayFifaCode: (activeVerdictCard as any).awayFifaCode,
                          isPredicted: activeVerdictCard.isPredicted,
                        }} />
                      ) : (
                        <SportsCenterCard cardRef={cardCaptureRef} data={{
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
                          avatarSeed: profile.avatarSeed,
                          aiImageUrl: (profile.avatarSeed.startsWith('http') || profile.avatarSeed.startsWith('data:image')) ? profile.avatarSeed : undefined
                        }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* HIGH-SET SHARE PLINTH WITH ALL SOCIAL PLATFORMS */}
                <div className="border-t border-white/10 pt-1 z-20 flex flex-col gap-1">
                  <div className="flex justify-between items-center bg-black/70 border border-white/15 rounded-xl p-2 backdrop-blur-md shadow-lg">
                    <span className="text-[9.5px] font-black text-gray-300 uppercase tracking-widest pl-1">
                      Instant Share:
                    </span>

                    <div className="flex gap-1.5 items-center">
                      {/* PNG Download */}
                      <button
                        onClick={handleDownloadPng}
                        disabled={downloading}
                        className="p-2 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Download High-Res Card PNG"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Instagram Stories */}
                      <button
                        onClick={() => handleInstaShare(activeShareUrl)}
                        className="p-2 bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 text-white rounded-xl transition-all cursor-pointer shadow-sm hover:opacity-90"
                        title="Share on Instagram Stories (Downloads PNG + Copies Link)"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </button>

                      {/* X / Twitter */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(activeShareText)}&url=${encodeURIComponent(activeShareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Post to X/Twitter"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${activeShareText} ${activeShareUrl}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-400 rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Send via WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.79-4.396c1.598.947 3.51 1.448 5.466 1.449 5.518 0 10.006-4.486 10.01-10.001.002-2.673-1.039-5.184-2.929-7.076-1.89-1.89-4.4-2.93-7.08-2.932-5.521 0-10.007 4.486-10.012 10.002-.002 1.897.486 3.754 1.412 5.37L2.836 21.3l4.01-.105z"/></svg>
                      </a>

                      {/* Telegram */}
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(activeShareUrl)}&text=${encodeURIComponent(activeShareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-sky-500/20 hover:bg-sky-500/35 border border-sky-500/40 text-sky-300 rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Share on Telegram"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>

                      {/* Reddit */}
                      <a
                        href={`https://www.reddit.com/submit?url=${encodeURIComponent(activeShareUrl)}&title=${encodeURIComponent(activeShareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-orange-500/20 hover:bg-orange-500/35 border border-orange-500/40 text-orange-400 rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Post on Reddit"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.196-.491.957 0 1.73.774 1.73 1.73 0 .727-.447 1.347-1.08 1.604.024.208.037.42.037.636 0 3.208-3.707 5.81-8.281 5.81-4.575 0-8.282-2.602-8.282-5.81 0-.212.012-.422.036-.628A1.73 1.73 0 0 1 3.27 12.5c0-.956.773-1.73 1.73-1.73.473 0 .898.188 1.209.503 1.192-.852 2.84-1.416 4.66-1.493l.93-4.359c.032-.15.158-.261.31-.261l3.056.644c.164-.537.665-.933 1.25-.933zM9.25 13c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1zm5.5 0c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1zm-4.75 3.5c-.265 0-.424.16-.424.32 0 1.06 1.09 1.68 2.424 1.68 1.333 0 2.424-.62 2.424-1.68 0-.16-.159-.32-.424-.32z"/></svg>
                      </a>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink('copy', activeShareUrl)}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Copy Direct Link"
                      >
                        {copiedPlatform === 'copy' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
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
