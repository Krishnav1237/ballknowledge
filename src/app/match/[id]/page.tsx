'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import SportsCenterCard from '@/components/SportsCenterCard';
import { getStoredProfile, getStoredPredictions, saveStoredPredictions, saveStoredProfile, LocalPrediction } from '@/lib/profileSync';
import { Shield, Sparkles, Lock, ArrowLeft, Trophy, Flame, Play, AlertCircle, Share2, Clipboard } from 'lucide-react';

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

// Deterministic result helper matching the backend resolution logic
function getDeterministicMatchResult(matchId: string, homeTeamName: string, awayTeamName: string) {
  let hash = 0;
  const str = matchId + homeTeamName + awayTeamName;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const homeScore = Math.abs((hash >> 4) % 4); // 0 to 3
  const awayScore = Math.abs((hash >> 8) % 3); // 0 to 2
  
  const scorers = ["Messi", "Mbappe", "Ronaldo", "Bellingham", "Vinicius", "Kane", "Musiala", "Yamal", "Haaland", "Griezmann"];
  const firstGoalscorer = scorers[Math.abs(hash % scorers.length)];
  const motm = scorers[Math.abs((hash >> 2) % scorers.length)];
  const possessionWinner = homeScore > awayScore ? homeTeamName : (awayScore > homeScore ? awayTeamName : "Draw");
  
  return {
    homeScore,
    awayScore,
    firstGoalscorer,
    motm,
    possessionWinner
  };
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
  const [predPossession, setPredPossession] = useState<string>('');
  const [takes, setTakes] = useState<{ statement: string; confidence: number }[]>([
    { statement: '', confidence: 50 }
  ]);

  // Grading states
  const [resolving, setResolving] = useState(false);
  const [varStep, setVarStep] = useState(0);
  const [varText, setVarText] = useState('');
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [showProgression, setShowProgression] = useState(false);
  const [overallRatingAnimate, setOverallRatingAnimate] = useState(50);
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
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
          const foundMatch = matchesData.find((m: any) => m.id === matchId);
          setMatch(foundMatch);
          setTeams(teamsData);
        } else {
          throw new Error('Fetch failed');
        }
      } catch (err) {
        console.warn('Failed to load remote match data, falling back to local files:', err);
        try {
          const matchesData = require('@/lib/worldcup2026/football.matches.json');
          const teamsData = require('@/lib/worldcup2026/football.teams.json');
          const foundMatch = matchesData.find((m: any) => m.id === matchId);
          setMatch(foundMatch);
          setTeams(teamsData);
        } catch (localErr) {
          console.error('Failed to load local match details:', localErr);
        }
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
      setPredPossession(matchPred.possessionWinner);
      if (matchPred.hotTakes && matchPred.hotTakes.length > 0) {
        setTakes(matchPred.hotTakes);
      }
      if (matchPred.resolved && matchPred.card) {
        setGradingResult({ card: matchPred.card });
      }
    }
  }, [matchId]);

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-gray-500">Entering VAR Match Room...</p>
      </div>
    );
  }

  const homeTeam = teams.find(t => t.id === match.home_team_id) || { name_en: 'Home', flag: '', groups: 'A' };
  const awayTeam = teams.find(t => t.id === match.away_team_id) || { name_en: 'Away', flag: '', groups: 'A' };

  // Determine Match Status
  const kickoff = parseLocalDate(match.local_date);
  const timeDiff = SYSTEM_DATE.getTime() - kickoff.getTime();
  let status: 'UPCOMING' | 'LIVE' | 'COMPLETED' = 'UPCOMING';
  if (timeDiff >= 2 * 60 * 60 * 1000) {
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

  // Lock predictions
  const handleSavePredictions = () => {
    const updatedPred: LocalPrediction = {
      matchId,
      homeScore: predHomeScore,
      awayScore: predAwayScore,
      firstGoalscorer: predScorer,
      motm: predMotm,
      possessionWinner: predPossession,
      hotTakes: takes.filter(t => t.statement.trim() !== ''),
      locked: true,
      resolved: false
    };

    const newPreds = { ...predictions, [matchId]: updatedPred };
    setPredictions(newPreds);
    saveStoredPredictions(newPreds);
    alert('Match Day predictions and takes locked in successfully!');
  };

  // Resolve match and trigger Football IQ progression
  const handleResolveMatch = async () => {
    if (!predictions[matchId]) {
      alert('You must submit predictions before resolving this match!');
      return;
    }

    setResolving(true);
    setVarStep(1);
    setVarText('VAR official in Stockley Park review in progress...');
    
    // Animate VAR Review
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    await sleep(1500);
    setVarStep(2);
    setVarText('Auditing scoreline predictions against World Cup outcome...');
    
    await sleep(1500);
    setVarStep(3);
    setVarText('Summoning AI VAR tribunal to grade hot takes and confidence ranges...');
    
    await sleep(1800);
    setVarStep(4);
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
      alert('Error occurred during match resolution. Please try again.');
    }
  };

  const hasSubmitted = !!predictions[matchId];
  const isResolved = hasSubmitted && predictions[matchId].resolved && gradingResult;

  const actualResult = getDeterministicMatchResult(matchId, homeTeam.name_en, awayTeam.name_en);

  const handleCopyLink = () => {
    if (isResolved && gradingResult?.card?.id) {
      const shareUrl = `${window.location.origin}/card/${gradingResult.card.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white pb-20 overflow-hidden">
      <Navbar />

      {/* Futuristic Dugout Stadium Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/match_details_bg.webp" 
          alt="Match Dugout Background" 
          fill 
          className="object-cover opacity-35 object-center scale-102" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0A0A0A]/40 to-[#0A0A0A]" />
      </div>

      {/* VAR Simulation Loading Screen */}
      {resolving && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col justify-center items-center p-6 text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#881337] animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-double border-[#D97706] animate-pulse flex items-center justify-center">
              <span className="font-display font-black text-xs text-white">VAR</span>
            </div>
          </div>
          <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-2">Stockley Park Auditing</h2>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed animate-pulse">{varText}</p>
        </div>
      )}

      {/* Football IQ Progression Reveal Panel */}
      {showProgression && gradingResult && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-6 text-center overflow-y-auto">
          <div className="max-w-md w-full bg-[#0B0F19] border border-white/5 rounded-3xl p-8 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#D97706]/15 border border-[#D97706]/30 text-amber-500 rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Football IQ Progression
            </div>
            
            <h2 className="font-display font-black text-3xl text-white uppercase tracking-tight leading-none mb-1">
              Match Graded!
            </h2>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">World Cup 2026 Season</p>

            {/* Rating Evolution Visualizer */}
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Old IQ</span>
                <span className="font-display font-black text-3xl text-gray-400">{profile?.overallRating - (gradingResult.profileUpdates.overallDelta || 0)}</span>
              </div>

              <div className="relative w-28 h-28 rounded-full border-4 border-double border-[#D97706] bg-black flex flex-col justify-center items-center shadow-lg">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Overall IQ</span>
                <span className="font-display font-black text-4xl text-white leading-none mt-1 animate-pulse-slow">
                  {overallRatingAnimate}
                </span>
                <span className={`text-[10px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${
                  gradingResult.profileUpdates.overallDelta >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {gradingResult.profileUpdates.overallDelta >= 0 ? `+${gradingResult.profileUpdates.overallDelta}` : gradingResult.profileUpdates.overallDelta}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">New IQ</span>
                <span className="font-display font-black text-3xl text-white">{gradingResult.profileUpdates.overallRating}</span>
              </div>
            </div>

            {/* Scorecard Deltas */}
            <div className="space-y-3 mb-8 text-left bg-black/40 border border-white/5 rounded-2xl p-4">
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
              <div className="flex justify-between items-center text-xs font-semibold border-t border-white/5 pt-2 mt-2">
                <span className="text-amber-500 font-bold uppercase tracking-wider">Card Rarity Claimed:</span>
                <span className="text-white font-black uppercase tracking-wider">{gradingResult.card.rarity}</span>
              </div>
            </div>

            <button
              onClick={() => setShowProgression(false)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#881337] to-[#D97706] text-white font-display font-black text-sm uppercase tracking-widest shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
            >
              Collect Verdict Card & View Card
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-[80px]">
        {/* Back Link */}
        <Link href="/world-cup-hub" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to World Cup Hub
        </Link>

        {/* Match Header Plaque */}
        <div className="glass-panel border-white/5 bg-[#0B0F19]/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl mb-8">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D97706] mb-1">
              Group {match.group} • Matchday {match.matchday}
            </span>
            <h2 className="font-display font-black text-lg text-white uppercase tracking-wider">
              {match.type === 'group' ? 'Group Stage Fixture' : 'Knockout Bracket'}
            </h2>
            <p className="text-xs text-gray-400 font-semibold">{match.local_date}</p>
          </div>

          {/* Teams scoreboard banner */}
          <div className="flex items-center justify-center gap-6 md:gap-12 flex-1 max-w-xl">
            <div className="flex flex-col items-center text-center gap-2 flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={homeTeam.flag} alt="" className="w-14 h-9 object-cover rounded shadow-md border border-white/5" />
              <span className="font-display font-black text-sm text-white uppercase tracking-wider line-clamp-1">{homeTeam.name_en}</span>
            </div>

            <div className="flex flex-col justify-center items-center shrink-0">
              <div className="font-display font-black text-3xl text-white tracking-tighter px-6 py-2.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                <span>{status === 'COMPLETED' || status === 'LIVE' ? actualResult.homeScore : '-'}</span>
                <span className="text-gray-600 font-normal">:</span>
                <span>{status === 'COMPLETED' || status === 'LIVE' ? actualResult.awayScore : '-'}</span>
              </div>
              
              {/* Live/Upcoming Tag */}
              <div className="mt-2.5">
                {status === 'COMPLETED' && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-green-400 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/25">
                    Completed
                  </span>
                )}
                {status === 'LIVE' && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 animate-pulse flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-current" /> Live Now
                  </span>
                )}
                {status === 'UPCOMING' && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    Predictions Open
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2 flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={awayTeam.flag} alt="" className="w-14 h-9 object-cover rounded shadow-md border border-white/5" />
              <span className="font-display font-black text-sm text-white uppercase tracking-wider line-clamp-1">{awayTeam.name_en}</span>
            </div>
          </div>

        </div>

        {/* Resolved View: Card & Progression Details */}
        {isResolved ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Verdict Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider mb-4 w-full text-center">
                Your Match Verdict Card
              </h3>
              
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
                  { label: 'IQ', name: 'Ball IQ', val: gradingResult.card.rating },
                  { label: 'DEL', name: 'Delusion', val: 100 - gradingResult.card.rating }
                ],
                cardTheme: gradingResult.card.cardTheme || 'gold',
                countryFlag: profile?.favoriteNation === 'Argentina' ? '🇦🇷' : '🌍',
                playerName: profile?.username || 'MANAGER',
                playerPosition: gradingResult.card.rating >= 75 ? 'CF' : 'DM'
              }} />

              {/* Share Card Block */}
              <div className="mt-6 flex gap-3 w-full max-w-[340px]">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-3 px-4 rounded-xl bg-surface border border-white/10 hover:border-[#D97706]/40 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-amber-500" />
                  {copied ? 'Link Copied!' : 'Share Card Link'}
                </button>
              </div>
            </div>

            {/* Right Column: Dynamic Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel border-white/5 bg-[#0B0F19]/40 rounded-3xl p-6 md:p-8">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> Graded Performance Summary
                </h3>

                <div className="space-y-4">
                  {/* Actual Score vs Prediction */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Score Prediction Outcome</p>
                      <p className="text-sm font-bold text-white">
                        Your Prediction: <span className="text-amber-500">{predHomeScore} - {predAwayScore}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Actual Outcome: <span className="text-white font-semibold">{actualResult.homeScore} - {actualResult.awayScore}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                        {predHomeScore === actualResult.homeScore && predAwayScore === actualResult.awayScore ? 'Exact Score (+15)' : (
                          (predHomeScore > predAwayScore && actualResult.homeScore > actualResult.awayScore) ||
                          (predHomeScore < predAwayScore && actualResult.homeScore < actualResult.awayScore) ||
                          (predHomeScore === predAwayScore && actualResult.homeScore === actualResult.awayScore) ? 'Correct Outcome (+5)' : 'Incorrect Outcome (-2)'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Hot Take AI Grading Summary */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hot Take VAR Grader Result</p>
                    {takes.map((t, idx) => (
                      <div key={idx} className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
                        <p className="text-sm italic font-medium text-white leading-relaxed">&ldquo;{t.statement}&rdquo;</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-mono text-gray-400">Confidence: <span className="text-white font-bold">{t.confidence}%</span></span>
                          <span className="text-[10px] font-mono text-gray-400">VAR rating: <span className="text-amber-500 font-bold">{gradingResult.gradedTakes?.[idx]?.ovr ?? 50} OVR</span></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Settings Override Bypasser Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 italic mt-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Permanently saved to your World Cup 2026 Season record. View total progress in &quot;My Card&quot;.
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Submission Screen (Upcoming/Live Fixtures) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Columns: Predictions & Hot Takes Form */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Form Section 1: Predictions */}
              <div className="glass-panel border-white/5 bg-[#0B0F19]/40 rounded-3xl p-6 md:p-8">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#881337] flex items-center justify-center text-xs font-black text-white shrink-0">01</span>
                  Match Predictions
                </h3>

                <div className="space-y-6">
                  {/* Scoreline */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Predict Scoreline</label>
                    <div className="flex items-center gap-6 max-w-xs">
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase truncate">{homeTeam.name_en}</span>
                        <input
                          type="number"
                          min="0"
                          value={predHomeScore}
                          disabled={isSubmissionLocked}
                          onChange={e => setPredHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl text-center font-display font-black text-xl text-white focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                        />
                      </div>
                      <span className="text-gray-600 font-bold text-xl pt-4">:</span>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase truncate">{awayTeam.name_en}</span>
                        <input
                          type="number"
                          min="0"
                          value={predAwayScore}
                          disabled={isSubmissionLocked}
                          onChange={e => setPredAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl text-center font-display font-black text-xl text-white focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scorer, MOTM, Possession */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">First Goalscorer</label>
                      <input
                        type="text"
                        placeholder="e.g. Messi"
                        value={predScorer}
                        disabled={isSubmissionLocked}
                        onChange={e => setPredScorer(e.target.value)}
                        className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Man of the Match</label>
                      <input
                        type="text"
                        placeholder="e.g. Yamal"
                        value={predMotm}
                        disabled={isSubmissionLocked}
                        onChange={e => setPredMotm(e.target.value)}
                        className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Possession Winner</label>
                      <select
                        value={predPossession}
                        disabled={isSubmissionLocked}
                        onChange={e => setPredPossession(e.target.value)}
                        className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                      >
                        <option value="">Select winner...</option>
                        <option value={homeTeam.name_en}>{homeTeam.name_en}</option>
                        <option value={awayTeam.name_en}>{awayTeam.name_en}</option>
                        <option value="Draw">Draw</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Form Section 2: Hot Takes */}
              <div className="glass-panel border-white/5 bg-[#0B0F19]/40 rounded-3xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#881337] flex items-center justify-center text-xs font-black text-white shrink-0">02</span>
                    Match Hot Takes
                  </h3>
                  {!isSubmissionLocked && takes.length < maxTakes && (
                    <button
                      onClick={handleAddTake}
                      className="px-3.5 py-1.5 rounded-lg border border-[#D97706]/40 hover:border-[#D97706] text-[#D97706] hover:bg-[#D97706]/5 text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      + Add Take
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {takes.map((take, idx) => (
                    <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Take #{idx + 1}</span>
                        {!isSubmissionLocked && takes.length > 1 && (
                          <button
                            onClick={() => handleRemoveTake(idx)}
                            className="text-xs text-red-500 hover:text-red-400 font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-8">
                          <input
                            type="text"
                            placeholder="e.g. Mbappe scores but France loses on penalties..."
                            value={take.statement}
                            disabled={isSubmissionLocked}
                            onChange={e => handleTakeChange(idx, 'statement', e.target.value)}
                            className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-medium text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                          />
                        </div>
                        <div className="sm:col-span-4 flex flex-col justify-center gap-1">
                          <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Confidence</span>
                            <span className="text-[#D97706]">{take.confidence}%</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="99"
                            value={take.confidence}
                            disabled={isSubmissionLocked}
                            onChange={e => handleTakeChange(idx, 'confidence', parseInt(e.target.value))}
                            className="w-full h-1 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#D97706] disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Submission locks description */}
                  {status === 'LIVE' && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mt-4">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>This match is currently LIVE. Prediction submissions are locked.</span>
                    </div>
                  )}

                  {status === 'COMPLETED' && !hasSubmitted && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mt-4">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>This match is COMPLETED. Since you did not lock in predictions before kickoff, this match cannot be graded.</span>
                    </div>
                  )}

                  {/* Actions */}
                  {!isSubmissionLocked && (
                    <button
                      onClick={handleSavePredictions}
                      className="w-full py-4 rounded-xl bg-[#881337] hover:bg-[#881337]/90 text-white font-display font-black text-sm uppercase tracking-widest shadow-md transition-all active:scale-[0.98] mt-4"
                    >
                      Lock Predictions & Takes
                    </button>
                  )}

                  {status === 'COMPLETED' && hasSubmitted && (
                    <button
                      onClick={handleResolveMatch}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#881337] to-[#D97706] text-white font-display font-black text-sm uppercase tracking-widest shadow-md transition-all active:scale-[0.98] mt-4"
                    >
                      Summon Stockley Park VAR & Grade Match
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* Right Columns: Tactical Lineups (V2) & Live Chat (V3) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* V2 Module: Tactical Picks */}
              <div className="relative glass-panel border-white/5 bg-[#0B0F19]/40 rounded-3xl p-5 shadow-lg overflow-hidden min-h-[200px] flex flex-col justify-between">
                {/* Premium Lock Overlay */}
                <div className="absolute inset-0 bg-[#030712]/75 backdrop-blur-xs z-10 flex flex-col justify-center items-center p-6 text-center select-none">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-black text-xs text-white uppercase tracking-widest mb-1">V2: Tactical Picks</h4>
                  <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed">
                    Build your squad lineup and nominate your captains. Unlocks in Season Phase 2.
                  </p>
                </div>

                <div className="opacity-15 pointer-events-none space-y-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tactical Lineups</span>
                  <div className="h-28 bg-[#111827] rounded-xl flex items-center justify-center font-mono text-xs">
                    Virtual Pitch Grid
                  </div>
                </div>
              </div>

              {/* V3 Module: Match Chat */}
              <div className="relative glass-panel border-white/5 bg-[#0B0F19]/40 rounded-3xl p-5 shadow-lg overflow-hidden min-h-[220px] flex flex-col justify-between">
                {/* Premium Lock Overlay */}
                <div className="absolute inset-0 bg-[#030712]/75 backdrop-blur-xs z-10 flex flex-col justify-center items-center p-6 text-center select-none">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-black text-xs text-white uppercase tracking-widest mb-1">V3: Live Chat</h4>
                  <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed">
                    Roast rivals and tag other managers in real-time. Unlocks in Season Phase 3.
                  </p>
                </div>

                <div className="opacity-15 pointer-events-none space-y-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Match Discussion Feed</span>
                  <div className="space-y-2">
                    <div className="bg-[#111827] h-6 rounded-lg w-3/4" />
                    <div className="bg-[#111827] h-6 rounded-lg w-1/2" />
                    <div className="bg-[#111827] h-6 rounded-lg w-5/6" />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
