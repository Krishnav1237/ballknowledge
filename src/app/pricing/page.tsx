'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Trophy, 
  Ticket, 
  Flame, 
  Zap, 
  Check, 
  HelpCircle,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredProfile, syncProfileWithDb } from '@/lib/profileSync';

// FAQ Content styled as the "VAR Tribunal Rulebook"
  const TRIBUNAL_RULES = [
  {
    q: "How is my Football IQ (OVR) calculated?",
    a: "Your OVR is calculated using 4 V1 metrics: PRD (Predictor Score, 35%), MGR (Manager Score from your Best XI, 25%), HOT (Hot Take Score graded by AI × confidence, 25%), and RST (Roast Score from community activity, 15%). Improve each metric to boost your overall rating."
  },
  {
    q: "What is the Best XI and how does MGR work?",
    a: "In the tactical pitch builder, you select 11 players for a match. The average real-world rating of your chosen squad (on a 7.0–9.5 scale) is multiplied by 10 to generate your Manager Score (0–99) for that match."
  },
  {
    q: "How are Hot Take Scores calculated?",
    a: "Each take is AI-graded as Correct (100 base), Partially Correct (75 base), or Incorrect (50 base). This base score is then multiplied by your stated confidence level (1=0.8×, 2=0.9×, 3=1.0×, 4=1.1×, 5=1.2×). Free users get 2 takes graded per match; Ball Knower gets 5."
  },
  {
    q: "Are these subscriptions recurring?",
    a: "No. These are one-off season passes for the entire FIFA World Cup 2026 Season. No monthly fees, no hidden renewals — pay once, compete all season."
  }
];

export default function PricingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [contractSigning, setContractSigning] = useState(false);
  const [currency, setCurrency] = useState('$');

  useEffect(() => {
    const profile = getStoredProfile();
    const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
    const isEuropeTz = tz && tz.startsWith('Europe/');
    const isEuropeNation = profile && ['France', 'Portugal', 'Germany', 'Spain', 'Italy', 'Croatia', 'Belgium', 'Poland', 'Netherlands', 'Serbia', 'Austria', 'Switzerland'].includes(profile.favoriteNation || '');
    const locale = typeof navigator !== 'undefined' ? navigator.language : '';
    const isEuropeLocale = ['fr', 'de', 'es', 'it', 'nl', 'pt', 'be', 'at', 'fi', 'ie', 'ee', 'lv', 'lt', 'sk', 'si', 'gr'].some(lang => locale.toLowerCase().startsWith(lang));
    
    if (isEuropeTz || isEuropeNation || isEuropeLocale) {
      setCurrency('€');
    } else {
      setCurrency('$');
    }
  }, []);

  const handleSignContract = async (plan: string) => {
    if (contractSigning) return;
    setContractSigning(true);
    setSelectedPlan(plan);

    const newRole = plan === 'Ball Knower' ? 'PREMIUM' : plan === 'Football God' ? 'ADMIN' : 'FREE';

    try {
      const stored = getStoredProfile();
      if (stored) {
        stored.role = newRole;
        localStorage.setItem('var_cards_profile', JSON.stringify(stored));
        window.dispatchEvent(new Event('storage'));
        await syncProfileWithDb(stored);
      }
    } catch (e) {
      console.warn('Failed to update local storage role:', e);
    }

    setTimeout(() => {
      setContractSigning(false);
      setSelectedPlan(null);
      window.location.href = '/profile';
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col justify-between pt-[52px]">

      {/* Immersive Stadium Ticket Office Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/vip_box_office.webp" 
          alt="VIP Box Office Background" 
          fill 
          className="object-cover opacity-[0.25] object-center scale-102" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#030712]/55 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-grow pt-10 pb-2 flex flex-col justify-center">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider leading-none">
            SIGN YOUR MANAGER <span className="text-[#E11D48]">CONTRACT</span>
          </h1>
          <p className="text-gray-400 text-[10px] sm:text-[11px] mt-2.5 font-bold uppercase tracking-widest leading-none max-w-lg mx-auto">
            ACQUIRE OFFICIAL MANAGER LICENSE FOR WORLD CUP 2026 <span className="text-zinc-300 mx-2">•</span> SELECT TIER & LOCK PREDICTIONS
          </p>
          
          <button 
            onClick={() => setShowFaqModal(true)}
            className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9.5px] font-black text-gray-300 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider cursor-pointer shadow-md active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#E11D48]" /> View VAR Tribunal Rules
          </button>
        </div>

        {/* Pricing Tickets Grid - High-Fidelity & Space-optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch max-w-6xl mx-auto mb-6 w-full">
          
          {/* CASUAL FAN TICKET (FREE) */}
          <div className="bg-[#0B0F19]/80 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/30 text-white backdrop-blur-md">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-black/20 border-b border-white/10 flex items-center justify-center">
              <span className="text-[4px] font-mono tracking-[0.4em] text-gray-500">|||| | ||||| | | |||| | |||||</span>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    Free Pass
                  </span>
                  <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase mt-1.5">Casual Fan</h3>
                </div>
                <Ticket className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Jump in, no commitment</p>
              
              <div className="flex items-baseline mb-3">
                <span className="font-display font-black text-3xl sm:text-4xl text-white">{currency}0</span>
                <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest ml-1.5">/ season pass</span>
              </div>

              <div className="h-[1px] bg-white/5 my-2.5" />

              <ul className="space-y-2 mb-4">
                {[
                  "Predict scores, MOTM & First Goalscorer",
                  "2 Hot Takes graded per match (AI)",
                  "Basic Best XI lineup builder",
                  "Community chat & Roast Zone access",
                  "Common & Rare Verdict Card drops",
                  "Public OVR reputation profile",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Casual Fan')}
              disabled={selectedPlan !== null}
              className="w-full py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-display font-black text-[11px] uppercase tracking-widest transition-all hover:scale-102 cursor-pointer text-center"
            >
              {contractSigning && selectedPlan === 'Casual Fan' ? 'SIGNING...' : 'START FREE'}
            </button>
          </div>

          {/* BALL KNOWER TICKET (PREMIUM) */}
          <div className="bg-[#0B0F19]/90 border-2 border-[#E11D48] rounded-2xl p-5 sm:p-6 shadow-xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#E11D48]/20 text-white backdrop-blur-md">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-[#E11D48]/10 border-b border-[#E11D48]/20 flex items-center justify-center">
              <span className="text-[4px] font-mono tracking-[0.4em] text-[#E11D48]/85">||| | || |||| | | ||| || ||| |</span>
            </div>

            {/* Popular Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-0.5 bg-gradient-to-r from-[#881337] to-[#E11D48] text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
              <Flame className="w-2.5 h-2.5 animate-pulse" /> POPULAR
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#E11D48] bg-[#E11D48]/10 border border-[#E11D48]/20 px-2 py-0.5 rounded">
                    Gold Pass
                  </span>
                  <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase mt-1.5">Ball Knower</h3>
                </div>
              </div>
              <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider mb-2">The complete pundit experience</p>
              
              <div className="flex items-baseline mb-3">
                <span className="font-display font-black text-3xl sm:text-4xl text-[#E11D48]">{currency}2.99</span>
                <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest ml-1.5">/ season pass</span>
              </div>

              <div className="h-[1px] bg-white/5 my-2.5" />

              <ul className="space-y-2 mb-4">
                {[
                  "5 Hot Takes graded per match (max HOT score)",
                  "Full Best XI builder (11 slots, all positions)",
                  "Unlimited score predictions per fixture",
                  "Epic & Gold Verdict Card drops (OVR 75-89)",
                  "Double RST Roast Zone points (2× reactions)",
                  "Exclusive Premium badge on leaderboard",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px] sm:text-xs text-white">
                    <Check className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Ball Knower')}
              disabled={selectedPlan !== null}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#881337] to-[#E11D48] hover:opacity-90 text-white font-display font-black text-[11px] uppercase tracking-widest transition-all hover:scale-102 cursor-pointer shadow-md text-center"
            >
              {contractSigning && selectedPlan === 'Ball Knower' ? 'SIGNING CONTRACT...' : 'SIGN GOLD CONTRACT'}
            </button>
          </div>

          {/* FOOTBALL GOD TICKET (ADMIN) */}
          <div className="bg-[#0B0F19]/80 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-rose-500 hover:shadow-2xl hover:shadow-black/30 text-white backdrop-blur-md">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-rose-950/20 border-b border-rose-900/30 flex items-center justify-center">
              <span className="text-[4px] font-mono tracking-[0.4em] text-rose-400">| |||| | | ||||| | ||| |||| | | |</span>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/20 border border-rose-900/30 px-2 py-0.5 rounded">
                    Crimson Pass
                  </span>
                  <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase mt-1.5">Football God</h3>
                </div>
                <Zap className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Prestige & overrides</p>
              
              <div className="flex items-baseline mb-3">
                <span className="font-display font-black text-3xl sm:text-4xl text-[#E11D48]">{currency}24.99</span>
                <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest ml-1.5">/ season pass</span>
              </div>

              <div className="h-[1px] bg-white/5 my-2.5" />

              <ul className="space-y-2 mb-4">
                {[
                  "Legendary Verdict Cards (OVR 90+)",
                  "Bypass kickoff prediction locks",
                  "Unlimited AI Hot Take grading",
                  "Exclusive ADMIN badge & reputation tier",
                  "Custom manager card requests & VIP support",
                  "All future World Cup expansions included",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Football God')}
              disabled={selectedPlan !== null}
              className="w-full py-2 rounded-lg border border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48]/5 font-display font-black text-[11px] uppercase tracking-widest transition-all hover:scale-102 cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {selectedPlan === 'Football God' ? (
                <div className="w-4 h-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
              ) : (
                'SIGN GOD CONTRACT'
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Floating Holographic Rules FAQ Modal */}
      <AnimatePresence>
        {showFaqModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-white">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#0B0F19]/90 border border-white/10 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto backdrop-blur-md"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowFaqModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-black text-base text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
                <Trophy className="w-5 h-5 text-[#E11D48]" /> VAR TRIBUNAL RULEBOOK
              </h3>

              <div className="space-y-4">
                {TRIBUNAL_RULES.map((rule, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div 
                      key={idx}
                      className="border border-white/5 bg-black/40 rounded-xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                      >
                        <span className="font-display font-bold text-xs uppercase tracking-wider text-[#E11D48]">
                          Rule {idx + 1}: {rule.q}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 pt-1 text-[11px] sm:text-xs text-gray-300 leading-relaxed font-sans border-t border-white/5 mt-1">
                              {rule.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
