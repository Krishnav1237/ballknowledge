'use client';

import { useState } from 'react';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { 
  Trophy, 
  Sparkle, 
  Ticket, 
  Flame, 
  Zap, 
  Check, 
  HelpCircle,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FAQ Content styled as the "VAR Tribunal Rulebook"
const TRIBUNAL_RULES = [
  {
    q: "Can I swap my club contract and allegiances later?",
    a: "Yes, you can transfer club contracts at any time inside your Manager locker room settings. Changing clubs does not reset your overall rating."
  },
  {
    q: "What is the difference between Bronze, Gold, and Commissioner Licenses?",
    a: "Bronze is free for casual predictions. Gold unlocks unlimited matchday predictions, substitutions, and Epic card drops. Commissioner (Admin) is for the ultimate authority, allowing you to bypass kickoff time locks for testing and claim legendary OVR cards."
  },
  {
    q: "How are the Match Verdict Cards graded?",
    a: "Once a World Cup match ends, the VAR Tribunal automatically processes your predictions. Depending on exact scores and AI-evaluated hot takes, a custom card is generated and added to your digital card album binder."
  },
  {
    q: "Are these subscriptions recurring?",
    a: "No. These licenses are a one-off sign-on contract for the entire FIFA World Cup 2026 Season. No monthly fees, no hidden renewals."
  }
];

export default function PricingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showFaqModal, setShowFaqModal] = useState(false);

  const handleSignContract = (plan: string) => {
    setSelectedPlan(plan);
    // Simulate updating local storage role
    try {
      const stored = localStorage.getItem('var_cards_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        profile.role = plan === 'Gold' ? 'PREMIUM' : plan === 'Crimson' ? 'ADMIN' : 'FREE';
        localStorage.setItem('var_cards_profile', JSON.stringify(profile));
        
        // Dispatch custom storage event to update Navbar instantly
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('Failed to update local storage role:', e);
    }
    setTimeout(() => {
      alert(`Contract Signed! You have successfully upgraded to the ${plan} tier.`);
      selectedPlan === 'Gold' && (window.location.href = '/profile');
      selectedPlan === 'Crimson' && (window.location.href = '/profile');
      setSelectedPlan(null);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white overflow-hidden flex flex-col justify-between">

      {/* Immersive Stadium Ticket Office Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/vip_box_office.webp" 
          alt="VIP Box Office Background" 
          fill 
          className="object-cover opacity-50 object-center scale-102" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#0A0A0A]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-grow pt-14 pb-2 flex flex-col justify-center">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-5">
          <h1 className="font-display font-black uppercase tracking-tight text-white mb-1.5 text-center leading-[1.1]"
              style={{
                fontSize: 'clamp(1.8rem, 4.2vw, 2.8rem)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)'
              }}>
            Sign Your <span className="text-[#D97706]">Contract</span>
          </h1>
          <p className="font-sans text-gray-300 text-[11px] sm:text-xs max-w-lg mx-auto font-medium leading-relaxed">
            Acquire your official manager license for the World Cup 2026. Select a tier, lock in predictions, and claim premium card collectibles.
          </p>
          
          <button 
            onClick={() => setShowFaqModal(true)}
            className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9.5px] font-black text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all uppercase tracking-wider cursor-pointer shadow-sm active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#D97706]" /> View VAR Tribunal Rules
          </button>
        </div>

        {/* Pricing Tickets Grid - High-Fidelity & Space-optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch max-w-5.5xl mx-auto mb-4 w-full">
          
          {/* SILVER TICKET (FREE) */}
          <div className="glass-panel border-slate-500/20 bg-black/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:border-slate-500/35 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)]">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-slate-500/10 border-b border-slate-500/20 flex items-center justify-center">
              <span className="text-[5px] font-mono tracking-[0.4em] text-slate-400">|||| | ||||| | | |||| | |||||</span>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-start mb-3.5">
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 bg-slate-800/40 border border-slate-700/60 px-2 py-0.5 rounded">
                    Bronze Pass
                  </span>
                  <h3 className="font-display font-black text-lg text-white uppercase mt-2">Free Agent</h3>
                </div>
                <Ticket className="w-5.5 h-5.5 text-slate-400" />
              </div>
              <p className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider mb-3.5">Perfect for casual pundits</p>
              
              <div className="flex items-baseline mb-4">
                <span className="font-display font-black text-3xl text-white">$0</span>
                <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-widest ml-1">/ season pass</span>
              </div>

              <div className="h-[1px] bg-slate-500/10 my-3.5" />

              <ul className="space-y-2.5 mb-6">
                {[
                  "3 predictions per fixture",
                  "Standard card drops (Common)",
                  "Community chat access",
                  "OVR reputation tracker",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-[11px] text-slate-200">
                    <Check className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Bronze')}
              disabled={selectedPlan !== null}
              className="w-full py-3 rounded-lg border border-slate-500/35 text-slate-300 hover:text-white hover:bg-slate-500/10 font-display font-black text-xs uppercase tracking-widest transition-all hover:scale-102 cursor-pointer text-center"
            >
              CLAIM BRONZE
            </button>
          </div>

          {/* GOLD TICKET (PREMIUM) */}
          <div className="glass-panel border-[#D97706]/40 bg-black/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden border shadow-[0_0_35px_rgba(217,119,6,0.15)] scale-102 transition-all duration-300 hover:border-[#D97706]/70">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#D97706]/10 border-b border-[#D97706]/20 flex items-center justify-center">
              <span className="text-[5px] font-mono tracking-[0.4em] text-[#D97706]/85">||| | || |||| | | ||| || ||| |</span>
            </div>

            {/* Popular Badge */}
            <div className="absolute top-5 right-5 flex items-center gap-0.5 bg-gradient-to-r from-[#881337] to-[#D97706] text-white text-[7.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md">
              <Flame className="w-2 h-2 animate-pulse" /> POPULAR
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-start mb-3.5">
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-[#D97706] bg-[#D97706]/10 border border-[#D97706]/20 px-2 py-0.5 rounded">
                    Gold Pass
                  </span>
                  <h3 className="font-display font-black text-lg text-white uppercase mt-2">Certified Chef</h3>
                </div>
              </div>
              <p className="text-[9.5px] text-gray-300 font-bold uppercase tracking-wider mb-3.5">The ultimate fan experience</p>
              
              <div className="flex items-baseline mb-4">
                <span className="font-display font-black text-3xl text-[#D97706]">$9.99</span>
                <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-widest ml-1">/ season pass</span>
              </div>

              <div className="h-[1px] bg-[#D97706]/20 my-3.5" />

              <ul className="space-y-2.5 mb-6">
                {[
                  "5 predictions per fixture",
                  "2 substitutions per matchday",
                  "Epic & Gold card drops (OVR 75-89)",
                  "Double reputation points (2x XP)",
                  "Exclusive Roast Chat access & tags",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-[11px] text-amber-50">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Gold')}
              disabled={selectedPlan !== null}
              className="w-full py-3.5 rounded-lg text-white font-display font-black text-xs uppercase tracking-widest shadow-md transition-all hover:scale-102 hover:shadow-[0_0_15px_rgba(217,119,6,0.3)] bg-gradient-to-r from-[#881337] to-[#D97706] cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {selectedPlan === 'Gold' ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'SIGN CONTRACT'
              )}
            </button>
          </div>

          {/* CRIMSON TICKET (ADMIN) */}
          <div className="glass-panel border-rose-600/30 bg-black/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:border-rose-600/55 hover:shadow-[0_0_30px_rgba(244,63,94,0.08)]">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-rose-600/10 border-b border-rose-600/20 flex items-center justify-center">
              <span className="text-[5px] font-mono tracking-[0.4em] text-rose-500">| |||| | | ||||| | ||| |||| | | |</span>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-start mb-3.5">
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/20 border border-rose-950 px-2 py-0.5 rounded">
                    Crimson Pass
                  </span>
                  <h3 className="font-display font-black text-lg text-white uppercase mt-2">Commissioner</h3>
                </div>
                <Zap className="w-5.5 h-5.5 text-rose-500" />
              </div>
              <p className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider mb-3.5">Prestige & simulation overrides</p>
              
              <div className="flex items-baseline mb-4">
                <span className="font-display font-black text-3xl text-rose-500">$24.99</span>
                <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-widest ml-1">/ season pass</span>
              </div>

              <div className="h-[1px] bg-rose-600/10 my-3.5" />

              <ul className="space-y-2.5 mb-6">
                {[
                  "Unlimited fixture predictions",
                  "Bypass kickoff locks (simulation tool)",
                  "Legendary card drops (OVR 90+)",
                  "Triple reputation points (3x XP)",
                  "Unique Commissioner badge & tags",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-[11px] text-rose-50">
                    <Check className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Crimson')}
              disabled={selectedPlan !== null}
              className="w-full py-3.5 rounded-lg border border-rose-600/35 text-rose-400 hover:text-white hover:bg-rose-600/15 font-display font-black text-xs uppercase tracking-widest transition-all hover:scale-102 cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {selectedPlan === 'Crimson' ? (
                <div className="w-4 h-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
              ) : (
                'COMMISSION CONTRACT'
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Floating Holographic Rules FAQ Modal */}
      <AnimatePresence>
        {showFaqModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-panel border-white/10 bg-[#0B0F19]/95 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowFaqModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-black text-base text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
                <Trophy className="w-5 h-5 text-[#D97706]" /> VAR TRIBUNAL RULEBOOK
              </h3>

              <div className="space-y-4">
                {TRIBUNAL_RULES.map((rule, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div 
                      key={idx}
                      className="border border-white/5 bg-black/45 rounded-xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                      >
                        <span className="font-display font-bold text-xs uppercase tracking-wider text-[#D97706]">
                          Rule {idx + 1}: {rule.q}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
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

      <Footer />
    </div>
  );
}
