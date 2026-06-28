'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import SportsCenterCard from '@/components/SportsCenterCard';
import { Trophy, Share2, CheckCircle, Home, Download, Shield, Sparkles } from 'lucide-react';
import { getFlagEmoji } from '@/lib/matchUtils';
import { getStoredProfile, getStoredPredictions } from '@/lib/profileSync';

interface CardDetailClientProps {
  initialCard: any;
  profile: any;
}

export default function CardDetailClient({ initialCard, profile: initialProfile }: CardDetailClientProps) {
  const [card, setCard] = useState(initialCard);
  const [profileState, setProfileState] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<'verdict' | 'manager'>('verdict');
  const [tiltStyle, setTiltStyle] = useState({});
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const cardNodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hydrate from localStorage if available
    const localProf = getStoredProfile();
    if (localProf && localProf.username) {
      setProfileState((prev: any) => ({
        ...prev,
        username: localProf.username || prev.username,
        favoriteNation: localProf.favoriteNation || prev.favoriteNation,
        overallRating: localProf.overallRating || prev.overallRating,
        predictionRating: localProf.predictionRating,
        managerRating: localProf.managerRating,
        hotTakeRating: localProf.hotTakeRating,
        roastScore: localProf.roastScore,
        avatarSeed: localProf.avatarSeed
      }));
    }

    const localPreds = getStoredPredictions();
    const matchIdKey = initialCard?.matchId || initialCard?.id;
    if (localPreds && matchIdKey && localPreds[matchIdKey]) {
      const pred = localPreds[matchIdKey] as any;
      setCard((prev: any) => ({
        ...prev,
        rating: pred.cardRating || prev.rating,
        verdict: pred.verdict || prev.verdict,
        charge: pred.charge || prev.charge,
        sentence: pred.sentence || prev.sentence,
        evidence: pred.hotTakes?.[0]?.statement ? `Hot Take statement: "${pred.hotTakes[0].statement}"` : prev.evidence
      }));
    }
  }, [initialCard]);

  const showStatus = (text: string, type: 'success' | 'error' | 'info') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleDownloadPng = async () => {
    if (!cardNodeRef.current) return;
    setDownloading(true);
    showStatus('Preparing high-resolution PNG export...', 'info');
    try {
      const dataUrl = await toPng(cardNodeRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      const cardTypeLabel = activeTab === 'verdict' ? 'Verdict_Card' : 'Manager_Deck';
      link.download = `${profileState.username.replace(/\s+/g, '_')}_${cardTypeLabel}.png`;
      link.href = dataUrl;
      link.click();
      showStatus(`${activeTab === 'verdict' ? 'Verdict Card' : 'Manager Deck'} PNG exported successfully!`, 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showStatus('Failed to export card image.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleGenerateAiBg = async () => {
    setGenerating(true);
    showStatus('Synthesizing dynamic country-themed background via OpenRouter...', 'info');
    try {
      const response = await fetch('/api/generate-viral-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          username: profileState.username,
          faceImage: profileState.avatarSeed,
          favoriteNation: profileState.favoriteNation,
          overallRating: card.rating,
          predictionRating: (card.statsJson as any)?.prd,
          hotTakeRating: (card.statsJson as any)?.hot,
          managerRating: (card.statsJson as any)?.mgr,
          roastScore: (card.statsJson as any)?.rst,
          verdict: card.verdict,
          charge: card.charge,
          sentence: card.sentence
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.aiImageUrl) {
          setCard((prev: any) => ({
            ...prev,
            aiImageUrl: result.aiImageUrl
          }));
          showStatus('Cosmic card background unlocked successfully!', 'success');
        } else {
          showStatus('OpenRouter image generation failed. Key may be missing/unfunded.', 'error');
        }
      } else {
        showStatus('Server returned error during AI image synthesis.', 'error');
      }
    } catch (err) {
      console.error(err);
      showStatus('Network error occurred during image generation.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = -(y / (box.height / 2)) * 10;
    const tiltY = (x / (box.width / 2)) * 10;
    setTiltStyle({
      transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.05s ease'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease'
    });
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/card/${card.id}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-foreground flex flex-col justify-between pt-[56px] pb-8 px-4 md:px-8 select-none">
      
      {/* Inline Status Message */}
      {statusMsg && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-xl transition-all animate-fade-in-down ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
            : statusMsg.type === 'error'
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
            : 'bg-amber-500/20 border-amber-500/40 text-amber-200'
        }`}>
          {statusMsg.text}
        </div>
      )}
      
      {/* Immersive Game-style Stadium Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/game_stadium_showcase.webp" 
          alt="World Cup Stadium background" 
          fill 
          className="object-cover object-center opacity-[0.25]" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#030712]/70 to-[#030712]" />
      </div>

      {/* Centered Heading */}
      <header className="relative z-10 text-center flex flex-col items-center mt-2">
        <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-wider leading-none">
          {profileState.username}&apos;s Official Card Showcase
        </h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
          World Cup 2026 Season • Supporter of {profileState.favoriteNation || 'Argentina'}
        </p>
      </header>

      {/* Main split display */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center py-6">
        
        {/* Left Column: Dual Card Switcher Showcase */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative z-20">
          
          {/* Card Type Selector Tabs */}
          <div className="flex bg-[#0B0F19]/90 border border-white/15 p-1.5 rounded-2xl mb-6 shadow-xl backdrop-blur-md w-full max-w-[340px]">
            <button
              onClick={() => setActiveTab('verdict')}
              className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'verdict'
                  ? 'bg-gradient-to-r from-[#881337] to-[#E11D48] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Verdict Card
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'manager'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> Manager Deck
            </button>
          </div>

          {/* Active Card Frame Container */}
          <div className="relative flex justify-center items-center w-full scale-[0.80] min-[360px]:scale-[0.85] min-[400px]:scale-[0.95] sm:scale-100 origin-center py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -15 }}
                transition={{ duration: 0.3 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={tiltStyle}
                className="relative card-3d-tilt origin-center"
              >
                {activeTab === 'verdict' ? (
                  <SportsCenterCard cardRef={cardNodeRef} data={{
                    text: card.evidence ? card.evidence.replace('Hot Take statement: "', '').replace('" (VAR grading:', '') : 'No evidence submitted.',
                    mode: 'take',
                    caseId: 2026,
                    fanbase: null,
                    isRivalry: false,
                    rarity: card.rarity,
                    ovr: card.rating,
                    rulingText: card.verdict,
                    verdict: card.verdict,
                    charge: card.charge,
                    sentence: card.sentence,
                    ach: { title: 'Reputation', desc: 'Graded', badge: '🔥' },
                    stats: [
                      { label: 'PRD', name: 'Prediction', val: (card.statsJson as any)?.prd ?? (card.statsJson as any)?.predictionPerfScore ?? card.rating },
                      { label: 'MGR', name: 'Manager Score', val: (card.statsJson as any)?.mgr ?? (card.statsJson as any)?.tacticalRating ?? Math.max(30, Math.min(99, card.rating - 3)) },
                      { label: 'HOT', name: 'Hot Take', val: (card.statsJson as any)?.hot ?? (card.statsJson as any)?.avgTakeOvr ?? Math.max(30, Math.min(99, card.rating + 2)) },
                      { label: 'RST', name: 'Roast Score', val: (card.statsJson as any)?.rst ?? (card.statsJson as any)?.communityRating ?? Math.max(50, Math.min(99, card.rating + 1)) }
                    ],
                    matchTitle: card.matchTitle || '',
                    matchScore: card.matchScore,
                    homeFlag: card.homeFlag,
                    awayFlag: card.awayFlag,
                    homeFifaCode: card.homeFifaCode,
                    awayFifaCode: card.awayFifaCode,
                    cardTheme: card.cardTheme || 'gold',
                    aiImageUrl: card.aiImageUrl,
                    countryFlag: profileState.favoriteNation ? getFlagEmoji(profileState.favoriteNation) : '🌍',
                    playerName: profileState.username,
                    playerPosition: card.rating >= 75 ? 'CF' : 'DM',
                    avatarStyle: profileState.avatarStyle,
                    avatarSeed: profileState.avatarSeed
                  }} />
                ) : (
                  <SportsCenterCard cardRef={cardNodeRef} data={{
                    text: 'Overall Tournament Manager Deck',
                    mode: 'court',
                    caseId: 2026,
                    fanbase: null,
                    isRivalry: false,
                    rarity: 'Legendary',
                    ovr: profileState.overallRating || 88,
                    rulingText: 'TOURNAMENT DECK',
                    verdict: 'CERTIFIED CHEF',
                    charge: 'Tournament Mastermind',
                    sentence: 'Undisputed Tactician',
                    ach: { title: 'Tournament Deck', desc: 'Active Deck', badge: '👑' },
                    stats: [
                      { label: 'PRD', name: 'Prediction', val: profileState.predictionRating || 90 },
                      { label: 'MGR', name: 'Manager Score', val: profileState.managerRating || 88 },
                      { label: 'HOT', name: 'Hot Take', val: profileState.hotTakeRating || 85 },
                      { label: 'RST', name: 'Roast Score', val: profileState.roastScore || 92 }
                    ],
                    cardTheme: 'gold',
                    aiImageUrl: profileState.aiImageUrl,
                    countryFlag: profileState.favoriteNation ? getFlagEmoji(profileState.favoriteNation) : '🌍',
                    playerName: profileState.username,
                    playerPosition: 'MGR',
                    avatarStyle: profileState.avatarStyle,
                    avatarSeed: profileState.avatarSeed
                  }} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: High-Contrast Detailed Metrics & Share Plinth */}
        <div className="lg:col-span-6 flex flex-col justify-center gap-6 w-full max-w-xl mx-auto">
          <div className="bg-[#0B0F19]/90 border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl text-white backdrop-blur-xl">
            
            {/* Header Status */}
            <div className="flex justify-between items-center border-b border-white/15 pb-4 mb-5">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-[#E11D48]/15 border border-[#E11D48]/40 text-rose-300 px-3 py-1 rounded-full">
                  {activeTab === 'verdict' ? 'VAR Official Report' : 'Overall Tournament Manager Dossier'}
                </span>
                <h4 className="font-display font-black text-xl md:text-2xl text-white uppercase mt-2 leading-none">
                  {activeTab === 'verdict' ? card.verdict : 'FULL TOURNAMENT DECK'}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-black text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-lg block">
                  {activeTab === 'verdict' ? `${card.rating} OVR` : `${profileState.overallRating || 88} OVR`}
                </span>
              </div>
            </div>
            
            {/* Detailed Text Breakdown */}
            <div className="space-y-4 text-sm text-gray-200 font-medium leading-relaxed">
              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl">
                <span className="text-amber-400 font-black uppercase tracking-widest text-[9.5px] block mb-1.5">
                  {activeTab === 'verdict' ? 'Audited Match Statement:' : 'Manager Profile Alias:'}
                </span>
                <p className="text-white font-semibold text-sm md:text-base">
                  &ldquo;{activeTab === 'verdict' ? (card.evidence ? card.evidence.replace('Hot Take statement: "', '').split('" (VAR')[0] : 'No evidence submitted.') : profileState.username}&rdquo;
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl">
                <span className="text-rose-400 font-black uppercase tracking-widest text-[9.5px] block mb-1.5">
                  {activeTab === 'verdict' ? 'VAR Audited Charge:' : 'National Allegiance:'}
                </span>
                <p className="text-gray-100 font-medium text-xs md:text-sm">
                  {activeTab === 'verdict' ? card.charge : `${profileState.favoriteNation || 'Argentina'} Kit & Allegiance`}
                </p>
              </div>

              {activeTab === 'verdict' && card.sentence && (
                <div className="bg-black/40 border border-rose-500/30 p-4 rounded-2xl">
                  <span className="text-rose-300 font-black uppercase tracking-widest text-[9.5px] block mb-1.5">
                    Sentence Decree:
                  </span>
                  <p className="italic text-rose-400 font-bold text-xs md:text-sm">
                    &ldquo;{card.sentence}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* AI Background Generator Plinth */}
            {!card.aiImageUrl && activeTab === 'verdict' && (
              <div className="border-t border-white/15 pt-4 mt-5 flex flex-col gap-2">
                <button
                  onClick={handleGenerateAiBg}
                  disabled={generating}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 font-display font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                      <span>Synthesizing Cosmic AI Card Art...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Unlock Full AI Cosmic Card Background</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Social Share panel */}
            <div className="border-t border-white/15 pt-5 mt-5 flex justify-between items-center">
              <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Share Active Card:</span>
              
              <div className="flex gap-2.5 items-center">
                {/* Download PNG Button */}
                <button
                  onClick={handleDownloadPng}
                  disabled={downloading}
                  className="p-2.5 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 rounded-xl transition-all cursor-pointer shadow-md"
                  title="Download High-Res Card PNG"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* X/Twitter Share */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out my official ${activeTab === 'verdict' ? 'VAR Verdict Card' : 'Tournament Manager Deck'}! Rated ${activeTab === 'verdict' ? card.rating : profileState.overallRating} OVR: ${card.verdict.toUpperCase()}. Can you beat my Football IQ?`
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all cursor-pointer"
                  title="Post to X/Twitter"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>

                {/* WhatsApp Share */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out my official ${activeTab === 'verdict' ? 'VAR Verdict Card' : 'Tournament Manager Deck'}! Rated ${activeTab === 'verdict' ? card.rating : profileState.overallRating} OVR. Can you beat my Football IQ? ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-400 rounded-xl transition-all cursor-pointer"
                  title="Send via WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.79-4.396c1.598.947 3.51 1.448 5.466 1.449 5.518 0 10.006-4.486 10.01-10.001.002-2.673-1.039-5.184-2.929-7.076-1.89-1.89-4.4-2.93-7.08-2.932-5.521 0-10.007 4.486-10.012 10.002-.002 1.897.486 3.754 1.412 5.37L2.836 21.3l4.01-.105z"/></svg>
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="p-2.5 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer"
                  title="Copy Link"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex gap-4 w-full">
            <Link
              href="/world-cup-hub"
              className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-[#881337] to-[#E11D48] hover:brightness-110 text-white font-display font-black text-xs uppercase tracking-widest shadow-xl text-center hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" /> Grade My Takes
            </Link>
            
            <Link
              href="/"
              className="py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-display font-black text-xs uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Hub Home
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-4">
        VAR Tribunal Collectibles Hub • World Cup 2026
      </footer>

    </div>
  );
}
