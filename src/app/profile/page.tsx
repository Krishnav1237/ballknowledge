'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { getStoredProfile, saveStoredProfile, FootballIQProfile } from '@/lib/profileSync';
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
  Sparkle,
  BadgeAlert
} from 'lucide-react';

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
  const cardRef = useRef<HTMLDivElement>(null);

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
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const angleX = (yc - y) / 10;
    const angleY = (x - xc) / 10;
    
    card.style.transform = `perspective(600px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  if (!mounted || !profile) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center">
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

  return (
    <div className="relative min-h-screen bg-[#030712] text-foreground pb-20 overflow-hidden">
      <Navbar />

      {/* Immersive Game Stadium Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/game_stadium_showcase.webp" 
          alt="Locker Room Background" 
          fill 
          className="object-cover opacity-35 object-center scale-105 filter blur-[2px]" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/50 via-[#030712]/90 to-[#030712]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Hanging HUD Panel Header */}
        <div className="pt-[70px] pb-3 px-8 flex flex-col items-center text-center max-w-md mx-auto rounded-b-2xl border-x border-b border-white/10 bg-gradient-to-b from-black/80 via-black/55 to-black/10 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.8)] relative z-20 mb-10">
          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-gray-300 rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest mb-1 shadow-md">
            <Settings className="w-3 h-3 text-[#D97706]" /> MANAGER LOCKER ROOM
          </div>
          <h1 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider leading-none">
            Manager Profile
          </h1>
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

              <div className="space-y-5">
                {/* Username */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    <User className="w-3.5 h-3.5 text-gray-500" /> Manager Alias / Registration ID
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full h-12 bg-black/80 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all"
                    placeholder="e.g. tactical_chef"
                  />
                  <p className="text-[9px] text-gray-500 mt-1 font-medium">Use alphanumeric characters and underscores only. No spaces.</p>
                </div>

                {/* Club & Nation Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      <Shield className="w-3.5 h-3.5 text-gray-500" /> Club Allegiance
                    </label>
                    <input
                      type="text"
                      value={favoriteClub}
                      onChange={e => setFavoriteClub(e.target.value)}
                      className="w-full h-12 bg-black/80 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all"
                      placeholder="e.g. Real Madrid, Arsenal, FC Bayern"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      <Flag className="w-3.5 h-3.5 text-gray-500" /> National Allegiance
                    </label>
                    <input
                      type="text"
                      value={favoriteNation}
                      onChange={e => setFavoriteNation(e.target.value)}
                      className="w-full h-12 bg-black/80 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all"
                      placeholder="e.g. Argentina, France, England"
                    />
                  </div>
                </div>

                {/* Custom Avatar parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-white/5 pt-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manager Portrait Seed</label>
                    <input
                      type="text"
                      value={avatarSeed}
                      onChange={e => setAvatarSeed(e.target.value)}
                      className="w-full h-12 bg-black/80 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Portrait Render Style (Dicebear)</label>
                    <select
                      value={avatarStyle}
                      onChange={e => setAvatarStyle(e.target.value)}
                      className="w-full h-12 bg-black/80 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/35 transition-all cursor-pointer"
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
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    <Crown className="w-3.5 h-3.5 text-gray-500" /> Manager License Tier (Role Setting)
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Free Option */}
                    <button
                      type="button"
                      onClick={() => setRole('FREE')}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        role === 'FREE'
                          ? 'bg-orange-950/15 border-orange-700/60 shadow-[0_0_15px_rgba(194,65,12,0.1)]'
                          : 'bg-black/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-900/10 border border-orange-950 px-2 py-0.5 rounded-md w-max mb-2">Bronze License</span>
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
                          ? 'bg-[#D97706]/10 border-[#D97706]/60 shadow-[0_0_15px_rgba(217,119,6,0.15)]'
                          : 'bg-black/40 border-white/5 hover:border-white/10'
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
                          ? 'bg-[#881337]/15 border-[#881337]/60 shadow-[0_0_15px_rgba(136,19,55,0.2)]'
                          : 'bg-black/40 border-white/5 hover:border-white/10'
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
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#881337] to-[#D97706] hover:opacity-95 text-white font-display font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
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
          <div className="lg:col-span-4 space-y-8 flex flex-col items-center">
            
            {/* FUT-Style Manager Badge Preview */}
            <div className="text-center w-full max-w-[300px]">
              <span className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.25em] mb-3">Live Manager License Card</span>
              
              <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-[280px] h-[390px] mx-auto rounded-[32px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.85)] border border-[#D97706]/40 bg-gradient-to-b from-[#181D29] via-[#0E121E] to-[#040609] p-5 flex flex-col justify-between group transition-all duration-300 ease-out cursor-default"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.15s ease-out, border-color 0.3s ease',
                  backfaceVisibility: 'hidden',
                }}
              >
                
                {/* Holographic Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                {/* Card Header Shield lines */}
                <div className="absolute inset-[3px] border border-[#D97706]/15 rounded-[29px] pointer-events-none" />

                {/* Card Top Block */}
                <div className="flex justify-between items-start z-10">
                  {/* Stats Badge */}
                  <div className="flex flex-col items-center">
                    <span className="font-display font-black text-3xl text-[#D97706] tracking-tight leading-none">
                      {profile.overallRating}
                    </span>
                    <span className="text-[8px] font-black text-white/60 tracking-wider uppercase mt-0.5">OVR</span>
                    
                    <div className="w-5 h-[1px] bg-white/10 my-1.5" />
                    
                    <span className="text-[9px] font-black text-[#D97706]/85 tracking-widest leading-none">MGR</span>
                    
                    <div className="w-5 h-[1px] bg-white/10 my-1.5" />
                    
                    {/* Flag emoji resolved */}
                    <span className="text-sm" title={favoriteNation || 'No Nation'}>
                      {favoriteNation ? getFlagEmoji(favoriteNation) : '🏳️'}
                    </span>
                  </div>

                  {/* Manager Avatar image */}
                  <div className="relative w-28 h-28 rounded-2xl bg-black/35 border border-white/5 flex items-center justify-center p-2 mt-1 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`}
                      alt="Manager Avatar"
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                </div>

                {/* Divider Line */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D97706]/35 to-transparent my-1 z-10" />

                {/* Card Info & Stats Block */}
                <div className="text-center z-10 flex-grow flex flex-col justify-center">
                  <h4 className="font-sans font-black text-lg text-white uppercase tracking-wider truncate px-2 leading-none">
                    {username || 'MANAGER_ID'}
                  </h4>
                  <p className="text-[8px] font-black tracking-widest text-[#D97706]/90 uppercase mt-0.5 truncate max-w-full px-4">
                    {favoriteClub || 'UNATTACHED CLUB'}
                  </p>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3.5 mx-auto max-w-[210px] border-t border-white/5 pt-3">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400">
                      <span className="tracking-wide">PRE</span>
                      <span className="font-black text-white">{profile.predictionRating}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400">
                      <span className="tracking-wide">TAK</span>
                      <span className="font-black text-white">{profile.hotTakeRating}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400">
                      <span className="tracking-wide">TAC</span>
                      <span className="font-black text-white">{profile.tacticalRating}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400">
                      <span className="tracking-wide">COM</span>
                      <span className="font-black text-white">{profile.communityRating}</span>
                    </div>
                  </div>
                </div>

                {/* Badge License footer */}
                <div className="text-center pb-2 z-10">
                  <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-white/40">
                    {role === 'ADMIN' ? 'TRIBUNAL COMMISSIONER' : role === 'PREMIUM' ? 'GOLD TACTICIAN' : 'PROBATIONARY TACTICIAN'}
                  </span>
                </div>

              </div>
            </div>

            {/* RED CARD: Danger/Reset Zone */}
            <div className="glass-panel border-red-500/20 bg-red-950/10 rounded-3xl p-6 shadow-xl w-full max-w-[300px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />
              
              <h4 className="font-display font-black text-xs text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BadgeAlert className="w-4 h-4 shrink-0 text-red-500 animate-pulse" /> RED CARD DISCIPLINARY
              </h4>
              
              <p className="text-[10px] text-gray-400 leading-relaxed mb-4 font-medium">
                Request contract termination to delete all campaigns, predictions, verdict cards, and reset stats.
              </p>
              
              <button
                type="button"
                onClick={handleResetCampaign}
                className="w-full py-3 rounded-xl border border-red-500/35 hover:border-red-500 text-red-500 hover:bg-red-500/5 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-95"
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
