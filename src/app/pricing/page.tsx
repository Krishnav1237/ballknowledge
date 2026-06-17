'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Trophy, 
  Sparkle, 
  Ticket, 
  Flame, 
  Zap, 
  Check, 
  HelpCircle,
  ChevronDown
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
      setSelectedPlan(null);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white overflow-hidden flex flex-col justify-between">
      <Navbar />

      {/* Immersive Stadium Ticket Office Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/vip_box_office.webp" 
          alt="VIP Box Office Background" 
          fill 
          className="object-cover opacity-60 object-center scale-102" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#0A0A0A]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex-grow pt-24 pb-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#881337] text-white rounded-full px-4 py-1.5 mb-4 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">BallKnowledge • Season Passes</span>
          </div>
          <h1 className="font-display font-black uppercase tracking-tight text-white mb-3 text-center leading-[1.1]"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)'
              }}>
            Sign Your <span className="text-[#D97706]">Contract</span>
          </h1>
          <p className="font-sans text-gray-200 text-xs sm:text-sm md:text-base max-w-lg mx-auto font-medium">
            Acquire your official manager license for the World Cup 2026. Select a tier, lock in predictions, and claim premium card collectibles.
          </p>
        </div>

        {/* Pricing Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto mb-20">
          
          {/* SILVER TICKET (FREE) */}
          <div className="glass-panel border-slate-500/25 bg-black/75 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden border">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-slate-500/20 border-b border-slate-500/35 flex items-center justify-center">
              <span className="text-[6.5px] font-mono tracking-[0.4em] text-slate-400">|||| | ||||| | | |||| | |||||</span>
            </div>

            <div className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-800/40 border border-slate-700/60 px-2.5 py-0.5 rounded-md">
                    Bronze Pass
                  </span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-2">Free Agent</h3>
                </div>
                <Ticket className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-6">Perfect for casual pundits</p>
              
              <div className="flex items-baseline mb-6">
                <span className="font-display font-black text-4xl text-white">$0</span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest ml-1">/ season pass</span>
              </div>

              <div className="h-[1px] bg-slate-500/10 my-4" />

              <ul className="space-y-3.5 mb-8">
                {[
                  "3 predictions per fixture",
                  "Standard card drops (Common)",
                  "Community chat access",
                  "OVR reputation tracker",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Bronze')}
              disabled={selectedPlan !== null}
              className="w-full py-4 rounded-xl border border-slate-500/35 text-slate-300 hover:text-white hover:bg-slate-500/10 font-display font-black text-xs uppercase tracking-widest transition-all hover:scale-102 cursor-pointer text-center"
            >
              CLAIM BRONZE
            </button>
          </div>

          {/* GOLD TICKET (PREMIUM) */}
          <div className="glass-panel border-[#D97706]/40 bg-black/80 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden border shadow-[0_0_35px_rgba(217,119,6,0.15)] scale-102">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#D97706]/20 border-b border-[#D97706]/35 flex items-center justify-center">
              <span className="text-[6.5px] font-mono tracking-[0.4em] text-[#D97706]/90">||| | || |||| | | ||| || ||| |</span>
            </div>

            {/* Popular Badge */}
            <div className="absolute top-6 right-6 flex items-center gap-1 bg-gradient-to-r from-[#881337] to-[#D97706] text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
              <Flame className="w-2.5 h-2.5 animate-pulse" /> POPULAR
            </div>

            <div className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#D97706] bg-[#D97706]/10 border border-[#D97706]/20 px-2.5 py-0.5 rounded-md">
                    Gold Pass
                  </span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-2">Certified Chef</h3>
                </div>
              </div>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mb-6">The ultimate fan experience</p>
              
              <div className="flex items-baseline mb-6">
                <span className="font-display font-black text-4xl text-[#D97706]">$9.99</span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest ml-1">/ season pass</span>
              </div>

              <div className="h-[1px] bg-[#D97706]/20 my-4" />

              <ul className="space-y-3.5 mb-8">
                {[
                  "5 predictions per fixture",
                  "2 substitutions per matchday",
                  "Epic & Gold card drops (OVR 75-89)",
                  "Double reputation points (2x XP)",
                  "Exclusive Roast Chat access & tags",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-amber-50">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Gold')}
              disabled={selectedPlan !== null}
              className="w-full py-4 rounded-xl text-white font-display font-black text-xs uppercase tracking-widest shadow-md transition-all hover:scale-102 hover:shadow-[0_0_15px_rgba(217,119,6,0.3)] bg-gradient-to-r from-[#881337] to-[#D97706] cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {selectedPlan === 'Gold' ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'SIGN CONTRACT'
              )}
            </button>
          </div>

          {/* CRIMSON TICKET (ADMIN / COMMISSIONER) */}
          <div className="glass-panel border-rose-600/35 bg-black/75 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden border">
            {/* Top Barcode Aesthetic */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-rose-600/20 border-b border-rose-600/35 flex items-center justify-center">
              <span className="text-[6.5px] font-mono tracking-[0.4em] text-rose-500">| |||| | | ||||| | ||| |||| | | |</span>
            </div>

            <div className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/20 border border-rose-950 px-2.5 py-0.5 rounded-md">
                    Crimson Pass
                  </span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-2">Commissioner</h3>
                </div>
                <Zap className="w-6 h-6 text-rose-500" />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-6">Prestige, power & override control</p>
              
              <div className="flex items-baseline mb-6">
                <span className="font-display font-black text-4xl text-rose-500">$24.99</span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest ml-1">/ season pass</span>
              </div>

              <div className="h-[1px] bg-rose-600/10 my-4" />

              <ul className="space-y-3.5 mb-8">
                {[
                  "Unlimited match predictions",
                  "Bypass kickoff locks (simulation tool)",
                  "Legendary card drops (OVR 90+)",
                  "Triple reputation points (3x XP)",
                  "Direct appeal overrides (edit grades)",
                  "Unique Commissioner profile badge",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-rose-50">
                    <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSignContract('Crimson')}
              disabled={selectedPlan !== null}
              className="w-full py-4 rounded-xl border border-rose-600/35 text-rose-400 hover:text-white hover:bg-rose-600/15 font-display font-black text-xs uppercase tracking-widest transition-all hover:scale-102 cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {selectedPlan === 'Crimson' ? (
                <div className="w-4 h-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
              ) : (
                'COMMISSION CONTRACT'
              )}
            </button>
          </div>

        </div>

        {/* VAR Tribunal Rulebook (FAQ) */}
        <div className="max-w-3xl mx-auto">
          <h3 className="font-display font-black text-lg text-white uppercase tracking-wider text-center mb-8 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#D97706]" /> VAR TRIBUNAL RULEBOOK
          </h3>

          <div className="space-y-4">
            {TRIBUNAL_RULES.map((rule, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="glass-panel border-white/5 bg-black/60 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                      Rule {idx + 1}: {rule.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#D97706] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed font-sans border-t border-white/5 mt-1">
                          {rule.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
