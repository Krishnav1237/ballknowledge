'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Target, Users, Flame, MessageSquare, Award } from 'lucide-react';


import { BREAKING_NEWS, PLAYERS, COUNTRIES } from '@/lib/landingData';



export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -200]);


  // ── Form sandboxes ────────────────────────────────────────────────────────────
  const [sandboxText,  setSandboxText]  = useState('Messi is the greatest World Cup player of all time');
  const [sandboxOvr,   setSandboxOvr]   = useState(99);

  const [predMOTM,        setPredMOTM]        = useState('Kylian Mbappé');
  const [predGoalscorer,  setPredGoalscorer]  = useState('Jude Bellingham');
  const [predPossession,  setPredPossession]  = useState('Argentina');

  const [isTidied,       setIsTidied]       = useState(false);
  const [stats, setStats] = useState({ takes: 0, cases: 0, cards: 0 });
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nationSearch, setNationSearch] = useState('');
  
  useEffect(() => {
    setMounted(true);

    let timer: NodeJS.Timeout | undefined;

    // Check if the preloader was already shown in this session to skip redundant loads
    const hasPreloaded = typeof window !== 'undefined' && sessionStorage.getItem('bk_preloaded');
    if (hasPreloaded) {
      setLoading(false);
    } else {
      timer = setTimeout(() => {
        setLoading(false);
        try {
          sessionStorage.setItem('bk_preloaded', 'true');
        } catch {
          // ignore session storage exceptions
        }
      }, 400); // Fast initial splash
    }

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.takes && data.cases && data.cards) {
          setStats(data);
        }
      })
      .catch(err => console.warn('Failed to load stats baseline:', err));

    const id = setInterval(() => {
      setStats(p => ({
        takes: p.takes + Math.floor(Math.random() * 3),
        cases: p.cases + (Math.random() > 0.85 ? 1 : 0),
        cards: p.cards + Math.floor(Math.random() * 4),
      }));
    }, 3000);

    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(id);
    };
  }, []);


  return (
    <div ref={containerRef} className="relative bg-[#030712] text-[#F3F4F6] min-h-screen overflow-hidden">

      {/* ── IMMERSIVE PRELOADER SCREEN ──────────────────────────────────────── */}
      <div 
        className={`fixed inset-0 z-[100] bg-[#030712] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          !loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-center px-6">
          {/* Spinning Burgundy & Red Rings */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-t-[#E11D48] border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1s' }} />
            <div className="absolute inset-1.5 rounded-full border-2 border-b-[#881337] border-t-transparent border-r-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            <span className="font-display font-black text-xs text-white uppercase tracking-wider">VAR</span>
          </div>
          
          <h2 className="font-display font-black text-2xl tracking-[0.2em] text-white uppercase mt-2">
            BALL<span className="text-[#E11D48]">KNOWLEDGE</span>
          </h2>

          
          <div className="w-44 h-[2px] bg-zinc-800 rounded-full overflow-hidden relative mt-1">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#881337] to-[#E11D48] w-full animate-loading-bar" />
          </div>
          
          <p className="text-[9px] font-sans font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">
            Connecting to World Cup Matchday Server...
          </p>
        </div>
      </div>

      {/* ── TICKER ──────────────────────────────────────────────────────────── */}

      <div className="fixed top-[52px] left-0 w-full h-9 z-30 flex items-center overflow-hidden select-none"
           style={{ background: '#881337' }}>
        <div className="shrink-0 px-4 h-full flex items-center bg-zinc-950 border-r border-white/10 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E11D48]">2026 LIVE</span>
        </div>
        <div className="flex w-max">
          <div className="animate-marquee whitespace-nowrap flex space-x-12 pr-12 text-[11px] font-semibold text-white/90 uppercase tracking-wide items-center">
            {BREAKING_NEWS.concat(BREAKING_NEWS).map((n, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#E11D48] animate-pulse" />{n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-[116px] pb-6 flex flex-col items-center justify-center min-h-screen lg:h-screen bg-[#030712] text-white">
        <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image src="/images/world_cup_stadium.webp" alt="" fill className="object-cover opacity-[0.40]" sizes="100vw" priority />
          {/* Dark vignette — lighter in the middle so the stadium is visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/70 via-[#030712]/20 to-[#030712]/90" />
          {/* Side vignettes for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/60 via-transparent to-[#030712]/60" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
          className="relative w-full max-w-3xl mx-auto text-center py-4 md:py-6 flex flex-col justify-center items-center"
        >

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-[#881337] text-white rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">World Cup 2026 • Season Active</span>
          </div>

          <h1 className="font-display font-black uppercase tracking-tight text-white mb-4 text-center leading-[1.05]"
              style={{
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
              }}>
            Build Your<br />
            Football <span className="text-[#E11D48]">Reputation</span>
          </h1>

          <p className="font-sans text-zinc-400 text-[12.5px] sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8 font-semibold text-center">
            Lock in predictions, construct your Best XI squad, drop bold hot takes, and survive the AI VAR Tribunal to collect dynamic Verdict Cards.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link href="/world-cup-hub"
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-105 hover:opacity-90 shadow-md text-center bg-gradient-to-r from-[#881337] to-[#E11D48]">
              Enter World Cup Hub
            </Link>
            <Link href="/football-iq"
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-gray-300 transition-all hover:scale-105 hover:opacity-90 shadow-md border border-white/10 bg-white/5 hover:bg-white/10 text-center">
              View My Card
            </Link>
          </div>

          {/* Live stats */}
          {(stats.takes > 0 || stats.cards > 0) && (
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {[
                { v: stats.takes.toLocaleString(), l: 'Takes Graded' },
                { v: stats.cards.toLocaleString(), l: 'Cards Generated' },
                { v: stats.cases.toLocaleString(), l: 'Reputations Synced' },
              ].map(s => (
                <div key={s.l} className="bg-[#0B0F19]/80 border border-white/10 px-6 py-3 rounded-2xl shadow-md text-center min-w-[155px] transition-transform duration-300 hover:scale-105 flex flex-col justify-center backdrop-blur-md">
                  <div className="font-display font-black text-2xl sm:text-3xl text-[#E11D48]">{s.v}</div>
                  <div className="text-[9px] font-sans font-black uppercase tracking-widest text-zinc-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          )}

        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── HOW IT WORKS — Light Section ─────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-6 bg-white border-t border-gray-100 relative overflow-hidden">
        {/* Subtle stadium texture at very low opacity for depth */}
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/images/world_cup_stadium.webp" alt="" fill className="object-cover opacity-[0.04] object-center" sizes="100vw" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E11D48] bg-[#E11D48]/10 px-3 py-1 rounded-full border border-[#E11D48]/20">
              HOW IT WORKS
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900 uppercase tracking-wider mt-4">
              Build Your Reputation in <span className="text-[#E11D48]">5 Steps</span>
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-3 max-w-lg mx-auto font-bold">
              Every step earns you points across 4 unique metrics to build your overall Football IQ card.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                n: '01',
                icon: Target,
                color: '#E11D48',
                metric: 'PRD',
                title: 'Lock In Predictions',
                body: 'Predict scorelines, goalscorers, and MOTM to build your Predictor rating.',
              },
              {
                n: '02',
                icon: Users,
                color: '#3B82F6',
                metric: 'MGR',
                title: 'Build Best XI',
                body: 'Assemble your tactical team. Real-world ratings determine your Manager Score.',
              },
              {
                n: '03',
                icon: Flame,
                color: '#E11D48',
                metric: 'HOT',
                title: 'Drop Hot Takes',
                body: 'Submit takes graded by the AI VAR Tribunal multiplied by your confidence.',
              },
              {
                n: '04',
                icon: MessageSquare,
                color: '#8B5CF6',
                metric: 'RST',
                title: 'Banter & Roast',
                body: 'Engage in the Roast Zone. Upvotes and chat activity boost your Roast Score.',
              },
              {
                n: '05',
                icon: Award,
                color: '#10B981',
                metric: 'OVR',
                title: 'Get Verdict Card',
                body: 'Claim your Ultimate Team style card showing your overall Football IQ.',
              },
            ].map((s) => {
              const IconComponent = s.icon;
              return (
                <div
                  key={s.n}
                  className="relative group flex flex-col items-center text-center p-5 rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-gray-300 shadow-sm"
                >
                  {/* Icon Capsule */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-[6deg]"
                    style={{ background: `${s.color}12`, border: `1.5px solid ${s.color}30` }}
                  >
                    <IconComponent className="w-5.5 h-5.5" style={{ color: s.color }} />
                  </div>

                  <span
                    className="text-[9px] font-black uppercase tracking-[0.2em] mb-1.5"
                    style={{ color: s.color }}
                  >
                    STEP {s.n} &middot; {s.metric}
                  </span>
                  <h3 className="font-display font-black text-sm text-gray-900 mb-2 uppercase tracking-wide">{s.title}</h3>
                  <p className="font-sans text-gray-500 text-[11.5px] leading-relaxed font-bold">{s.body}</p>
                </div>
              );
            })}
          </div>

          {/* Formula Strip - Light card style */}
          <div className="mt-10 py-4 px-6 rounded-2xl border border-gray-200 bg-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center text-[10px] sm:text-xs font-black uppercase tracking-wider">
              {/* PRD */}
              <div className="flex items-center gap-1.5 bg-[#E11D48]/8 border border-[#E11D48]/20 text-[#E11D48] px-3 py-1 rounded-full font-black">
                <Target className="w-3.5 h-3.5" />
                <span>35% PRD</span>
              </div>
              <span className="text-gray-400 font-bold">+</span>
              {/* MGR */}
              <div className="flex items-center gap-1.5 bg-blue-500/8 border border-blue-500/20 text-[#3B82F6] px-3 py-1 rounded-full font-black">
                <Users className="w-3.5 h-3.5" />
                <span>25% MGR</span>
              </div>
              <span className="text-gray-400 font-bold">+</span>
              {/* HOT */}
              <div className="flex items-center gap-1.5 bg-[#E11D48]/8 border border-[#E11D48]/20 text-[#E11D48] px-3 py-1 rounded-full font-black">
                <Flame className="w-3.5 h-3.5" />
                <span>25% HOT</span>
              </div>
              <span className="text-gray-400 font-bold">+</span>
              {/* RST */}
              <div className="flex items-center gap-1.5 bg-purple-500/8 border border-purple-500/20 text-[#8B5CF6] px-3 py-1 rounded-full font-black">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>15% RST</span>
              </div>
              <span className="text-gray-400 font-bold">=</span>
              {/* OVR */}
              <div className="flex items-center gap-1.5 bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] px-4 py-1.5 rounded-full">
                <Award className="w-4 h-4" />
                <span>FOOTBALL IQ OVR</span>
              </div>
            </div>
            <Link
              href="/world-cup-hub"
              className="shrink-0 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest text-white hover:opacity-90 transition-all bg-gradient-to-r from-[#881337] to-[#E11D48] shadow-[0_4px_12px_rgba(225,29,72,0.25)]"
            >
              Enter World Cup Hub
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TOOLS SHOWCASE: predictions, takes, and cards                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 border-t border-white/10 bg-[#030712] relative overflow-hidden">
        {/* Faint stadium in the background for dark sections */}
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/images/game_stadium_showcase.webp" alt="" fill className="object-cover opacity-[0.10] object-center" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-transparent to-[#030712]/80" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {/* TOOL 1: Matchday Takes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between shadow-xl hover:border-[#881337]/45 bg-[#0B0F19]/80 backdrop-blur-md"
            >
              <div className="p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#881337' }}>
                      <span className="text-white font-black text-xs">01</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">MODULE 01</p>
                      <h2 className="font-sans font-black text-xl text-white">Matchday Hot Takes</h2>
                    </div>
                  </div>
                  <p className="font-serif text-gray-400 text-sm leading-relaxed">
                    Submit bold takes on fixture matchdays. The Stockley Park VAR tribunal scores them using AI, updating your overall Hot Takes IQ.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Sandbox Take</label>
                      <textarea
                        value={sandboxText}
                        onChange={e => setSandboxText(e.target.value.slice(0, 120))}
                        rows={2}
                        className="w-full border border-white/10 rounded-xl p-3.5 font-serif text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#881337] transition-all resize-none leading-relaxed bg-black/40"
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex gap-1.5 flex-wrap max-w-[85%]">
                          {[
                            { label: '🇦🇷 Messi take', text: 'Messi is the greatest World Cup player of all time' },
                            { label: '🇵🇹 Ronaldo take', text: "Ronaldo's aura will carry Portugal to the final trophy" },
                          ].map(t => (
                            <button key={t.label} onClick={() => setSandboxText(t.text)}
                              className="text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/10 text-gray-400 hover:border-[#E11D48] hover:text-white hover:bg-[#E11D48]/10 transition-all bg-white/5 cursor-pointer active:scale-95">
                              {t.label}
                            </button>
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-500 font-semibold shrink-0">{sandboxText.length}/120</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                          Confidence <span className="text-[#E11D48] font-bold">{sandboxOvr}</span>
                        </label>
                        <input type="range" min="1" max="99" value={sandboxOvr}
                          onChange={e => setSandboxOvr(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#E11D48] transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                <Link href={`/world-cup-hub`}
                      className="block w-full py-4 text-center rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-[1.01] hover:opacity-95 shadow-md active:scale-95 bg-gradient-to-r from-[#881337] to-[#a21c43]">
                  Pick Match & Submit Take →
                </Link>
              </div>
            </motion.div>

            {/* TOOL 2: Match Predictions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between shadow-xl hover:border-[#E11D48]/45 bg-[#0B0F19]/80 backdrop-blur-md"
            >
              <div className="p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#E11D48' }}>
                      <span className="text-white font-black text-xs">02</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">MODULE 02</p>
                      <h2 className="font-sans font-black text-xl text-white">Fixture Predictions</h2>
                    </div>
                  </div>
                  <p className="font-serif text-gray-400 text-sm leading-relaxed">
                    Predict scorelines, MOTM, goalscorers, and possession. Earn rating increases: Exact score (+15) or Correct outcome (+5).
                  </p>

                  <div className="space-y-3.5">
                    <div className="relative">
                      <input type="text" value={predMOTM} onChange={e => setPredMOTM(e.target.value)}
                        placeholder="Predicted MOTM…"
                        className="w-full border border-white/10 rounded-xl px-3.5 py-3 font-serif text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E11D48] transition-all bg-black/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={predGoalscorer} onChange={e => setPredGoalscorer(e.target.value)}
                        placeholder="First Goalscorer…"
                        className="w-full border border-white/10 rounded-xl px-3.5 py-3 font-serif text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E11D48] transition-all bg-black/40" />
                      <input type="text" value={predPossession} onChange={e => setPredPossession(e.target.value)}
                        placeholder="Possession Winner…"
                        className="w-full border border-white/10 rounded-xl px-3.5 py-3 font-serif text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E11D48] transition-all bg-black/40" />
                    </div>
                  </div>
                </div>

                <Link href={`/world-cup-hub`}
                      className="block w-full py-4 text-center rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-[1.01] hover:opacity-95 shadow-md active:scale-95 bg-gradient-to-r from-[#E11D48] to-[#EF4444]">
                  Lock predictions →
                </Link>
              </div>
            </motion.div>

            {/* TOOL 3: Collectible Verdict Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between shadow-xl hover:border-white/20 bg-[#0B0F19]/80 backdrop-blur-md"
            >
              <div className="p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#334155' }}>
                      <span className="text-white font-black text-xs">03</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">MODULE 03</p>
                      <h2 className="font-sans font-black text-xl text-white">Verdict Cards</h2>
                    </div>
                  </div>
                  
                  {/* Today's Prophecy Ticker */}
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-[#E11D48]/35 rounded-2xl p-4.5 relative overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase text-[#E11D48] tracking-widest flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5" />
                        ACTIVE SEASON FIXTURE
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">STATUS: OPEN</span>
                    </div>
                    <p className="text-xs font-mono text-rose-200/90 leading-relaxed italic">
                      &quot;Portugal will secure a last-minute victory through a controversial penalty locked in by Cristiano Ronaldo&apos;s aura.&quot;
                    </p>
                  </div>

                  <p className="font-serif text-gray-400 text-sm leading-relaxed">
                    Earn collectible FUT-style Verdict Cards for completed matches. Album count increases dynamically: Common, Rare, Epic, and Legendary.
                  </p>
                </div>

                <Link href={`/world-cup-hub`}
                      className="block w-full py-4 text-center rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-[1.01] hover:opacity-95 shadow-md active:scale-95 bg-gradient-to-r from-[#334155] to-[#475569]">
                  View Fixtures Schedule
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DRAGGABLE DOSSIERS PLATFORM                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── DOSSIERS — Light Section ──────────────────────────────────────────── */}
      <section className="relative py-12 md:py-16 px-6 border-t border-gray-200 bg-slate-50 text-gray-900">
        {/* Trophy image bleed at very low opacity for editorial feel */}
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/images/trophy_moment.webp" alt="" fill className="object-cover opacity-[0.05] object-top" sizes="100vw" />
        </div>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E11D48] mb-2">FIXTURE STORYLINES</p>
            <h2 className="font-serif italic font-black text-4xl sm:text-5xl text-gray-900 leading-tight">
              Predict the scripts of key stars.
            </h2>
            <p className="text-sm text-gray-500 font-sans mt-2 hidden lg:block">
              Drag the player dossiers around the Editor&apos;s Desk.
            </p>
          </div>

          {/* Desktop Draggable dossiers canvas desk */}
          <div ref={deskRef} className="relative w-full h-[980px] border border-gray-300 rounded-3xl bg-white/80 backdrop-blur-sm overflow-hidden p-6 hidden lg:block shadow-inner"
               style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}>
            
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={() => setIsTidied(!isTidied)}
                className="px-4.5 py-2 rounded-full font-black text-xs uppercase tracking-widest text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm border border-gray-300 cursor-pointer flex items-center gap-1.5"
              >
                {isTidied ? 'Scatter Dossiers' : 'Tidy Up Desk'}
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[10rem] font-sans font-black text-black/[0.025]">DOSSIER</span>
            </div>

            {PLAYERS.map((p, i) => {
              const initialRotate = [ -8, 6, -11, 12, 9, -7, 14, -5 ][i];
              const initialX = [ -15, 20, -25, 10, -10, 15, -20, 25 ][i];
              const initialY = [ 10, -12, 18, -8, 14, -15, 22, -10 ][i];

              const row = Math.floor(i / 4);
              const col = i % 4;
              const leftPercent = 3 + col * 24.2;
              const topPercent = 3 + row * 48.5;

              return (
                <motion.div
                  key={p.name}
                  drag
                  dragConstraints={deskRef}
                  dragElastic={0.06}
                  initial={{ opacity: 0, scale: 0.9, rotate: initialRotate, x: initialX, y: initialY }}
                  animate={{
                     rotate: isTidied ? 0 : initialRotate,
                     x: isTidied ? 0 : initialX,
                     y: isTidied ? 0 : initialY,
                     scale: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)' }}
                  className="absolute w-[320px] h-[430px] group flex flex-col rounded-2xl overflow-hidden shadow-md bg-white cursor-grab select-none hover:shadow-xl transition-shadow border border-gray-200"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    border: `1px solid ${p.border}20`,
                  }}
                >
                  <div className="relative w-full overflow-hidden select-none pointer-events-none" style={{ height: 210, flexShrink: 0 }}>
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      className="object-cover object-top select-none pointer-events-none"
                      sizes="320px"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.12) 55%, transparent 100%)' }} />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[8px] font-black tracking-widest text-white"
                         style={{ background: p.accent, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                      {p.verdict}
                    </div>
                    <div className="absolute bottom-3 left-3.5 right-3.5">
                      <p className="text-[8px] font-black tracking-[0.2em] uppercase mb-0.5" style={{ color: p.accent }}>
                        {p.flag} {p.country}
                      </p>
                      <h3 className="font-sans font-black text-xl text-white leading-none">{p.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-3 justify-between flex-grow">
                    <p className="font-serif text-gray-600 text-xs sm:text-sm leading-relaxed select-none">{p.hook}</p>
                    <Link href={p.href}
                          className="text-[10px] sm:text-xs font-black uppercase tracking-widest inline-flex items-center gap-1 transition-all hover:translate-x-0.5"
                          style={{ color: p.accent }}>
                      {p.cardHook}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile/Tablet dossiers list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
            {PLAYERS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group flex flex-col rounded-2xl overflow-hidden shadow-md bg-white w-full h-[430px] sm:h-[460px] border border-gray-200"
                style={{ border: `1.5px solid ${p.border}30` }}
              >
                <div className="relative w-full overflow-hidden" style={{ height: 230, flexShrink: 0 }}>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.12) 60%, transparent 100%)' }} />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[8px] font-black tracking-widest text-white"
                       style={{ background: p.accent }}>
                    {p.verdict}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[9px] font-black tracking-[0.2em] uppercase mb-0.5" style={{ color: p.accent }}>
                      {p.flag} {p.country}
                    </p>
                    <h3 className="font-sans font-black text-2xl text-white leading-none">{p.name}</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3 justify-between flex-grow">
                  <p className="font-serif text-gray-600 text-xs sm:text-sm leading-relaxed flex-1">{p.hook}</p>
                  <Link href={p.href}
                        className="text-[10px] sm:text-xs font-black uppercase tracking-widest inline-flex items-center gap-1"
                        style={{ color: p.accent }}>
                    {p.cardHook}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* NATIONS: select country narrative                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 px-6 bg-[#030712] border-t border-gray-800 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/images/world_cup_hub_bg.webp" alt="" fill className="object-cover opacity-[0.24] object-center" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/40 to-[#030712]/80" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-10 md:mb-12 text-center">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#E11D48] mb-3">ROUND OF 32 · 32 NATIONS QUALIFIED</p>
            <h2 className="font-serif italic font-black text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
              Pick your nation.<br />
              <span className="text-[#E11D48]">Own the narrative.</span>
            </h2>
            <p className="font-serif text-zinc-400 text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
              The 32 nations who qualified for the Round of 32 knockout stage. Pick yours to predict their fixtures, submit hot takes, and claim Verdict Cards.
            </p>
          </div>

          {/* Search Row */}
          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-md">
              <input
                id="nation-search"
                type="text"
                placeholder="Search R32 nation..."
                value={nationSearch}
                onChange={e => setNationSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E11D48]/50 focus:ring-1 focus:ring-[#E11D48]/20 transition-all shadow-inner"
              />
              {nationSearch && (
                <button onClick={() => setNationSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-sm cursor-pointer">✕</button>
              )}
            </div>
          </div>

          {/* Nations Grid - Rebuilt with larger cards */}
          {(() => {
            const filtered = COUNTRIES.filter(c => {
              return nationSearch === '' || 
                c.name.toLowerCase().includes(nationSearch.toLowerCase()) || 
                (c.fifa && c.fifa.toLowerCase().includes(nationSearch.toLowerCase()));
            });
            return filtered.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 font-bold text-sm">No nations found for &ldquo;{nationSearch}&rdquo;</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {filtered.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ delay: Math.min(i * 0.02, 0.4), duration: 0.4 }}
                  >
                    <Link href={c.href}
                      className="group flex flex-col p-6 rounded-3xl transition-all duration-300 hover:scale-[1.03] cursor-pointer h-full shadow-2xl bg-[#0B0F19]/90 backdrop-blur-sm border hover:border-white/20 hover:bg-[#111827] text-white"
                      style={{ border: `1px solid ${c.color}28` }}>
                      {/* Flag + badges */}
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-4xl sm:text-5xl leading-none transition-transform duration-300 group-hover:scale-110">{c.flag}</span>
                        <div className="flex flex-col items-end gap-1 font-mono">
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border"
                                style={{ background: c.color + '15', color: c.color, borderColor: c.color + '30' }}>
                            GRP {c.group}
                          </span>
                          <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                            {c.qualified}
                          </span>
                        </div>
                      </div>
                      {/* Verdict badge */}
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 leading-tight block"
                            style={{ color: c.color }}>
                        {c.verdict}
                      </span>
                      <h3 className="font-sans font-black text-base sm:text-lg text-white mb-2 leading-tight uppercase tracking-tight">{c.name}</h3>
                      <p className="font-serif text-zinc-400 text-xs leading-relaxed flex-1 font-medium">{c.story}</p>
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mt-4 group-hover:translate-x-1 transition-transform inline-block"
                            style={{ color: c.color }}>
                        Predict fixture →
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 px-6 overflow-hidden text-left bg-black">
        <div className="absolute inset-0">
          <Image src="/images/trophy_moment.webp" alt="" fill className="object-cover opacity-[0.80]" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E11D48] mb-3">WORLD CUP 2026 • SEASON ACTIVE</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight mb-4">
              The Tournament is Active.<br />
              <span className="text-[#E11D48]">Build your reputation.</span>
            </h2>
            <p className="font-sans text-gray-300 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
              Grade your matchday predictions. Evolve your Overall Rating and verify your football reputation in the community.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/world-cup-hub"
                    className="px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white hover:scale-105 transition-all shadow-lg text-center bg-gradient-to-r from-[#881337] to-[#E11D48]">
                Enter World Cup Hub
              </Link>
              <Link href="/football-iq"
                    className="px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest border border-white/20 text-white bg-white/10 hover:bg-white/20 transition-all hover:scale-105 text-center">
                View My Card
              </Link>
            </div>
          </div>
          <div className="hidden md:block md:w-1/2" />
        </div>
      </section>

    </div>
  );
}
