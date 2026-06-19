'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';


import { BREAKING_NEWS, DAILY_PROPHECIES, PLAYERS, COUNTRIES, flags } from '@/lib/landingData';



export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const [dailyProphecy, setDailyProphecy] = useState(DAILY_PROPHECIES[0]);

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
  
  useEffect(() => {
    setMounted(true);
    const day = new Date().getDate();
    setDailyProphecy(DAILY_PROPHECIES[day % DAILY_PROPHECIES.length]);

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
        } catch (e) {
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
    <div ref={containerRef} className="relative bg-white text-[#0A0A0A] min-h-screen overflow-hidden">

      {/* ── IMMERSIVE PRELOADER SCREEN ──────────────────────────────────────── */}
      <div 
        className={`fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          !loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-center px-6">
          {/* Spinning Golden & Burgundy Rings */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-t-[#D97706] border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1s' }} />
            <div className="absolute inset-1.5 rounded-full border-2 border-b-[#881337] border-t-transparent border-r-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            <span className="font-display font-black text-xs text-white uppercase tracking-wider">VAR</span>
          </div>
          
          <h2 className="font-display font-black text-2xl tracking-[0.2em] text-white uppercase mt-2">
            BALL<span className="text-[#D97706]">KNOWLEDGE</span>
          </h2>

          
          <div className="w-44 h-[2px] bg-white/10 rounded-full overflow-hidden relative mt-1">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#881337] to-[#D97706] w-full animate-loading-bar" />
          </div>
          
          <p className="text-[9px] font-sans font-black text-gray-500 uppercase tracking-[0.2em] mt-1">
            Connecting to World Cup Matchday Server...
          </p>
        </div>
      </div>

      {/* ── TICKER ──────────────────────────────────────────────────────────── */}

      <div className="fixed top-[52px] left-0 w-full h-9 z-30 flex items-center overflow-hidden select-none"
           style={{ background: '#881337' }}>
        <div className="shrink-0 px-4 h-full flex items-center bg-black border-r border-white/10 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D97706]">2026 LIVE</span>
        </div>
        <div className="flex w-max">
          <div className="animate-marquee whitespace-nowrap flex space-x-12 pr-12 text-[11px] font-semibold text-white/90 uppercase tracking-wide items-center">
            {BREAKING_NEWS.concat(BREAKING_NEWS).map((n, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#D97706] animate-pulse" />{n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-[116px] pb-6 flex flex-col items-center justify-center min-h-screen lg:h-screen bg-[#0A0A0A] text-white">
        <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image src="/images/world_cup_stadium.webp" alt="" fill className="object-cover opacity-55" sizes="100vw" priority />

          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-[#0A0A0A]" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
          className="relative w-full max-w-3xl mx-auto text-center py-4 md:py-6 flex flex-col justify-center items-center"
        >

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-[#881337] text-white rounded-full px-4 py-1.5 mb-4 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">World Cup 2026 • Season Active</span>
          </div>

          <h1 className="font-display font-black uppercase tracking-tight text-white mb-4 text-center leading-[1.05]"
              style={{
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)'
              }}>
            Build Your<br />
            Football <span className="text-[#D97706]">Reputation</span>
          </h1>

          <p className="font-sans text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-medium text-center">
            Reputation is built one matchday decision at a time. Lock in predictions, submit hot takes, collect verdict cards, and evolve your season-based Football IQ Profile.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link href="/world-cup-hub"
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-105 hover:opacity-90 shadow-md text-center bg-gradient-to-r from-[#881337] to-[#D97706]">
              Enter World Cup Hub
            </Link>
            <Link href="/football-iq"
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-105 hover:opacity-90 shadow-md border border-white/20 bg-white/10 hover:bg-white/20 text-center">
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
                <div key={s.l} className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl shadow-lg text-center min-w-[155px] transition-transform duration-300 hover:scale-105 flex flex-col justify-center">
                  <div className="font-display font-black text-2xl sm:text-3xl text-[#D97706]">{s.v}</div>
                  <div className="text-[9px] font-sans font-black uppercase tracking-widest text-gray-400 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          )}

        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TOOLS SHOWCASE: predictions, takes, and cards                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-6 border-t border-[#F3F4F6]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

            {/* TOOL 1: Matchday Takes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-[#881337]/15 overflow-hidden flex flex-col justify-between shadow-xs animate-fadeIn"
              style={{ background: '#FFF8F9' }}
            >
              <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#881337' }}>
                      <span className="text-white font-black text-xs">01</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">MODULE 01</p>
                      <h2 className="font-sans font-black text-xl text-black">Matchday Hot Takes</h2>
                    </div>
                  </div>
                  <p className="font-serif text-gray-600 text-sm leading-relaxed">
                    Submit bold takes on fixture matchdays. The Stockley Park VAR tribunal scores them using AI, updating your overall Hot Takes IQ.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Sandbox Take</label>
                      <textarea
                        value={sandboxText}
                        onChange={e => setSandboxText(e.target.value.slice(0, 120))}
                        rows={2}
                        className="w-full border border-gray-300 rounded-xl p-3.5 font-serif text-sm text-black placeholder-gray-500 focus:outline-none focus:border-[#881337] resize-none leading-relaxed bg-[#FAFAFA]"
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex gap-1.5 flex-wrap max-w-[85%]">
                          {[
                            { label: '🇦🇷 Messi take', text: 'Messi is the greatest of all time' },
                            { label: '🇵🇹 Ronaldo take', text: "Ronaldo's Saudi stats don't count" },
                          ].map(t => (
                            <button key={t.label} onClick={() => setSandboxText(t.text)}
                              className="text-[8px] font-bold px-2 py-0.5 rounded-full border border-gray-300 text-gray-700 hover:border-[#881337] hover:text-[#881337] transition-colors bg-white cursor-pointer">
                              {t.label}
                            </button>
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-400 font-semibold shrink-0">{sandboxText.length}/120</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                          Confidence <span className="text-[#881337] font-bold">{sandboxOvr}</span>
                        </label>
                        <input type="range" min="1" max="99" value={sandboxOvr}
                          onChange={e => setSandboxOvr(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#881337]" />
                      </div>
                    </div>
                  </div>
                </div>

                <Link href={`/world-cup-hub`}
                      className="block w-full py-3.5 text-center rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all hover:opacity-90 shadow-sm"
                      style={{ background: '#881337' }}>
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
              className="rounded-3xl border border-[#D97706]/15 overflow-hidden flex flex-col justify-between shadow-xs animate-fadeIn"
              style={{ background: '#FFFDF5' }}
            >
              <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#D97706' }}>
                      <span className="text-black font-black text-xs">02</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">MODULE 02</p>
                      <h2 className="font-sans font-black text-xl text-black">Fixture Predictions</h2>
                    </div>
                  </div>
                  <p className="font-serif text-gray-600 text-sm leading-relaxed">
                    Predict scorelines, MOTM, goalscorers, and possession. Earn rating increases: Exact score (+15) or Correct outcome (+5).
                  </p>

                  <div className="space-y-3">
                    <input type="text" value={predMOTM} onChange={e => setPredMOTM(e.target.value)}
                      placeholder="Predicted MOTM…"
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 font-serif text-sm text-black placeholder-gray-500 focus:outline-none focus:border-[#D97706] bg-white" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={predGoalscorer} onChange={e => setPredGoalscorer(e.target.value)}
                        placeholder="First Goalscorer…"
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 font-serif text-sm text-black placeholder-gray-500 focus:outline-none bg-white" />
                      <input type="text" value={predPossession} onChange={e => setPredPossession(e.target.value)}
                        placeholder="Possession Winner…"
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 font-serif text-sm text-black placeholder-gray-500 focus:outline-none bg-white" />
                    </div>
                  </div>
                </div>

                <Link href={`/world-cup-hub`}
                      className="block w-full py-3.5 text-center rounded-xl font-black text-sm uppercase tracking-widest text-black transition-all hover:opacity-90"
                      style={{ background: '#D97706' }}>
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
              className="rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-xs animate-fadeIn"
              style={{ background: '#F5F8FA' }}
            >
              <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#334155' }}>
                      <span className="text-white font-black text-xs">03</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">MODULE 03</p>
                      <h2 className="font-sans font-black text-xl text-black">Verdict Cards</h2>
                    </div>
                  </div>
                  
                  {/* Today's Prophecy Ticker */}
                  <div className="bg-slate-950 border border-[#D97706]/35 rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase text-[#D97706] tracking-widest flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5" />
                        ACTIVE SEASON FixTURE
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">STATUS: OPEN</span>
                    </div>
                    <p className="text-xs font-mono text-slate-200 leading-relaxed italic">
                      &quot;{dailyProphecy}&quot;
                    </p>
                  </div>

                  <p className="font-serif text-gray-600 text-sm leading-relaxed">
                    Earn collectible FUT-style Verdict Cards for completed matches. Album count increases dynamically: Common, Rare, Epic, and Legendary.
                  </p>
                </div>

                <Link href={`/world-cup-hub`}
                      className="block w-full py-3.5 text-center rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all hover:opacity-90 shadow-sm"
                      style={{ background: '#334155' }}>
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
      <section className="relative py-12 md:py-16 px-6 border-t border-[#F3F4F6]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#881337] mb-2">FIXTURE STORYLINES</p>
            <h2 className="font-serif italic font-black text-4xl sm:text-5xl text-[#0A0A0A] leading-tight">
              Predict the scripts of key stars.
            </h2>
            <p className="text-sm text-gray-500 font-sans mt-2 hidden lg:block">
              Drag the player dossiers around the Editor&apos;s Desk.
            </p>
          </div>

          {/* Desktop Draggable dossiers canvas desk */}
          <div ref={deskRef} className="relative w-full h-[980px] border border-black/5 rounded-3xl bg-[#FAF9F6] overflow-hidden p-6 hidden lg:block"
               style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}>
            
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={() => setIsTidied(!isTidied)}
                className="px-4.5 py-2 rounded-full font-black text-xs uppercase tracking-widest text-black bg-white hover:bg-gray-100 transition-colors shadow-md border border-gray-200 cursor-pointer flex items-center gap-1.5"
              >
                {isTidied ? 'Scatter Dossiers' : 'Tidy Up Desk'}
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[10rem] font-sans font-black text-black/[0.015]">DOSSIER</span>
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
                  whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  className="absolute w-[320px] h-[430px] group flex flex-col rounded-2xl overflow-hidden shadow-sm bg-white cursor-grab select-none hover:shadow-md transition-shadow border border-black/5"
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
                    <p className="font-serif text-[#374151] text-xs sm:text-sm leading-relaxed select-none">{p.hook}</p>
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
                className="group flex flex-col rounded-2xl overflow-hidden shadow-sm bg-white w-full h-[430px] sm:h-[460px]"
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
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
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
                  <p className="font-serif text-[#374151] text-xs sm:text-sm leading-relaxed flex-1">{p.hook}</p>
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
      <section className="py-16 md:py-24 px-6" style={{ background: '#0A0A0A' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 text-center">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#D97706] mb-3">NATIONS · SELECT FIXTURE CAMPAIGN</p>
            <h2 className="font-serif italic font-black text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
              Pick your nation.<br />
              <span style={{ color: '#D97706' }}>Own the narrative.</span>
            </h2>
            <p className="font-serif text-[#CBD5E1] text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              Every fanbase has its delusions. Select your nation to forecast upcoming fixtures, submit hot takes, and defend your country narrative.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {COUNTRIES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.04, duration: 0.45 }}
              >
                <Link href={c.href}
                  className="group flex flex-col p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full"
                  style={{ background: '#161616', border: `1px solid ${c.color}33` }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl sm:text-4xl">{c.flag}</span>
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded"
                          style={{ background: c.color + '20', color: c.color }}>
                      {c.verdict}
                    </span>
                  </div>
                  <h3 className="font-sans font-black text-base sm:text-lg md:text-xl text-white mb-2">{c.name}</h3>
                  <p className="font-serif text-[#CBD5E1] text-xs sm:text-sm leading-relaxed flex-1">{c.story}</p>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mt-4 group-hover:translate-x-1 transition-transform inline-block"
                        style={{ color: c.color }}>
                    Predict fixture →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 px-6 bg-white border-t border-[#F3F4F6]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#881337] mb-2">HOW IT WORKS</p>
            <h2 className="font-serif italic font-black text-3xl sm:text-4xl text-[#0A0A0A] leading-tight">
              Build Reputation in 3 Steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 relative">
            <div className="hidden sm:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-[#E5E7EB] z-0" />

            {[
              {
                n: '01', color: '#881337', bg: '#FEF2F2',
                title: 'Lock In Matchday Predictions',
                body: 'Select a fixture in the World Cup Hub. Submit scorelines and bold hot takes before the match kickoff.',
                platforms: ['Fixture Hub', 'Match predictions', 'Hot takes'],
              },
              {
                n: '02', color: '#D97706', bg: '#FFFBF0',
                title: 'Collect Custom Cards',
                body: 'Once completed, the tribunal grades your performance. Watch your rating evolve and reveal your Verdict Card.',
                platforms: ['Visionary Card', 'Delusion Card', 'Score Deltas'],
              },
              {
                n: '03', color: '#059669', bg: '#F0FDF4',
                title: 'Evolve Football IQ',
                body: 'Accumulate points across fixtures to increase your overall rating. Share cards and show off your public reputation.',
                platforms: ['WhatsApp Share', 'X / Twitter Link', 'FUT Album'],
              },
            ].map((s, i) => (
              <div key={s.n} className={`relative z-10 flex flex-col items-center text-center px-6 py-6 sm:py-0 ${i < 2 ? 'border-b sm:border-b-0 sm:border-r border-black/5 pb-8 sm:pb-0' : ''}`}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-sm"
                     style={{ background: s.bg, border: `2px solid ${s.color}` }}>
                  <span className="font-sans font-black text-xl" style={{ color: s.color }}>{s.n}</span>
                </div>
                <h3 className="font-sans font-black text-lg text-[#0A0A0A] mb-2">{s.title}</h3>
                <p className="font-serif text-[#6B7280] text-sm leading-relaxed mb-4">{s.body}</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {s.platforms.map(p => (
                    <span key={p} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-10 py-5 px-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
               style={{ background: '#0A0A0A' }}>
            <p className="font-serif italic text-white text-base leading-snug">
              Ready to start? Enter the hub and predict your first fixture.
            </p>
            <div className="flex gap-3 shrink-0">
              <Link href="/world-cup-hub"
                    className="px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest text-white hover:opacity-90 transition-all bg-gradient-to-r from-[#881337] to-[#D97706]">
                Enter World Cup Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 px-6 overflow-hidden text-left bg-black">
        <div className="absolute inset-0">
          <Image src="/images/trophy_moment.webp" alt="" fill className="object-cover opacity-100" sizes="100vw" />

          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#D97706] mb-3">WORLD CUP 2026 • SEASON ACTIVE</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight mb-4">
              The Tournament is Active.<br />
              <span className="text-[#D97706]">Build your reputation.</span>
            </h2>
            <p className="font-sans text-gray-300 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
              Grade your matchday predictions. Evolve your Overall Rating and verify your football reputation in the community.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/world-cup-hub"
                    className="px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white hover:scale-105 transition-all shadow-lg text-center bg-gradient-to-r from-[#881337] to-[#D97706]">
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
