'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import SportsCenterCard from '@/components/SportsCenterCard';
import { getStoredProfile, saveStoredProfile, FootballIQProfile } from '@/lib/profileSync';
import { VerdictData } from '@/lib/tribunalDB';
import { 
  User, 
  Settings, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  RotateCcw, 
  Trophy, 
  Flag, 
  Shield, 
  Fingerprint, 
  Crown,
  Sparkle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Maps input countries to flag emojis for live card preview
function getFlagEmoji(countryName: string): string {
  const normalized = countryName.trim().toLowerCase();
  if (normalized.includes('arg')) return '🇦🇷';
  if (normalized.includes('bra')) return '🇧🇷';
  if (normalized.includes('por')) return '🇵🇹';
  if (normalized.includes('fra')) return '🇫🇷';
  if (normalized.includes('eng') || normalized.includes('gbr')) return '🏴\u200d󠁧\u200d󠁢\u200d󠁥\u200d󠁮\u200d󠁧\u200d󠁿';
  if (normalized.includes('ger') || normalized.includes('deu')) return '🇩🇪';
  if (normalized.includes('spa') || normalized.includes('esp')) return '🇪🇸';
  if (normalized.includes('net') || normalized.includes('hol') || normalized.includes('nld')) return '🇳🇱';
  if (normalized.includes('uru')) return '🇺🇾';
  if (normalized.includes('mar') || normalized.includes('mor')) return '🇲🇦';
  if (normalized.includes('jap') || normalized.includes('jpn')) return '🇯🇵';
  if (normalized.includes('sau') || normalized.includes('ksa')) return '🇸🇦';
  if (normalized.includes('usa') || normalized.includes('america') || normalized.includes('united states')) return '🇺🇸';
  if (normalized.includes('can')) return '🇨🇦';
  if (normalized.includes('mex')) return '🇲🇽';
  if (normalized.includes('ita')) return '🇮🇹';
  if (normalized.includes('cro')) return '🇭🇷';
  if (normalized.includes('bel')) return '🇧🇪';
  if (normalized.includes('sen')) return '🇸🇳';
  if (normalized.includes('swe')) return '🇸🇪';
  if (normalized.includes('tun')) return '🇹🇳';
  if (normalized.includes('egy')) return '🇪🇬';
  if (normalized.includes('irn') || normalized.includes('iran')) return '🇮🇷';
  if (normalized.includes('nzl') || normalized.includes('new zealand')) return '🇳🇿';
  return '🏳️';
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Settings inputs
  const [username, setUsername] = useState('');
  const [favoriteClub, setFavoriteClub] = useState('');
  const [favoriteNation, setFavoriteNation] = useState('');
  const [role, setRole] = useState<'FREE' | 'PREMIUM' | 'ADMIN'>('FREE');
  const [avatarSeed, setAvatarSeed] = useState('Reputation');
  const [avatarStyle, setAvatarStyle] = useState('fun-emoji');
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const prof = getStoredProfile();
    setProfile(prof);
    setUsername(prof.username);
    setFavoriteClub(prof.favoriteClub || '');
    setFavoriteNation(prof.favoriteNation || '');
    setRole(prof.role);
    setAvatarSeed(prof.avatarSeed);
    setAvatarStyle(prof.avatarStyle);
  }, []);

  // Card 3D Tilt Effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current) return;
    const container = cardContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const angleX = (yc - y) / 12;
    const angleY = (x - xc) / 12;
    
    container.style.transform = `perspective(800px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    if (!cardContainerRef.current) return;
    cardContainerRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  if (!mounted || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-gray-500">Loading Manager Locker Room...</p>
      </div>
    );
  }

  const handleSaveSettings = () => {
    if (!username.trim()) {
      alert('Username cannot be empty!');
      return;
    }

    const updated: FootballIQProfile = {
      ...profile,
      username: username.trim().replace(/\s+/g, '_'), // normalize username for routes
      favoriteClub,
      favoriteNation,
      role,
      avatarSeed,
      avatarStyle
    };

    setProfile(updated);
    saveStoredProfile(updated);
    
    // Sync with DB if online
    fetch('/api/resolve-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syncOnly: true,
        profile: updated
      })
    }).catch(err => console.warn('Offline sync skipped on save:', err));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetCampaign = () => {
    if (confirm('🚨 RED CARD DECISION: This will permanently terminate your manager contract, delete all predictions, wipe your collected verdict cards, and reset your rating to 50 OVR. This action cannot be undone. Are you sure you want to proceed?')) {
      localStorage.removeItem('var_cards_profile');
      localStorage.removeItem('var_cards_predictions');
      alert('Contract terminated. Campaign progress wiped. Resetting manager profile...');
      window.location.href = '/world-cup-hub';
    }
  };

  // Build the goated VerdictData object to feed to SportsCenterCard component
  const managerCardData: VerdictData = {
    id: 'mgr-preview',
    text: `Locker room authorization active. Registered manager signed to ${favoriteClub || 'VAR FC'}.`,
    mode: 'court',
    caseId: 2026,
    fanbase: null,
    isRivalry: false,
    rarity: role === 'ADMIN' ? 'LEGENDARY' : role === 'PREMIUM' ? 'EPIC' : 'COMMON',
    ovr: profile.overallRating,
    rulingText: 'Manager credentials registered successfully.',
    verdict: role === 'ADMIN' ? 'TRIBUNAL COMMISSIONER' : role === 'PREMIUM' ? 'CERTIFIED CHEF' : 'KNOWS BALL',
    charge: 'TACTICAL INGENUITY',
    sentence: `Managing ${favoriteClub || 'VAR FC'} under ${role.toLowerCase()} status.`,
    ach: {
      title: 'MANAGER LICENSE',
      desc: 'Registered tactician.',
      badge: 'trophy'
    },
    cardTheme: role === 'ADMIN' ? 'toty' : role === 'PREMIUM' ? 'gold' : 'silver',
    countryFlag: favoriteNation ? getFlagEmoji(favoriteNation) : '🏳️',
    playerName: username.toUpperCase() || 'MANAGER',
    playerPosition: 'MGR',
    clubName: favoriteClub || 'VAR FC',
    avatarStyle: avatarStyle,
    avatarSeed: avatarSeed,
    stats: [
      { label: 'IQ', name: 'Ball IQ', val: profile.overallRating },
      { label: 'DEL', name: 'Delusion', val: Math.max(1, 99 - profile.overallRating) }
    ]
  };


  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white pb-20 overflow-hidden">
      <Navbar />

      {/* Immersive Game Stadium Background - MATCHING LANDING PAGE 1-TO-1 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/world_cup_stadium.webp" 
          alt="World Cup Stadium Background" 
          fill 
          className="object-cover opacity-55 object-center" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-[#0A0A0A]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Goated Header Design (Matching Landing Page styling) */}
        <div className="pt-24 pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#881337] text-white rounded-full px-4 py-1.5 mb-4 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">BallKnowledge • Manager Locker Room</span>
          </div>
          <h1 className="font-display font-black uppercase tracking-tight text-white mb-2 text-center leading-[1.1]"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)'
              }}>
            Manager <span className="text-[#D97706]">Cockpit</span>
          </h1>
          <p className="font-sans text-gray-300 text-xs sm:text-sm max-w-md mx-auto font-medium">
            Configure your manager profile credentials, manage your license tier, or terminate your contract.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Signing Sheet (Form) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="glass-panel border-white/10 bg-black/60 backdrop-blur-md rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden shadow-2xl">
              
              {/* Gold/Burgundy Accent Stripes */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#881337] via-[#D97706] to-[#881337]" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-[#D97706]" /> SIGNING SHEET & CREDENTIALS
                  </h3>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                    Register your manager details with the VAR Tribunal
                  </p>
                </div>
                <Trophy className="w-6 h-6 text-[#D97706]/40 hidden sm:block" />
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-2">
                    <User className="w-3.5 h-3.5 text-gray-500" /> Manager Alias / Registration ID
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all"
                    placeholder="e.g. tactical_chef"
                  />
                  <p className="text-[9px] text-gray-500 mt-1 font-medium">Use alphanumeric characters and underscores only. No spaces.</p>
                </div>

                {/* Club & Nation Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-2">
                      <Shield className="w-3.5 h-3.5 text-gray-500" /> Club Allegiance
                    </label>
                    <input
                      type="text"
                      value={favoriteClub}
                      onChange={e => setFavoriteClub(e.target.value)}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all"
                      placeholder="e.g. Real Madrid, Arsenal, FC Bayern"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-2">
                      <Flag className="w-3.5 h-3.5 text-gray-500" /> National Allegiance
                    </label>
                    <input
                      type="text"
                      value={favoriteNation}
                      onChange={e => setFavoriteNation(e.target.value)}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all"
                      placeholder="e.g. Argentina, France, England"
                    />
                  </div>
                </div>

                {/* Custom Avatar parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-white/5 pt-5">
                  <div>
                    <label className="block text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-2">Manager Portrait Seed</label>
                    <input
                      type="text"
                      value={avatarSeed}
                      onChange={e => setAvatarSeed(e.target.value)}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-2">Portrait Render Style (Dicebear)</label>
                    <select
                      value={avatarStyle}
                      onChange={e => setAvatarStyle(e.target.value)}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all cursor-pointer"
                    >
                      <option value="fun-emoji">Fun Emoji</option>
                      <option value="bottts">Bots & Androids</option>
                      <option value="pixel-art">Pixel Art Retro</option>
                      <option value="avataaars">Human Avatars</option>
                    </select>
                  </div>
                </div>

                {/* License selector */}
                <div className="border-t border-white/5 pt-5">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-3">
                    <Crown className="w-3.5 h-3.5 text-gray-500" /> Manager License Tier (Role Setting)
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Free Option */}
                    <button
                      type="button"
                      onClick={() => setRole('FREE')}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        role === 'FREE'
                          ? 'bg-[#64748B]/10 border-[#64748B]/50 shadow-[0_0_15px_rgba(100,116,139,0.15)]'
                          : 'bg-black/30 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-900/20 border border-slate-950 px-2 py-0.5 rounded-md w-max mb-2">Bronze License</span>
                      <h4 className="font-display font-black text-xs text-white uppercase">Probationary (FREE)</h4>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium leading-relaxed">
                        3 hot takes per fixture, standard community chat features.
                      </p>
                    </button>

                    {/* Premium Option */}
                    <button
                      type="button"
                      onClick={() => setRole('PREMIUM')}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        role === 'PREMIUM'
                          ? 'bg-[#D97706]/10 border-[#D97706] shadow-[0_0_20px_rgba(217,119,6,0.25)]'
                          : 'bg-black/30 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#D97706] bg-[#D97706]/10 border border-[#D97706]/20 px-2 py-0.5 rounded-md w-max mb-2">Gold License</span>
                      <h4 className="font-display font-black text-xs text-white uppercase flex items-center gap-1">
                        Certified Tactician <Sparkle className="w-3 h-3 text-[#D97706] animate-pulse" />
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium leading-relaxed">
                        5 hot takes per match, substitutions enabled, highlighted chat styles.
                      </p>
                    </button>

                    {/* Admin Option */}
                    <button
                      type="button"
                      onClick={() => setRole('ADMIN')}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        role === 'ADMIN'
                          ? 'bg-[#881337]/15 border-[#881337] shadow-[0_0_20px_rgba(136,19,55,0.3)]'
                          : 'bg-black/30 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/20 border border-rose-950 px-2 py-0.5 rounded-md w-max mb-2">Commissioner</span>
                      <h4 className="font-display font-black text-xs text-white uppercase">Tribunal Head (ADMIN)</h4>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium leading-relaxed">
                        Full premium benefits plus controls to override time locks.
                      </p>
                    </button>
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-white/10 flex justify-center">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="flex items-center justify-center gap-2 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-102 hover:shadow-[0_0_20px_rgba(217,119,6,0.3)] bg-gradient-to-r from-[#881337] to-[#D97706] cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-300 animate-bounce" /> CONTRACT REGISTERED
                    </>
                  ) : (
                    <>
                      SIGN & REGISTER PROFILE
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: FUT Manager Card & Disciplinary Zone */}
          <div className="lg:col-span-4 space-y-6 flex flex-col items-center">
            
            {/* FUT-Style Manager Badge Preview */}
            <div className="text-center w-full flex flex-col items-center">
              <span className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4">Live Manager License Card</span>
              
              {/* 3D tilt container */}
              <div 
                ref={cardContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative bg-transparent rounded-[32px] transition-all duration-300 ease-out cursor-default"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.15s ease-out',
                  backfaceVisibility: 'hidden',
                }}
              >
                <SportsCenterCard data={managerCardData} />
              </div>
            </div>

            {/* RED CARD: Danger/Reset Zone */}
            <div className="glass-panel border-red-500/20 bg-red-950/5 rounded-3xl p-6 shadow-xl w-full max-w-[340px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />
              
              <h4 className="font-display font-black text-xs text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 animate-pulse" /> RED CARD DISCIPLINARY
              </h4>
              
              <ul className="text-[10px] text-gray-400 space-y-2 mb-5 font-medium list-disc list-inside">
                <li>Permanently terminates your contract</li>
                <li>All fixture predictions will be deleted</li>
                <li>FUT verdict cards album will be wiped</li>
                <li>Overall BallKnowledge resets to 50</li>
              </ul>
              
              <button
                type="button"
                onClick={handleResetCampaign}
                className="w-full py-3 rounded-full border border-red-500/40 text-red-500 hover:bg-red-500/10 font-display font-black text-[10px] uppercase tracking-widest transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> TERMINATE CONTRACT
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
