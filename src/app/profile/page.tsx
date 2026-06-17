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
  Sparkle,
  BadgeAlert,
  Coins,
  Calendar,
  Lock,
  ChevronRight,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Auth variables
  const [authLoading, setAuthLoading] = useState(false);
  const [authStage, setAuthStage] = useState('');
  const [authProgress, setAuthProgress] = useState(0);
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

  // Simulated login execution flow
  const handleSocialSignIn = (provider: 'google' | 'facebook' | 'discord') => {
    setAuthLoading(true);
    setAuthProgress(10);
    setAuthStage("Establishing connection with authentication vault...");
    
    const interval = setInterval(() => {
      setAuthProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Update stage texts based on progress
        if (p > 80) setAuthStage("Loading user statistics & OVR cards...");
        else if (p > 50) setAuthStage("Validating credentials with VAR databases...");
        else if (p > 25) setAuthStage(`Decrypting ${provider} credentials token...`);
        
        return p + Math.floor(Math.random() * 20) + 5;
      });
    }, 200);

    setTimeout(() => {
      const loggedInProfile: FootballIQProfile = {
        ...profile,
        isAuthenticated: true,
        authProvider: provider,
        xp: profile.xp || 1200,
        points: profile.points || 150
      };

      setProfile(loggedInProfile);
      saveStoredProfile(loggedInProfile);
      setAuthLoading(false);
      setAuthProgress(0);
      
      // Dispatch storage event to sync Navbar changes instantly
      window.dispatchEvent(new Event('storage'));
    }, 2200);
  };

  const handleSaveSettings = () => {
    if (!username.trim()) {
      alert('Username cannot be empty!');
      return;
    }

    const updated: FootballIQProfile = {
      ...profile,
      username: username.trim().replace(/\s+/g, '_'),
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

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CASE A: SIGNED OUT (OAUTH AUTHENTICATION LOCKER ROOM)                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {!profile.isAuthenticated ? (
        <div className="relative w-screen min-h-screen flex flex-col justify-center items-center px-6 pt-16 z-10">
          
          {/* Locker Room Background (High Contrast, Immersive) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <Image 
              src="/images/locker_room_auth.webp" 
              alt="Locker Room Authentication Background" 
              fill 
              className="object-cover opacity-70 object-center" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#0A0A0A]" />
          </div>

          <div className="relative z-10 w-full max-w-md text-center">
            <h1 className="font-display font-black uppercase tracking-tight text-white mb-2 leading-[1.15]"
                style={{
                  fontSize: 'clamp(1.8rem, 6vw, 3rem)',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)'
                }}>
              Locker Room <br />
              <span className="text-[#D97706]">Access Gate</span>
            </h1>
            
            <p className="font-sans text-gray-300 text-xs sm:text-sm max-w-sm mx-auto mb-8 font-medium leading-relaxed">
              Verify your identity to load your season predictions cockpit, unlock matching card collectibles, and manage licensing contracts.
            </p>

            {/* Authenticator Buttons Card */}
            <div className="glass-panel border-white/10 bg-black/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 space-y-5 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#881337] via-[#D97706] to-[#881337]" />
              
              <h3 className="font-display font-black text-xs text-gray-400 uppercase tracking-widest border-b border-white/5 pb-3">
                Choose Authentication Provider
              </h3>

              {authLoading ? (
                /* Preloading Progress State */
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#D97706] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-1.5 rounded-full border-2 border-b-[#881337] border-t-transparent border-r-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  
                  <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#D97706] animate-pulse">
                    Authorizing Session
                  </h4>
                  
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative mt-4 max-w-[200px] mx-auto">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#881337] to-[#D97706] transition-all duration-300" style={{ width: `${authProgress}%` }} />
                  </div>
                  
                  <p className="text-[9px] font-sans font-black text-gray-500 uppercase tracking-wider mt-2.5 px-4 leading-relaxed line-clamp-1">
                    {authStage}
                  </p>
                </div>
              ) : (
                /* Provider Buttons */
                <div className="space-y-3 pt-2">
                  
                  {/* Google */}
                  <button
                    onClick={() => handleSocialSignIn('google')}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer group hover:shadow-[0_0_15px_rgba(255,255,255,0.06)] active:scale-98"
                  >
                    {/* Simulated Google Logo */}
                    <svg className="w-4 h-4 fill-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.377-2.87-6.377-6.38 0-3.51 2.867-6.379 6.377-6.379 1.616 0 3.086.61 4.22 1.625l3.24-3.24C19.07 2.06 15.89 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.898 0 10.741-4.229 10.741-11.24 0-.648-.065-1.32-.194-1.955H12.24z" />
                    </svg>
                    SIGN IN WITH GOOGLE
                  </button>

                  {/* Discord */}
                  <button
                    onClick={() => handleSocialSignIn('discord')}
                    className="w-full h-12 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 transition-all text-[#7289DA] hover:text-white font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer group hover:shadow-[0_0_15px_rgba(88,101,242,0.18)] active:scale-98"
                  >
                    {/* Simulated Discord Logo */}
                    <svg className="w-4 h-4 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 127.14 96.36">
                      <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2.07a75.79,75.79,0,0,0,72.68,0c.83.73,1.68,1.42,2.58,2.07a68.52,68.52,0,0,1-10.5,5,78.82,78.82,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.07,48.12,123.32,25.35,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,46,53.9,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96.14,53,91,65.69,84.69,65.69Z"/>
                    </svg>
                    SIGN IN WITH DISCORD
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => handleSocialSignIn('facebook')}
                    className="w-full h-12 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 transition-all text-[#1877F2] hover:text-white font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer group hover:shadow-[0_0_15px_rgba(24,119,242,0.18)] active:scale-98"
                  >
                    {/* Simulated Facebook Logo */}
                    <svg className="w-4 h-4 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    SIGN IN WITH FACEBOOK
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20">
          
          {/* Locker Room Stadium Backdrop */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <Image 
              src="/images/world_cup_stadium.webp" 
              alt="World Cup Stadium Background" 
              fill 
              className="object-cover opacity-55 object-center scale-102" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-[#0A0A0A]" />
          </div>

          {/* Heading HUD Panel */}
          <div className="text-center max-w-2xl mx-auto mb-10 pt-4">
            <h1 className="font-display font-black uppercase tracking-tight text-white mb-2 text-center leading-[1.1]"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)'
                }}>
              Manager <span className="text-[#D97706]">Cockpit</span>
            </h1>
            <p className="font-sans text-gray-300 text-xs sm:text-sm max-w-md mx-auto font-medium">
              Configure your manager profile credentials, manage your license tier, or check active matchday predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
            
            {/* LEFT COLUMN: Signing Sheet & Dashboard Sub-features */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Feature 1: Signing Sheet Contract Form */}
              <div className="glass-panel border-white/10 bg-black/60 backdrop-blur-md rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden shadow-2xl">
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
                        3 predictions per fixture, standard community chat features.
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
                        5 predictions per match, substitutions enabled, highlighted chat styles.
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

            {/* Feature 2: Active Matchday Tactics (Dashboard Feature) */}
            <div className="glass-panel border-white/10 bg-black/60 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <Calendar className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-display font-black text-xs text-white uppercase tracking-widest">
                  Active Matchday Tactics
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { home: 'Argentina', away: 'Canada', date: 'LIVE', pred: '2 - 0', status: 'Locked' },
                  { home: 'Germany', away: 'Scotland', date: 'Tomorrow', pred: '3 - 1', status: 'Editable' },
                  { home: 'France', away: 'Poland', date: 'June 25', pred: '2 - 1', status: 'Editable' }
                ].map((m, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between text-xs transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${m.date === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                      <div>
                        <p className="font-bold text-white uppercase tracking-wider">{m.home} vs {m.away}</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">{m.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#D97706]">Pick</p>
                        <p className="font-mono font-black text-white">{m.pred}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        m.status === 'Locked' ? 'bg-red-950/20 text-red-400 border border-red-950' : 'bg-green-950/20 text-green-400 border border-green-950'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 3: Trophy Cabinet Cabinet Binder */}
            <div className="glass-panel border-white/10 bg-black/60 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <Trophy className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-display font-black text-xs text-white uppercase tracking-widest">
                  Manager Trophy Cabinet
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { r: 'LEGENDARY', icon: '🏆', slot: 'Slot 1' },
                  { r: 'EPIC', icon: '⭐', slot: 'Slot 2' },
                  { r: 'RARE', icon: '⚽', slot: 'Slot 3' },
                  { r: 'LOCKED', icon: '🔒', slot: 'Slot 4' },
                  { r: 'LOCKED', icon: '🔒', slot: 'Slot 5' },
                  { r: 'LOCKED', icon: '🔒', slot: 'Slot 6' }
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-xl py-4 transition-transform hover:scale-105 relative group">
                    <span className="text-xl mb-1">{s.icon}</span>
                    <span className="text-[7.5px] font-black uppercase text-gray-500 tracking-wider">{s.slot}</span>
                    
                    {s.r === 'LOCKED' ? (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    ) : (
                      <span className={`absolute bottom-1 text-[6.5px] font-black uppercase tracking-widest px-1 rounded ${
                        s.r === 'LEGENDARY' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                        s.r === 'EPIC' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {s.r}
                      </span>
                    )}
                  </div>
                ))}
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

            {/* Manager Stats HUD card (XP and points) */}
            <div className="glass-panel border-white/10 bg-black/60 backdrop-blur-md rounded-3xl p-5 shadow-2xl w-full max-w-[340px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-[3px] h-full bg-[#D97706]" />
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3.5">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#D97706]" />
                  <span className="font-display font-black text-xs text-white uppercase tracking-wider">Manager Stats HUD</span>
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded border border-[#D97706]/20">Active Career</span>
              </div>

              <div className="space-y-4">
                {/* XP Level */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Manager Level 5</span>
                    <span className="text-[9px] font-bold text-white font-mono">2,450 / 5,000 XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#881337] to-[#D97706] rounded-full" style={{ width: '49%' }} />
                  </div>
                </div>

                {/* BallPoints Balance */}
                <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none">Club Points Balance</p>
                    <p className="font-display font-black text-lg text-white mt-1 leading-none">
                      {profile.points || 150} <span className="text-xs font-sans text-gray-500 font-bold uppercase">BP</span>
                    </p>
                  </div>
                  <Coins className="w-5 h-5 text-[#D97706] animate-pulse" />
                </div>
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
      )}
    </div>
  );
}
