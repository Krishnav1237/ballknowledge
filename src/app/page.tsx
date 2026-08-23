'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Award, Share2 } from 'lucide-react';


import { BREAKING_NEWS, PLAYERS, COUNTRIES } from '@/lib/landingData';



export default function Home() {
  const deskRef = useRef<HTMLDivElement>(null);

  const [sandboxText,  setSandboxText]  = useState('Arsenal will retain the Premier League in 2026/27');
  const [sandboxOvr,   setSandboxOvr]   = useState(99);

  const [predMOTM,        setPredMOTM]        = useState('Bukayo Saka');
  const [predGoalscorer,  setPredGoalscorer]  = useState('Erling Haaland');
  const [predPossession,  setPredPossession]  = useState('Arsenal');

  const [isTidied,       setIsTidied]       = useState(false);
  const [stats, setStats] = useState({ takes: 0, cases: 0, cards: 0 });
  const [clubSearch, setClubSearch] = useState('');
  
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.takes && data.cases && data.cards) {
          setStats(data);
        }
      })
      .catch(err => console.warn('Failed to load stats baseline:', err));
  }, []);


  return (
    <div className="relative bg-[#030712] text-[#F3F4F6] min-h-screen overflow-x-hidden">

      {/* ── TICKER ──────────────────────────────────────────────────────────── */}

      <div className="fixed top-[52px] left-0 w-full h-9 z-30 flex items-center overflow-hidden select-none"
           style={{ background: '#881337' }}>
        <div className="shrink-0 px-4 h-full flex items-center bg-zinc-950 border-r border-white/10 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E11D48]">PL 26/27</span>
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
      <section className="relative px-6 pt-[116px] pb-6 flex flex-col items-center justify-center min-h-[85vh] lg:min-h-screen bg-[#030712] text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image src="/images/stadium_bg.webp" alt="" fill className="object-cover opacity-[0.40]" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/70 via-[#030712]/20 to-[#030712]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/60 via-transparent to-[#030712]/60" />
        </div>

        <div className="relative w-full max-w-3xl mx-auto text-center py-4 md:py-6 flex flex-col justify-center items-center">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-[#881337] text-white rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Premier League 2026/27 • Live</span>
          </div>

          <h1 className="font-display font-black uppercase tracking-tight text-white mb-4 text-center leading-[1.05]"
              style={{
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
              }}>
            You know ball.<br />
            <span className="text-[#E11D48]">Prove it.</span>
          </h1>

          <p className="font-sans text-zinc-400 text-[12.5px] sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8 font-semibold text-center">
            Call the next fixture. Get the card. Make them look at your OVR.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link href="/premier-league"
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-white transition-colors duration-150 hover:opacity-90 shadow-md text-center bg-gradient-to-r from-[#881337] to-[#E11D48]">
              Get my card
            </Link>
            <Link href="/leaderboard"
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-gray-300 transition-colors duration-150 hover:bg-white/10 shadow-md border border-white/10 bg-white/5 text-center">
              Show the board
            </Link>
          </div>

          {/* Live stats */}
          {(stats.takes > 0 || stats.cards > 0) && (
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {[
                { v: stats.takes.toLocaleString(), l: 'Takes dropped' },
                { v: stats.cards.toLocaleString(), l: 'Cards claimed' },
                { v: stats.cases.toLocaleString(), l: 'Managers live' },
              ].map(s => (
                <div key={s.l} className="bg-[#0B0F19]/80 border border-white/10 px-6 py-3 rounded-2xl shadow-md text-center min-w-[155px] flex flex-col justify-center">
                  <div className="font-display font-black text-2xl sm:text-3xl text-[#E11D48]">{s.v}</div>
                  <div className="text-[9px] font-sans font-black uppercase tracking-widest text-zinc-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-6 bg-[#030712] border-t border-white/10 relative overflow-hidden">
        {/* Subtle stadium texture at very low opacity for depth */}
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/images/stadium_bg.webp" alt="" fill className="object-cover opacity-[0.04] object-center" sizes="100vw" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E11D48] bg-[#E11D48]/10 px-3 py-1 rounded-full border border-[#E11D48]/20">
              THE LOOP
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider mt-4">
              Three moves. <span className="text-[#E11D48]">Then flex.</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-3 max-w-lg mx-auto font-bold">
              No lecture. Call it. Get the number. Make them beat you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                n: '01',
                icon: Target,
                color: '#E11D48',
                metric: 'LOCK',
                title: 'Call the match',
                body: 'Score. Scorer. MOTM. Lock it before kickoff. No edits after.',
              },
              {
                n: '02',
                icon: Award,
                color: '#E11D48',
                metric: 'CARD',
                title: 'Get the OVR',
                body: 'Your rating goes public. Legendary if you actually know ball.',
              },
              {
                n: '03',
                icon: Share2,
                color: '#E11D48',
                metric: 'POST',
                title: 'Dare the chat',
                body: 'Drop the card. “Beat me” is the whole product.',
              },
            ].map((s) => {
              const IconComponent = s.icon;
              return (
                <div
                  key={s.n}
                  className="relative group flex flex-col items-center text-center p-5 rounded-2xl border border-white/10 bg-[#0B0F19] transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-white/20 shadow-sm"
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
                  <h3 className="font-display font-black text-sm text-white mb-2 uppercase tracking-wide">{s.title}</h3>
                  <p className="font-sans text-gray-400 text-[11.5px] leading-relaxed font-bold">{s.body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 py-4 px-6 rounded-2xl border border-white/10 bg-[#0B0F19] shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-zinc-400 text-center md:text-left">
              Your OVR is public. If you are not on the board, you are nobody.
            </p>
            <Link
              href="/premier-league"
              className="shrink-0 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest text-white hover:opacity-90 transition-all bg-gradient-to-r from-[#881337] to-[#E11D48] shadow-[0_4px_12px_rgba(225,29,72,0.25)]"
            >
              Get my card
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
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">SAY IT</p>
                      <h2 className="font-sans font-black text-xl text-white">Hot takes</h2>
                    </div>
                  </div>
                  <p className="font-serif text-gray-400 text-sm leading-relaxed">
                    Type the take you would send at 2am. Then live with it when the card is public.
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
                            { label: 'ARS title take', text: 'Arsenal will retain the Premier League in 2026/27' },
                            { label: 'Haaland 30+', text: 'Haaland still hits 30 Premier League goals in 2026/27' },
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

                <Link href={`/premier-league`}
                      className="block w-full py-4 text-center rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-[1.01] hover:opacity-95 shadow-md active:scale-95 bg-gradient-to-r from-[#881337] to-[#a21c43]">
                  Drop the take →
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
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">CALL IT</p>
                      <h2 className="font-sans font-black text-xl text-white">The match</h2>
                    </div>
                  </div>
                  <p className="font-serif text-gray-400 text-sm leading-relaxed">
                    Score. MOTM. First goal. If you know ball, this is free. If you don’t, the card will say so.
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

                <Link href={`/premier-league`}
                      className="block w-full py-4 text-center rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-[1.01] hover:opacity-95 shadow-md active:scale-95 bg-gradient-to-r from-[#E11D48] to-[#EF4444]">
                  Lock the call →
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
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">FLEX IT</p>
                      <h2 className="font-sans font-black text-xl text-white">The card</h2>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-[#E11D48]/35 rounded-2xl p-4.5 relative overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase text-[#E11D48] tracking-widest flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5" />
                        GROUP CHAT BAIT
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">OVR LIVE</span>
                    </div>
                    <p className="text-xs font-mono text-rose-200/90 leading-relaxed italic">
                      &quot;I&apos;m 94 OVR. Arsenal 2-0. Saka MOTM. Beat me.&quot;
                    </p>
                  </div>

                  <p className="font-serif text-gray-400 text-sm leading-relaxed">
                    Common. Rare. Epic. Legendary. The number on the card is the argument.
                  </p>
                </div>

                <Link href={`/premier-league`}
                      className="block w-full py-4 text-center rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-[1.01] hover:opacity-95 shadow-md active:scale-95 bg-gradient-to-r from-[#334155] to-[#475569]">
                  Claim a card
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DRAGGABLE DOSSIERS PLATFORM                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── DOSSIERS ─────────────────────────────────────────────────────────── */}
      <section className="relative py-12 md:py-16 px-6 border-t border-white/10 bg-[#030712] text-white">
        {/* Trophy image bleed at very low opacity for editorial feel */}
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/images/trophy_moment.webp" alt="" fill className="object-cover opacity-[0.05] object-top" sizes="100vw" />
        </div>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E11D48] mb-2">THE NAMES</p>
            <h2 className="font-serif italic font-black text-4xl sm:text-5xl text-white leading-tight">
              These names decide the league. Call them first.
            </h2>
            <p className="text-sm text-gray-400 font-sans mt-2 hidden lg:block">
              Drag the cards. Then lock a take.
            </p>
          </div>

          {/* Desktop Draggable dossiers canvas desk */}
          <div ref={deskRef} className="relative w-full h-[980px] border border-white/10 rounded-3xl bg-[#0B0F19]/80 backdrop-blur-sm overflow-hidden p-6 hidden lg:block shadow-inner"
               style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}>
            
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={() => setIsTidied(!isTidied)}
                className="px-4.5 py-2 rounded-full font-black text-xs uppercase tracking-widest text-white bg-white/10 hover:bg-white/15 transition-colors shadow-sm border border-white/15 cursor-pointer flex items-center gap-1.5"
              >
                {isTidied ? 'Scatter them' : 'Line them up'}
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[10rem] font-sans font-black text-black/[0.025]">OVR</span>
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
                  className="absolute w-[320px] h-[430px] group flex flex-col rounded-2xl overflow-hidden shadow-md bg-[#0B0F19] cursor-grab select-none hover:shadow-xl transition-shadow border border-white/10"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    border: `1px solid ${p.border}20`,
                  }}
                >
                  <div className="relative w-full overflow-hidden select-none pointer-events-none bg-black/40" style={{ height: 210, flexShrink: 0 }}>
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      className="object-contain p-8 select-none pointer-events-none"
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
                    <p className="font-serif text-gray-400 text-xs sm:text-sm leading-relaxed select-none">{p.hook}</p>
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
                className="group flex flex-col rounded-2xl overflow-hidden shadow-md bg-[#0B0F19] w-full h-[430px] sm:h-[460px] border border-white/10"
                style={{ border: `1.5px solid ${p.border}30` }}
              >
                <div className="relative w-full overflow-hidden bg-black/40" style={{ height: 230, flexShrink: 0 }}>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    className="object-contain p-8"
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
                  <p className="font-serif text-gray-400 text-xs sm:text-sm leading-relaxed flex-1">{p.hook}</p>
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
      {/* CLUBS: pick a Premier League side                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 px-6 bg-[#030712] border-t border-gray-800 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/images/match_details_bg.webp" alt="" fill className="object-cover opacity-[0.24] object-center" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/40 to-[#030712]/80" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-10 md:mb-12 text-center">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#E11D48] mb-3">PREMIER LEAGUE 2026/27 · 20 CLUBS</p>
            <h2 className="font-serif italic font-black text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
              Pick a side.<br />
              <span className="text-[#E11D48]">Ride or die.</span>
            </h2>
            <p className="font-serif text-zinc-400 text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
              20 clubs. Your name on one of them. Call their fixtures like it is personal.
            </p>
          </div>

          {/* Search Row */}
          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-md">
              <input
                id="club-search"
                type="text"
                placeholder="Search Premier League club..."
                value={clubSearch}
                onChange={e => setClubSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E11D48]/50 focus:ring-1 focus:ring-[#E11D48]/20 transition-all shadow-inner"
              />
              {clubSearch && (
                <button onClick={() => setClubSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-sm cursor-pointer">✕</button>
              )}
            </div>
          </div>

          {/* Nations Grid - Rebuilt with larger cards */}
          {(() => {
            const filtered = COUNTRIES.filter(c => {
              return clubSearch === '' || 
                c.name.toLowerCase().includes(clubSearch.toLowerCase()) || 
                (c.fifa && c.fifa.toLowerCase().includes(clubSearch.toLowerCase()));
            });
            return filtered.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 font-bold text-sm">No clubs found for &ldquo;{clubSearch}&rdquo;</div>
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
                            {c.group}
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
                        Call their next one →
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
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E11D48] mb-3">PREMIER LEAGUE 2026/27 • LIVE</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight mb-4">
              The league is live.<br />
              <span className="text-[#E11D48]">Where is your card?</span>
            </h2>
            <p className="font-sans text-gray-300 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
              Everyone in your chat thinks they know ball. Only one of you has the OVR to prove it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/premier-league"
                    className="px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white hover:scale-105 transition-all shadow-lg text-center bg-gradient-to-r from-[#881337] to-[#E11D48]">
                Get my card
              </Link>
              <Link href="/leaderboard"
                    className="px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest border border-white/20 text-white bg-white/10 hover:bg-white/20 transition-all hover:scale-105 text-center">
                Show the board
              </Link>
            </div>
          </div>
          <div className="hidden md:block md:w-1/2" />
        </div>
      </section>

    </div>
  );
}
