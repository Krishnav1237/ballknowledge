'use client';

import { useState, useEffect, use } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import SportsCenterCard from '@/components/SportsCenterCard';
import { getStoredProfile, getStoredPredictions, saveStoredPredictions, saveStoredProfile, LocalPrediction } from '@/lib/profileSync';
import { Sparkles, Trophy, Flame, AlertCircle, Share2, CheckCircle } from 'lucide-react';
import { Player, getRosterForTeam, getPlayerImageUrl, isPlayerAllowedForSlot } from '@/lib/roster';
import TacticalPitch from '@/components/TacticalPitch';
import PredictionModal from '@/components/PredictionModal';
import FlagImage from '@/components/FlagImage';
import MatchLiveChat from '@/components/MatchLiveChat';
import { parseLocalDate, getDeterministicMatchResult, getPlayerMatchRatings } from '@/lib/matchUtils';

const PITCH_SLOTS = [
  { id: 'GK', label: 'GK', category: 'GK' },
  { id: 'LB', label: 'LB', category: 'DEF' },
  { id: 'LCB', label: 'LCB', category: 'DEF' },
  { id: 'RCB', label: 'RCB', category: 'DEF' },
  { id: 'RB', label: 'RB', category: 'DEF' },
  { id: 'LCM', label: 'LCM', category: 'MID' },
  { id: 'CDM', label: 'CDM', category: 'MID' },
  { id: 'RCM', label: 'RCM', category: 'MID' },
  { id: 'LW', label: 'LW', category: 'FWD' },
  { id: 'ST', label: 'ST', category: 'FWD' },
  { id: 'RW', label: 'RW', category: 'FWD' }
];

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


export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = use(params);

  const [match, setMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [predictions, setPredictions] = useState<Record<string, LocalPrediction>>({});

  // Form inputs
  const [predHomeScore, setPredHomeScore] = useState<number>(0);
  const [predAwayScore, setPredAwayScore] = useState<number>(0);
  const [predScorer, setPredScorer] = useState<string>('');
  const [predMotm, setPredMotm] = useState<string>('');
  const [predPossession, setPredPossession] = useState<string>('3');
  const [takes, setTakes] = useState<{ statement: string; confidence: number }[]>([
    { statement: '', confidence: 50 }
  ]);

  // Squad Builder & Modal states
  const [lineup, setLineup] = useState<Record<string, Player>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  // Grading states
  const [resolving, setResolving] = useState(false);
  const [varText, setVarText] = useState('');
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [showProgression, setShowProgression] = useState(false);
  const [overallRatingAnimate, setOverallRatingAnimate] = useState(50);
  
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Inline toast state replaces all browser alert() calls
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setMounted(true);
    const fetchMatch = async () => {
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
          const foundMatch = matchesData.find((m: any) => m.id === matchId);
          setMatch(foundMatch);
          setTeams(teamsData);
        } else {
          throw new Error('Fetch failed');
        }
      } catch (err) {
        console.error('Failed to load remote match data:', err);
        setError('Failed to fetch real-time match details. Please verify your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();

    // Load user profile & predictions
    const userProfile = getStoredProfile();
    setProfile(userProfile);
    setOverallRatingAnimate(userProfile.overallRating);

    const userPreds = getStoredPredictions();
    setPredictions(userPreds);

    // If prediction exists for this match, populate form inputs
    const matchPred = userPreds[matchId];
    if (matchPred) {
      setPredHomeScore(matchPred.homeScore);
      setPredAwayScore(matchPred.awayScore);
      setPredScorer(matchPred.firstGoalscorer);
      setPredMotm(matchPred.motm);
      setPredPossession(matchPred.possessionWinner || '3');
      if (matchPred.hotTakes && matchPred.hotTakes.length > 0) {
        setTakes(matchPred.hotTakes);
      }
      if (matchPred.resolved && matchPred.card) {
        setGradingResult({ card: matchPred.card });
      }
      if (matchPred.lineup) {
        setLineup(matchPred.lineup as Record<string, Player>);
      }
    }

    const getFirstActiveSlot = (currentLineup: Record<string, Player>) => {
      const slots = ['ST', 'LW', 'RW', 'LCM', 'CDM', 'RCM', 'LB', 'LCB', 'RCB', 'RB', 'GK'];
      for (const s of slots) {
        if (!currentLineup[s]) return s;
      }
      return 'ST';
    };

    // Initialize selectedSlot to first empty position
    const initialSlot = getFirstActiveSlot((matchPred?.lineup || {}) as Record<string, Player>);
    setSelectedSlot(initialSlot);

    // Auto-open predictions/hot takes modal on page load if predictions are not locked and the match is upcoming
    const isLocked = matchPred && matchPred.locked;
    let isUpcoming = true;
    if (match) {
      const kickoff = parseLocalDate(match.local_date, match.stadium_id);
      const timeDiff = new Date().getTime() - kickoff.getTime();
      isUpcoming = timeDiff < 0;
    }
    if (!isLocked && !(matchPred?.resolved) && isUpcoming) {
      setShowPredictionModal(true);
    }
  }, [matchId, match]);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 text-2xl mb-4">⚠️</div>
        <p className="font-display font-black text-lg uppercase tracking-wider text-red-500 mb-2">Tribunal Offline</p>
        <p className="text-zinc-500 text-sm max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-5 py-2 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">Retry Connection</button>
      </div>
    );
  }

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#E11D48] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-zinc-400">Entering VAR Match Room...</p>
      </div>
    );
  }

  const homeTeam = teams.find(t => t.id === match.home_team_id) || { name_en: match.home_team_label || 'Home', flag: '', groups: 'A' };
  const awayTeam = teams.find(t => t.id === match.away_team_id) || { name_en: match.away_team_label || 'Away', flag: '', groups: 'A' };

  // Determine Match Status using real current time + finished flag
  const kickoff = parseLocalDate(match.local_date, match.stadium_id);
  const timeDiff = new Date().getTime() - kickoff.getTime();
  let status: 'UPCOMING' | 'LIVE' | 'COMPLETED' = 'UPCOMING';
  if (match.finished === 'TRUE' || timeDiff >= 2 * 60 * 60 * 1000) {
    status = 'COMPLETED';
  } else if (timeDiff >= 0) {
    status = 'LIVE';
  }

  // Admin overrides bypass
  const isAdmin = profile?.role === 'ADMIN';

  // Submissions locked state
  const isSubmissionLocked = status !== 'UPCOMING' && !isAdmin;

  // Max hot takes based on user role (FREE = 3, PREMIUM/ADMIN = 5)
  const maxTakes = profile?.role === 'FREE' ? 3 : 5;

  // Compute resolved lineup if match is completed to show live player performance ratings
  const resolvedLineup = status === 'COMPLETED' ? Object.keys(lineup).reduce((acc, slotId) => {
    const player = lineup[slotId];
    if (player) {
      const matchRatings = getPlayerMatchRatings(matchId, homeTeam?.name_en || '', awayTeam?.name_en || '', match);
      const pName = player.name.toLowerCase().trim();
      const matchRating = matchRatings[pName] || 
                          Object.entries(matchRatings).find(([k]) => pName.includes(k) || k.includes(pName))?.[1] ||
                          player.rating;
      acc[slotId] = {
        ...player,
        rating: matchRating
      };
    }
    return acc;
  }, {} as Record<string, Player>) : lineup;

  const handleAddTake = () => {
    if (takes.length < maxTakes) {
      setTakes([...takes, { statement: '', confidence: 50 }]);
    }
  };

  const handleTakeChange = (index: number, key: 'statement' | 'confidence', value: any) => {
    const newTakes = [...takes];
    newTakes[index] = { ...newTakes[index], [key]: value };
    setTakes(newTakes);
  };

  const handleRemoveTake = (index: number) => {
    if (takes.length > 1) {
      setTakes(takes.filter((_, i) => i !== index));
    }
  };

  const handleSelectPlayer = (player: Player) => {
    if (!selectedSlot) return;
    
    // Remove the player from any other slots they might be in
    const newLineup = { ...lineup };
    Object.entries(newLineup).forEach(([pos, p]) => {
      if (p.name === player.name && p.team === player.team) {
        delete newLineup[pos];
      }
    });

    newLineup[selectedSlot] = player;
    setLineup(newLineup);

    // Save as draft in predictions local storage
    const currentPred = predictions[matchId] || {
      matchId,
      homeScore: predHomeScore,
      awayScore: predAwayScore,
      firstGoalscorer: predScorer,
      motm: predMotm,
      possessionWinner: predPossession,
      hotTakes: takes,
      locked: false,
      resolved: false
    };
    
    const updatedPred = {
      ...currentPred,
      lineup: newLineup
    };
    const newPreds = { ...predictions, [matchId]: updatedPred };
    setPredictions(newPreds);
    saveStoredPredictions(newPreds);

    // Auto-advance to the next empty position slot
    const slots = ['ST', 'LW', 'RW', 'LCM', 'CDM', 'RCM', 'LB', 'LCB', 'RCB', 'RB', 'GK'];
    const nextEmpty = slots.find(s => !newLineup[s]);
    if (nextEmpty) {
      setSelectedSlot(nextEmpty);
    }
  };

  // Lock predictions
  const handleSavePredictions = () => {
    const filledPositions = Object.keys(lineup);
    if (filledPositions.length < 11) {
      showToast(`Select all 11 players first — ${filledPositions.length}/11 chosen.`, 'error');
      return;
    }

    // Also check score/prediction forms are filled
    if (predScorer.trim() === '' || predMotm.trim() === '' || predPossession === '') {
      showToast('Fill out all predictions (Goalscorer, MOTM, Confidence) first!', 'error');
      return;
    }

    const updatedPred: LocalPrediction = {
      matchId,
      homeScore: predHomeScore,
      awayScore: predAwayScore,
      firstGoalscorer: predScorer,
      motm: predMotm,
      possessionWinner: predPossession,
      hotTakes: takes.filter(t => t.statement.trim() !== ''),
      locked: true,
      resolved: false,
      lineup
    };

    const newPreds = { ...predictions, [matchId]: updatedPred };
    setPredictions(newPreds);
    saveStoredPredictions(newPreds);
    showToast('Predictions, hot takes & Best XI locked in! 🔒', 'success');
  };

  // Resolve match and trigger Football IQ progression
  const handleResolveMatch = async () => {
    if (!predictions[matchId]) {
      showToast('Submit your predictions before resolving this match!', 'error');
      return;
    }

    setResolving(true);
    setVarText('VAR official in Stockley Park review in progress...');
    
    // Animate VAR Review
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    await sleep(1500);
    setVarText('Auditing scoreline predictions against World Cup outcome...');
    
    await sleep(1500);
    setVarText('Summoning AI VAR tribunal to grade hot takes and confidence ranges...');
    
    await sleep(1800);
    setVarText('Football IQ Reputation algorithms updating overall status...');
    
    await sleep(1500);

    try {
      // POST to backend api
      const response = await fetch('/api/resolve-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          homeScore: predHomeScore,
          awayScore: predAwayScore,
          firstGoalscorer: predScorer,
          motm: predMotm,
          possessionWinner: predPossession,
          hotTakes: takes.filter(t => t.statement.trim() !== ''),
          profile: {
            username: profile.username,
            overallRating: profile.overallRating,
            predictionRating: profile.predictionRating,
            hotTakeRating: profile.hotTakeRating,
            role: profile.role
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Save to cache
        const updatedPred: LocalPrediction = {
          ...predictions[matchId],
          resolved: true,
          card: result.card
        };
        const newPreds = { ...predictions, [matchId]: updatedPred };
        setPredictions(newPreds);
        saveStoredPredictions(newPreds);

        // Update profile
        const updatedProfile = {
          ...profile,
          overallRating: result.profileUpdates.overallRating,
          predictionRating: result.profileUpdates.predictionRating,
          hotTakeRating: result.profileUpdates.hotTakeRating,
          collectedCards: [...(profile.collectedCards || []), result.card.id]
        };
        setProfile(updatedProfile);
        saveStoredProfile(updatedProfile);

        setGradingResult(result);
        setResolving(false);
        setShowProgression(true);

        // Animate rating count
        let count = profile.overallRating;
        const target = result.profileUpdates.overallRating;
        const speed = Math.abs(target - count) > 10 ? 40 : 80;
        const timer = setInterval(() => {
          if (count === target) {
            clearInterval(timer);
          } else {
            count += target > count ? 1 : -1;
            setOverallRatingAnimate(count);
          }
        }, speed);

      } else {
        throw new Error('Resolution failed');
      }
    } catch (err) {
      console.error(err);
      setResolving(false);
      showToast('Resolution error — please try again.', 'error');
    }
  };

  const handleClearSlot = (slotId: string) => {
    const newLineup = { ...lineup };
    delete newLineup[slotId];
    setLineup(newLineup);

    // Autosave
    const currentPred = predictions[matchId] || {
      matchId,
      homeScore: predHomeScore,
      awayScore: predAwayScore,
      firstGoalscorer: predScorer,
      motm: predMotm,
      possessionWinner: predPossession,
      hotTakes: takes,
      locked: false,
      resolved: false
    };
    const updatedPred = { ...currentPred, lineup: newLineup };
    const newPreds = { ...predictions, [matchId]: updatedPred };
    setPredictions(newPreds);
    saveStoredPredictions(newPreds);
  };

  const hasSubmitted = !!predictions[matchId];
  const isResolved = hasSubmitted && predictions[matchId].resolved && gradingResult;

  const actualResult = getDeterministicMatchResult(matchId, homeTeam.name_en, awayTeam.name_en, match);

  const handleCopyLink = () => {
    if (isResolved && gradingResult?.card?.id) {
      const shareUrl = `${window.location.origin}/card/${gradingResult.card.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white overflow-hidden pt-[52px]">

      {/* ── Inline Toast Notification ── */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold shadow-xl backdrop-blur-md transition-all animate-fade-in-down ${
          toast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />
          }
          {toast.message}
        </div>
      )}

      {/* Premium Light Stadium Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <NextImage 
          src="/images/match_details_bg.webp" 
          alt="Match Dugout Background" 
          fill 
          className="object-cover opacity-[0.52] object-center scale-102" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-background/20 to-background" />
      </div>

      {/* VAR Simulation Loading Screen */}
      {resolving && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-50 flex flex-col justify-center items-center p-6 text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#881337] animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-double border-[#E11D48] animate-pulse flex items-center justify-center">
              <span className="font-display font-black text-xs text-white">VAR</span>
            </div>
          </div>
          <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-2">Stockley Park Auditing</h2>
          <p className="text-zinc-200 text-sm max-w-md leading-relaxed animate-pulse">{varText}</p>
        </div>
      )}

      {/* Football IQ Progression Reveal Panel */}
      {showProgression && gradingResult && (
        <div className="fixed inset-0 bg-zinc-950/65 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-6 text-center overflow-y-auto text-white">
          <div className="max-w-md w-full bg-[#0B0F19]/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="inline-flex items-center gap-1.5 bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Football IQ Progression
            </div>
            
            <h2 className="font-display font-black text-3xl text-white uppercase tracking-tight leading-none mb-1">
              Match Graded!
            </h2>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">World Cup 2026 Season</p>

            {/* Rating Evolution Visualizer */}
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Old IQ</span>
                <span className="font-display font-black text-3xl text-gray-400">{profile?.overallRating - (gradingResult.profileUpdates.overallDelta || 0)}</span>
              </div>

              <div className="relative w-28 h-28 rounded-full border-4 border-double border-[#E11D48] bg-black/40 flex flex-col justify-center items-center shadow-md">
                <span className="text-[9px] font-black text-[#E11D48] uppercase tracking-widest">Overall IQ</span>
                <span className="font-display font-black text-4xl text-white leading-none mt-1 animate-pulse-slow">
                  {overallRatingAnimate}
                </span>
                <span className={`text-[10px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${
                  gradingResult.profileUpdates.overallDelta >= 0 ? 'bg-green-950/40 text-green-400 border border-green-900/30' : 'bg-red-950/40 text-red-400 border border-red-900/30'
                }`}>
                  {gradingResult.profileUpdates.overallDelta >= 0 ? `+${gradingResult.profileUpdates.overallDelta}` : gradingResult.profileUpdates.overallDelta}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">New IQ</span>
                <span className="font-display font-black text-3xl text-white">{gradingResult.profileUpdates.overallRating}</span>
              </div>
            </div>

            {/* Scorecard Deltas */}
            <div className="space-y-3 mb-8 text-left bg-black/30 border border-white/5 rounded-2xl p-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-gray-400">Prediction Rating Delta:</span>
                <span className={gradingResult.profileUpdates.predictionDelta >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {gradingResult.profileUpdates.predictionDelta >= 0 ? `+${gradingResult.profileUpdates.predictionDelta}` : gradingResult.profileUpdates.predictionDelta}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-gray-400">Hot Take Rating Delta:</span>
                <span className={gradingResult.profileUpdates.hotTakeDelta >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {gradingResult.profileUpdates.hotTakeDelta >= 0 ? `+${gradingResult.profileUpdates.hotTakeDelta}` : gradingResult.profileUpdates.hotTakeDelta}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold border-t border-white/10 pt-2 mt-2">
                <span className="text-[#E11D48] font-bold uppercase tracking-wider">Card Rarity Claimed:</span>
                <span className="text-white font-black uppercase tracking-wider">{gradingResult.card.rarity}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <Link
                href={`/card/${gradingResult.card.id}`}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#881337] to-[#E11D48] text-white font-display font-black text-sm uppercase tracking-widest shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer text-center block"
              >
                Go to Card Customization Page →
              </Link>
              <button
                onClick={() => setShowProgression(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-display font-black text-xs uppercase tracking-widest hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                Stay on Match Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 pt-6">

        {isResolved ? (
          /* Resolved View: Card & Progression Details */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Verdict Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider mb-4 w-full text-center">
                Your Match Verdict Card
              </h3>
              
              <div className="scale-90 min-[370px]:scale-95 sm:scale-100 origin-top my-1">
                <SportsCenterCard data={{
                  text: gradingResult.card.evidence.replace('Hot Take statement: "', '').replace('" (VAR grading:', ''),
                  mode: 'take',
                  caseId: 2026,
                  fanbase: null,
                  isRivalry: false,
                  rarity: gradingResult.card.rarity,
                  ovr: gradingResult.card.rating,
                  rulingText: gradingResult.card.verdict,
                  verdict: gradingResult.card.verdict,
                  charge: gradingResult.card.charge,
                  sentence: gradingResult.card.sentence,
                  ach: { title: 'Reputation', desc: 'Graded', badge: '🔥' },
                  stats: [
                    { label: 'PRD', name: 'Prediction', val: (gradingResult.card.statsJson as any)?.prd ?? (gradingResult.card.statsJson as any)?.predictionPerfScore ?? gradingResult.card.rating },
                    { label: 'MGR', name: 'Manager Score', val: (gradingResult.card.statsJson as any)?.mgr ?? (gradingResult.card.statsJson as any)?.tacticalRating ?? Math.max(30, Math.min(99, gradingResult.card.rating - 3)) },
                    { label: 'HOT', name: 'Hot Take', val: (gradingResult.card.statsJson as any)?.hot ?? (gradingResult.card.statsJson as any)?.avgTakeOvr ?? Math.max(30, Math.min(99, gradingResult.card.rating + 2)) },
                    { label: 'RST', name: 'Roast Score', val: (gradingResult.card.statsJson as any)?.rst ?? (gradingResult.card.statsJson as any)?.communityRating ?? Math.max(50, Math.min(99, gradingResult.card.rating + 1)) }
                  ],
                  cardTheme: gradingResult.card.cardTheme || 'gold',
                  aiImageUrl: gradingResult.card.aiImageUrl,
                  countryFlag: profile?.favoriteNation ? profile.favoriteNation : '🌍',
                  playerName: profile?.username || 'MANAGER',
                  playerPosition: gradingResult.card.rating >= 75 ? 'CF' : 'DM',
                  avatarStyle: profile?.avatarStyle || 'fun-emoji',
                  avatarSeed: profile?.avatarSeed || 'Reputation',
                  matchTitle: `${homeTeam.name_en} vs ${awayTeam.name_en}`,
                  matchScore: `${actualResult.homeScore} - ${actualResult.awayScore}`
                }} />
              </div>

              {/* Share Card Block */}
              <div className="mt-6 flex flex-col gap-3 w-full max-w-[340px]">
                <div className="flex justify-between items-center bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Share Verdict:</span>
                  <div className="flex gap-2 items-center">
                    {/* X/Twitter Share */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `I just graded my VAR Verdict Card for ${homeTeam.name_en} vs ${awayTeam.name_en} (${actualResult.homeScore}-${actualResult.awayScore})! Rated ${gradingResult.card.rating} OVR: ${gradingResult.card.verdict.toUpperCase()}.`
                      )}&url=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/card/${gradingResult.card.id}` : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 hover:bg-white/15 rounded-lg text-white transition-colors cursor-pointer"
                      title="Post to X/Twitter"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>

                    {/* WhatsApp Share */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `Check out my VAR Verdict Card for ${homeTeam.name_en} vs ${awayTeam.name_en} (${actualResult.homeScore}-${actualResult.awayScore})! Graded at ${gradingResult.card.rating} OVR: ${gradingResult.card.verdict.toUpperCase()}. ${typeof window !== 'undefined' ? `${window.location.origin}/card/${gradingResult.card.id}` : ''}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                      title="Send via WhatsApp"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.79-4.396c1.598.947 3.51 1.448 5.466 1.449 5.518 0 10.006-4.486 10.01-10.001.002-2.673-1.039-5.184-2.929-7.076-1.89-1.89-4.4-2.93-7.08-2.932-5.521 0-10.007 4.486-10.012 10.002-.002 1.897.486 3.754 1.412 5.37L2.836 21.3l4.01-.105z"/></svg>
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className="p-2 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors cursor-pointer"
                      title="Copy Link"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Link
                  href={`/card/${gradingResult.card.id}`}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#881337] to-[#E11D48] hover:brightness-110 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center block shadow-lg"
                >
                  Customise & Download High-Res Card →
                </Link>
              </div>
            </div>

            {/* Right Column: Dynamic Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel border border-white/10 bg-[#0B0F19]/80 rounded-3xl p-6 md:p-8 text-white shadow-sm backdrop-blur-md">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#E11D48]" /> Graded Performance Summary
                </h3>

                <div className="space-y-4">
                  {/* Actual Score vs Prediction */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score Prediction Outcome</p>
                      <p className="text-sm font-bold text-white">
                        Your Prediction: <span className="text-[#E11D48]">{predHomeScore} - {predAwayScore}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Actual Outcome: <span className="text-gray-200 font-semibold">{actualResult.homeScore} - {actualResult.awayScore}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-green-400 bg-green-950/20 border border-green-900/30 px-3 py-1.5 rounded-lg">
                        {predHomeScore === actualResult.homeScore && predAwayScore === actualResult.awayScore ? 'Exact Score (+15)' : (
                          (predHomeScore > predAwayScore && actualResult.homeScore > actualResult.awayScore) ||
                          (predHomeScore < predAwayScore && actualResult.homeScore < actualResult.awayScore) ||
                          (predHomeScore === predAwayScore && actualResult.homeScore === actualResult.awayScore) ? 'Correct Outcome (+5)' : 'Incorrect Outcome (-2)'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Hot Take AI Grading Summary */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hot Take VAR Grader Result</p>
                    {takes.map((t, idx) => (
                      <div key={idx} className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
                        <p className="text-sm italic font-medium text-gray-200 leading-relaxed">&ldquo;{t.statement}&rdquo;</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-mono text-gray-400">Confidence: <span className="text-gray-200 font-bold">{t.confidence}%</span></span>
                          <span className="text-[10px] font-mono text-gray-400">VAR rating: <span className="text-[#E11D48] font-bold">{gradingResult.gradedTakes?.[idx]?.ovr ?? 50} OVR</span></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Settings Override Bypasser Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 italic mt-4">
                    <AlertCircle className="w-4 h-4 shrink-0 text-gray-500" />
                    Permanently saved to your World Cup 2026 Season record. View total progress in &quot;My Card&quot;.
                  </div>
                </div>
              </div>
            </div>

            {/* Best XI Showcase pitch */}
            <div className="lg:col-span-12 mt-8 space-y-4">
              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] font-black text-[#E11D48] uppercase tracking-wider">Tactical Retrospective</span>
                <h3 className="font-display font-black text-xl uppercase tracking-wider text-white mt-1">
                  Your Best XI Locked Lineup
                </h3>
              </div>
              <div className="w-full max-w-[480px] sm:max-w-[520px] mx-auto" style={{aspectRatio: '3/4'}}>
                <TacticalPitch
                  lineup={resolvedLineup}
                  isReadOnly={true}
                  isSubmissionLocked={isSubmissionLocked}
                  homeTeamName={homeTeam.name_en}
                  onSlotClick={(slotId) => {
                    setSelectedSlot(slotId);
                  }}
                  onClearSlot={handleClearSlot}
                />
              </div>
            </div>

          </div>
        ) : (
          /* Submission Screen – full-width scoreboard + pitch/list no-scroll layout */
          <div
            className="flex flex-col overflow-hidden"
            style={{ height: 'calc(100vh - 88px)' }}
          >
            {/* ══ Row 1: Full-width Match Scoreboard with BIG score ══ */}
            <div className="shrink-0 bg-[#0B0F19]/80 border border-white/10 rounded-2xl px-5 py-3 mb-3 shadow-md backdrop-blur-md">
              <div className="flex items-center gap-4">
                {/* Home Team */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FlagImage countryName={homeTeam.name_en} size="lg" />
                  <span className="font-display font-black text-xl lg:text-2xl uppercase tracking-tight text-white truncate">{homeTeam.name_en}</span>
                </div>
                {/* Centre: Big Score */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="font-display font-black text-4xl lg:text-5xl leading-none tracking-wider">
                    {status === 'UPCOMING'
                      ? <span className="text-gray-500">- : -</span>
                      : <span className="text-white">
                          {match.home_score !== '' && match.home_score !== null && match.home_score !== undefined
                            ? `${match.home_score} : ${match.away_score}`
                            : '- : -'
                          }
                        </span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                      {match.type === 'r32' ? 'Round of 32' : match.type === 'r16' ? 'Round of 16' : match.type === 'qf' ? 'Quarter Final' : match.type === 'sf' ? 'Semi Final' : match.type === 'final' ? 'FINAL' : `Group ${match.group}`}
                    </span>
                    <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                      status === 'LIVE' ? 'text-red-400 bg-red-950/20 border-red-900/30'
                      : status === 'COMPLETED' ? 'text-gray-400 bg-black/30 border-white/10'
                      : 'text-[#E11D48] bg-[#E11D48]/10 border-[#E11D48]/20'
                    }`}>
                      {status === 'LIVE' ? '● LIVE' : status === 'COMPLETED' ? 'FULL TIME' : 'PREDICTIONS OPEN'}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      {mounted ? kickoff.toLocaleString(undefined, {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }) : match.local_date}
                    </span>
                  </div>
                </div>
                {/* Away Team */}
                <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                  <span className="font-display font-black text-xl lg:text-2xl uppercase tracking-tight text-white truncate text-right">{awayTeam.name_en}</span>
                  <FlagImage countryName={awayTeam.name_en} size="lg" />
                </div>
                {/* Edit Predictions button */}
                <button
                  onClick={() => setShowPredictionModal(true)}
                  className="shrink-0 py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#E11D48]/40 hover:bg-[#E11D48]/5 text-gray-300 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-[#E11D48]" />
                  Edit Picks
                </button>
              </div>
            </div>

            {/* ══ Row 2: Pitch (63%) + Player Selector (37%) ══ */}
            <div className="flex flex-1 gap-3 overflow-hidden min-h-0">
              {/* Left: Tactical Pitch — 63% width, full row height */}
              <div className="shrink-0 overflow-hidden rounded-2xl" style={{ width: '63%' }}>

                <TacticalPitch
                  lineup={resolvedLineup}
                  isReadOnly={false}
                  isSubmissionLocked={isSubmissionLocked}
                  homeTeamName={homeTeam.name_en}
                  onSlotClick={(slotId) => { setSelectedSlot(slotId); }}
                  onClearSlot={handleClearSlot}
                />
              </div>

              {/* Right: Status-aware panel — chat when LIVE/COMPLETED, selector when UPCOMING */}
              <div className="flex-1 flex flex-col gap-2 overflow-hidden min-w-0">

                {/* ── LIVE / COMPLETED → Chat Panel ── */}
                {(status === 'LIVE' || status === 'COMPLETED') ? (
                  <div className="flex-1 bg-[#0B0F19]/80 border border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0 backdrop-blur-md">
                    <MatchLiveChat
                      matchId={matchId}
                      isLive={status === 'LIVE'}
                      isCompleted={status === 'COMPLETED'}
                      homeTeam={homeTeam.name_en}
                      awayTeam={awayTeam.name_en}
                      managerAlias={profile?.username}
                    />
                  </div>
                ) : (
                  /* ── UPCOMING → Player Selector ── */
                  <div className="flex-1 bg-[#0B0F19]/80 border border-white/10 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0 backdrop-blur-md">
                    {selectedSlot ? (
                      <>
                        {/* Selector header */}
                        <div className="px-3 py-2.5 border-b border-white/10 flex justify-between items-center shrink-0 bg-black/20">
                          <div>
                            <span className="text-[8px] font-black text-[#E11D48] uppercase tracking-widest">Select Player</span>
                            <div className="font-display font-black text-xs uppercase tracking-wider text-white">
                              {selectedSlot} — {PITCH_SLOTS.find(s => s.id === selectedSlot)?.category}
                            </div>
                          </div>
                          <div className="text-[9px] font-mono font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            {Object.keys(lineup).length}/11
                          </div>
                        </div>

                        {/* Player list */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
                          {(() => {
                            const activeSlot = PITCH_SLOTS.find(s => s.id === selectedSlot);
                            if (!activeSlot) return null;
                            const sortedRoster = [
                              ...getRosterForTeam(homeTeam.name_en, homeTeam.flag),
                              ...getRosterForTeam(awayTeam.name_en, awayTeam.flag)
                            ]
                              .filter(p => isPlayerAllowedForSlot(p, activeSlot.id))
                              .sort((a, b) => b.rating - a.rating);

                            return sortedRoster.map((player, idx) => {
                              const isChosenElsewhere = Object.entries(lineup).some(([, p]) => p.name === player.name && p.team === player.team);
                              const isChosenHere = lineup[selectedSlot]?.name === player.name && lineup[selectedSlot]?.team === player.team;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => { if (!isChosenElsewhere) handleSelectPlayer(player); }}
                                  className={`flex items-center justify-between px-4.5 py-3.5 rounded-xl border transition-all ${
                                    isChosenHere ? 'bg-[#E11D48]/10 border-[#E11D48]'
                                    : isChosenElsewhere ? 'bg-black/20 border-white/5 opacity-45 cursor-not-allowed'
                                    : 'bg-black/10 border-white/5 hover:bg-white/5 hover:border-white/15 cursor-pointer'
                                  }`}
                                >
                                  <div className="flex items-center gap-3.5">
                                    {/* Player Headshot with Flag Badge */}
                                    <div className="relative w-12 h-12 shrink-0">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={getPlayerImageUrl(player.name)}
                                        alt={player.name}
                                        className="w-full h-full object-contain rounded-full bg-black/20 border border-white/10"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.onerror = null; // Prevent infinite loop recursion
                                          target.src = "https://media.api-sports.io/football/players/154.png";
                                        }}
                                      />
                                      <div className="absolute -bottom-1 -right-1 shadow-sm">
                                        <FlagImage countryName={player.team} size="xs" />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-display font-black text-sm uppercase tracking-wide text-white leading-tight">{player.name}</div>
                                      <div className="text-[10px] text-gray-400 font-bold uppercase leading-tight mt-1">{player.team} • {player.specificPosition}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {isChosenElsewhere && <span className="text-[9px] font-black uppercase bg-black/30 text-gray-400 px-2 py-1 rounded">Used</span>}
                                    {isChosenHere && <span className="text-[9px] font-black uppercase bg-[#E11D48]/15 text-[#E11D48] px-2 py-1 rounded">✓</span>}
                                    <span className="font-mono font-black text-base text-[#E11D48]">{player.rating}</span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <Sparkles className="w-7 h-7 text-green-500/25 mb-2" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tap a position</p>
                        <p className="text-[10px] text-zinc-500 mt-1 max-w-[160px] leading-normal">Click any slot on the pitch to see players for that position.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons — always visible at bottom */}
                <div className="shrink-0 space-y-1.5">
                  {status === 'LIVE' && (
                    <div className="bg-red-950/20 border border-red-900/30 text-red-400 px-3 py-2 rounded-xl flex items-center gap-2 text-[9px] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      Match is LIVE — predictions locked. Join the chat! 💬
                    </div>
                  )}
                  {status === 'COMPLETED' && !hasSubmitted && (
                    <div className="bg-black/30 border border-white/10 text-gray-400 px-3 py-2 rounded-xl flex items-center gap-2 text-[9px] font-semibold">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Match ended — no submission made.
                    </div>
                  )}
                  {!isSubmissionLocked && (
                    <button
                      onClick={handleSavePredictions}
                      className="w-full py-3 rounded-xl bg-[#881337] hover:bg-[#881337]/80 text-white font-display font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Lock Predictions & Squad
                    </button>
                  )}
                  {status === 'COMPLETED' && hasSubmitted && (
                    <button
                      onClick={handleResolveMatch}
                      disabled={resolving}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#881337] to-[#E11D48] text-white font-display font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                      {resolving ? 'VAR In Progress...' : 'VAR Tribunal: Grade Match'}
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}



        {showPredictionModal && (
          <PredictionModal
            homeTeam={{ name_en: homeTeam.name_en, flag: homeTeam.flag }}
            awayTeam={{ name_en: awayTeam.name_en, flag: awayTeam.flag }}
            predHomeScore={predHomeScore}
            setPredHomeScore={setPredHomeScore}
            predAwayScore={predAwayScore}
            setPredAwayScore={setPredAwayScore}
            predScorer={predScorer}
            setPredScorer={setPredScorer}
            predMotm={predMotm}
            setPredMotm={setPredMotm}
            predPossession={predPossession}
            setPredPossession={setPredPossession}
            takes={takes}
            maxTakes={maxTakes}
            handleAddTake={handleAddTake}
            handleRemoveTake={handleRemoveTake}
            handleTakeChange={handleTakeChange}
            isSubmissionLocked={isSubmissionLocked}
            status={status}
            onClose={() => setShowPredictionModal(false)}
            onSaveDraft={() => {
              const updatedTakes = takes.filter(t => t.statement.trim() !== '');
              const currentPred = predictions[matchId] || {
                matchId,
                homeScore: predHomeScore,
                awayScore: predAwayScore,
                firstGoalscorer: predScorer,
                motm: predMotm,
                possessionWinner: predPossession,
                hotTakes: updatedTakes,
                locked: false,
                resolved: false
              };
              const updatedPred = {
                ...currentPred,
                homeScore: predHomeScore,
                awayScore: predAwayScore,
                firstGoalscorer: predScorer,
                motm: predMotm,
                possessionWinner: predPossession,
                hotTakes: updatedTakes
              };
              const newPreds = { ...predictions, [matchId]: updatedPred };
              setPredictions(newPreds);
              saveStoredPredictions(newPreds);
              setShowPredictionModal(false);
            }}
          />
        )}

      </div>
    </div>
  );
}

