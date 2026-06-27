'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SportsCenterCard from '@/components/SportsCenterCard';
import { Trophy, Share2, CheckCircle, Home } from 'lucide-react';
import { getFlagEmoji } from '@/lib/matchUtils';

interface CardDetailClientProps {
  initialCard: any;
  profile: any;
}

export default function CardDetailClient({ initialCard, profile }: CardDetailClientProps) {
  const [card, setCard] = useState(initialCard);
  const [tiltStyle, setTiltStyle] = useState({});
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' | 'info') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
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
          username: profile.username,
          favoriteNation: profile.favoriteNation,
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
    const tiltX = -(y / (box.height / 2)) * 12;
    const tiltY = (x / (box.width / 2)) * 12;
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
    <div className="relative min-h-screen bg-[#030712] text-foreground flex flex-col justify-between pt-[52px] pb-6 px-4 md:px-6 select-none">
      
      {/* Inline Status Message */}
      {statusMsg && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold shadow-xl backdrop-blur-md transition-all animate-fade-in-down ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : statusMsg.type === 'error'
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
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

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-background/55 to-background" />
      </div>

      {/* Centered Heading */}
      <header className="relative z-10 text-center flex flex-col items-center">
        <h2 className="font-display font-black text-2xl sm:text-3.5xl text-white uppercase tracking-wider leading-none">
          {profile.username}&apos;s VAR Verdict Card
        </h2>
        <p className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wide mt-1.5">
          World Cup 2026 Season • Supporter of {profile.favoriteClub || 'VAR FC'}
        </p>
      </header>

      {/* Main split display: visible side-by-side without scroll */}
      <main className="relative z-10 flex-grow w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center py-6 overflow-hidden">
        
        {/* Left Column: Card floating exactly on the pedestal in background image */}
        <div className="flex flex-col items-center justify-center relative h-full">
          {/* Subtle neon platform glow on screen */}
          <div className="absolute bottom-[20%] w-60 h-2 bg-[#E11D48]/10 blur-md rounded-full pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.3, rotateY: 180, opacity: 0 }}
            animate={{ scale: 0.95, rotateY: 0, opacity: 1 }}
            transition={{ 
              type: 'spring', 
              damping: 15, 
              stiffness: 70, 
              duration: 1.2 
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
            className="relative card-3d-tilt filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] origin-center"
          >
            <SportsCenterCard data={{
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
              cardTheme: card.cardTheme || 'gold',
              aiImageUrl: card.aiImageUrl,
              countryFlag: profile.favoriteNation ? getFlagEmoji(profile.favoriteNation) : '🌍',
              playerName: profile.username,
              playerPosition: card.rating >= 75 ? 'CF' : 'DM',
              avatarStyle: profile.avatarStyle,
              avatarSeed: profile.avatarSeed
            }} />
          </motion.div>
        </div>

        {/* Right Column: Details & Social Share Plinth (Compact glassmorphic menu) */}
        <div className="flex flex-col justify-center gap-4 w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-[#0B0F19]/80 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl text-white backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5 mb-3.5">
              <div>
                <span className="text-[7.5px] font-black uppercase text-[#E11D48] tracking-widest bg-[#E11D48]/10 border border-[#E11D48]/25 px-2 py-0.5 rounded-full">
                  VAR Official Report
                </span>
                <h4 className="font-display font-black text-base text-white uppercase mt-1 leading-none">{card.verdict}</h4>
              </div>
              <span className="text-[9px] font-mono font-bold text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">OVR {card.rating}</span>
            </div>
            
            <div className="space-y-3.5 text-xs text-gray-300 font-medium leading-relaxed max-h-[160px] overflow-y-auto pr-1">
              <div>
                <span className="text-zinc-400 font-black uppercase tracking-wider text-[8px] mr-1 block mb-1">Graded Statement:</span>
                &ldquo;{card.evidence ? card.evidence.replace('Hot Take statement: "', '').split('" (VAR')[0] : 'No evidence submitted.'}&rdquo;
              </div>
              <div className="border-t border-white/5 pt-2.5 mt-2.5">
                <span className="text-zinc-400 font-black uppercase tracking-wider text-[8px] mr-1 block mb-1">VAR Audited Evidence:</span>
                {card.charge}
              </div>
              {card.sentence && (
                <div className="border-t border-white/5 pt-2.5 mt-2.5">
                  <span className="text-zinc-400 font-black uppercase tracking-wider text-[8px] mr-1 block mb-1">Sentence Decree:</span>
                  <span className="italic text-[#E11D48] font-bold">&ldquo;{card.sentence}&rdquo;</span>
                </div>
              )}
            </div>

            {/* AI Background Generator Plinth */}
            {!card.aiImageUrl && (
              <div className="border-t border-white/10 pt-3.5 mt-3.5 flex flex-col gap-2">
                <button
                  onClick={handleGenerateAiBg}
                  disabled={generating}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 hover:border-amber-500/60 text-amber-400 hover:text-white font-display font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {generating ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                      <span>Synthesizing Cosmic TOTY Art...</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Unlock AI Cosmic Background</span>
                    </>
                  )}
                </button>
                <p className="text-[7.5px] text-zinc-400 text-center leading-normal">
                  Powered by OpenRouter. Generates a custom country-themed FUT background illustration.
                </p>
              </div>
            )}

            {/* Social Share panel */}
            <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Share Verdict:</span>
              
              <div className="flex gap-2">
                {/* X/Twitter Share */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out this Football IQ Verdict card! Graded at ${card.rating} OVR: ${card.verdict.toUpperCase()}. Can you beat this level of ball knowledge?`
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-share-btn social-btn-x cursor-pointer"
                  title="Post to X/Twitter"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>

                {/* WhatsApp Share */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this Football IQ Verdict card! Graded at ${card.rating} OVR: ${card.verdict.toUpperCase()}. Can you beat this level of ball knowledge? ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-share-btn social-btn-wa cursor-pointer"
                  title="Send via WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.79-4.396c1.598.947 3.51 1.448 5.466 1.449 5.518 0 10.006-4.486 10.01-10.001.002-2.673-1.039-5.184-2.929-7.076-1.89-1.89-4.4-2.93-7.08-2.932-5.521 0-10.007 4.486-10.012 10.002-.002 1.897.486 3.754 1.412 5.37L2.836 21.3l4.01-.105z"/></svg>
                </a>

                {/* Reddit Share */}
                <a
                  href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(
                    `Check out this World Cup 2026 Verdict Card! Rated ${card.rating} OVR: ${card.verdict}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-share-btn social-btn-reddit cursor-pointer"
                  title="Post on Reddit"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-.762 1.15c.037.168.056.337.056.506 0 2.151-2.43 3.9-5.43 3.9-3 0-5.43-1.749-5.43-3.9 0-.169.019-.338.056-.506a1.25 1.25 0 0 1-.762-1.15c0-.688.562-1.25 1.25-1.25.462 0 .862.256 1.07.638.9-.57 2.12-.939 3.47-.995l.732-2.3 2.18.5c.006.4.325.72.72.72a.72.72 0 0 0 .72-.72.72.72 0 0 0-.72-.72 1.07 1.07 0 0 0-1.01.76l-2.3-.53-.78 2.44c1.36.05 2.58.42 3.48.99.2-.38.6-.64 1.07-.64z"/></svg>
                </a>

                {/* Telegram Share */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
                    `Check out my Football IQ Verdict Card! Rated ${card.rating} OVR - ${card.verdict}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-share-btn social-btn-tg cursor-pointer"
                  title="Send via Telegram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.447-.168.575-.544.697-.847.703-.687.012-1.187-.468-1.843-.9-.988-.65-1.543-1.05-2.5-1.674-1.1-.724-.387-1.124.237-1.774.163-.17.294-.488.563-.782.3-.324.6-.68.887-.999.3-.332.325-.562.2-.743-.119-.18-.544-.112-1.075.112-.662.28-1.887 1.112-3.774 2.224-.625.375-1.187.562-1.687.55-.556-.012-1.631-.312-2.431-.575-.987-.324-1.769-.487-1.7-.937.037-.237.387-.487 1.05-.75 4.1-1.787 6.837-2.962 8.212-3.524 3.912-1.612 4.725-1.899 5.256-1.912.119-.002.387.027.562.17.15.12.193.28.2.4.007.086.012.256.002.431z"/></svg>
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="social-share-btn social-btn-copy cursor-pointer"
                  title="Copy Link"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex gap-4 w-full">
            <Link
              href="/world-cup-hub"
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#881337] to-[#E11D48] text-white font-display font-black text-xs uppercase tracking-widest shadow-md text-center hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-4 h-4" /> Grade My Takes
            </Link>
            
            <Link
              href="/"
              className="py-3.5 px-6 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-display font-black text-xs uppercase tracking-widest text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" /> Hub Home
            </Link>
          </div>
        </div>

      </main>

      {/* Footer footer element to push page layout up */}
      <footer className="relative z-10 text-center text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest mt-2">
        VAR Tribunal Collectibles Hub • 2026
      </footer>

    </div>
  );
}
