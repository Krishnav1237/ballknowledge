'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SportsCenterCard from '@/components/SportsCenterCard';
import { Trophy, ShieldAlert, Sparkles, Share2, CheckCircle, Home } from 'lucide-react';

export default function SharedCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cardId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3D Tilt states
  const [tiltStyle, setTiltStyle] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await fetch(`/api/card/${cardId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError('Card not found in the database. Ensure database connection is online and the card has been synced.');
        }
      } catch (err) {
        setError('Database connection error occurred. Could not load shared card.');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-gray-500">Unpacking collectible card...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md bg-[#0B0F19] border border-white/5 p-8 rounded-3xl shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4 mx-auto" />
          <h2 className="font-display font-black text-xl text-white uppercase mb-2">Card Unavailable</h2>
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

  const { card, profile } = data;

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
    <div className="relative w-screen h-screen overflow-hidden bg-black text-foreground flex flex-col justify-between p-4 md:p-6 select-none">
      
      {/* Immersive Game-style Stadium Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/game_stadium_showcase.webp" 
          alt="World Cup Stadium background" 
          fill 
          className="object-cover object-center" 
          priority 
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/85" />
      </div>

      {/* Centered Heading */}
      <header className="relative z-10 text-center flex flex-col items-center mt-2">
        <h2 className="font-display font-black text-2xl sm:text-3.5xl text-white uppercase tracking-wider leading-none">
          {profile.username}&apos;s VAR Verdict Card
        </h2>
        <p className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wide mt-1.5">
          World Cup 2026 Season • Supporter of {profile.favoriteClub || 'VAR FC'}
        </p>
      </header>

      {/* Main split display: visible side-by-side without scroll */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center my-auto py-4 overflow-hidden">
        
        {/* Left Column: Card floating exactly on the pedestal in background image */}
        <div className="flex flex-col items-center justify-center relative h-full">
          {/* Subtle neon platform glow on screen */}
          <div className="absolute bottom-[20%] w-60 h-2 bg-amber-500/20 blur-md rounded-full pointer-events-none" />
          
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
            className="relative card-3d-tilt filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] mt-[-20px] lg:mt-[-40px]"
          >
            <SportsCenterCard data={{
              text: card.evidence.replace('Hot Take statement: "', '').replace('" (VAR grading:', ''),
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
                { label: 'IQ', name: 'Ball IQ', val: card.rating },
                { label: 'DEL', name: 'Delusion', val: 100 - card.rating }
              ],
              cardTheme: card.cardTheme || 'gold',
              countryFlag: profile.favoriteNation === 'Argentina' ? '🇦🇷' : '🌍',
              playerName: profile.username,
              playerPosition: card.rating >= 75 ? 'CF' : 'DM'
            }} />
          </motion.div>
        </div>

        {/* Right Column: Details & Social Share Plinth (Compact glassmorphic menu) */}
        <div className="flex flex-col justify-center gap-4 w-full max-w-md mx-auto lg:mx-0">
          <div className="glass-panel-elevated border-white/10 bg-black/60 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-2xl border border-white/5">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-3.5">
              <div>
                <span className="text-[7.5px] font-black uppercase text-amber-500 tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  VAR Official Report
                </span>
                <h4 className="font-display font-black text-base text-white uppercase mt-1 leading-none">{card.verdict}</h4>
              </div>
              <span className="text-[9px] font-mono font-bold text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">OVR {card.rating}</span>
            </div>
            
            <div className="space-y-3.5 text-xs text-gray-400 font-medium leading-relaxed max-h-[160px] overflow-y-auto pr-1">
              <div>
                <span className="text-gray-500 font-black uppercase tracking-wider text-[8px] mr-1 block mb-1">Graded Statement:</span>
                &ldquo;{card.evidence.replace('Hot Take statement: "', '').split('" (VAR')[0]}&rdquo;
              </div>
              <div className="border-t border-white/5 pt-2.5 mt-2.5">
                <span className="text-gray-500 font-black uppercase tracking-wider text-[8px] mr-1 block mb-1">VAR Audited Evidence:</span>
                {card.charge}
              </div>
              {card.sentence && (
                <div className="border-t border-white/5 pt-2.5 mt-2.5">
                  <span className="text-gray-500 font-black uppercase tracking-wider text-[8px] mr-1 block mb-1">Sentence Decree:</span>
                  <span className="italic text-amber-500/90">&ldquo;{card.sentence}&rdquo;</span>
                </div>
              )}
            </div>

            {/* Social Share panel */}
            <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Share Verdict:</span>
              
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
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex gap-4 w-full">
            <Link
              href="/world-cup-hub"
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#881337] to-[#D97706] text-white font-display font-black text-xs uppercase tracking-widest shadow-md text-center hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-4 h-4" /> Grade My Takes
            </Link>
            
            <Link
              href="/"
              className="py-3.5 px-6 rounded-xl bg-white/5 border border-white/5 text-gray-300 font-display font-black text-xs uppercase tracking-widest text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" /> Hub Home
            </Link>
          </div>
        </div>

      </main>

      {/* Footer footer element to push page layout up */}
      <footer className="relative z-10 text-center text-[8.5px] font-mono text-gray-500 uppercase tracking-widest mt-2">
        VAR Tribunal Collectibles Hub • 2026
      </footer>

    </div>
  );
}
