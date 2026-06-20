'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import SportsCenterCard from '@/components/SportsCenterCard';
import { getStoredProfile, saveStoredProfile, FootballIQProfile } from '@/lib/profileSync';
import { VerdictData } from '@/lib/tribunalDB';
import { getFlagEmoji } from '@/lib/matchUtils';
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

  // AI synthesis states
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthProgress, setSynthProgress] = useState(0);
  const [synthLogs, setSynthLogs] = useState<string[]>([]);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size too large! Please choose an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setPendingPhoto(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomPhoto = () => {
    setAvatarSeed('Reputation');
    setAvatarStyle('fun-emoji');
    setPendingPhoto(null);
    if (profile) {
      const updated: FootballIQProfile = {
        ...profile,
        avatarSeed: 'Reputation',
        avatarStyle: 'fun-emoji'
      };
      setProfile(updated);
      saveStoredProfile(updated);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const runAISynthesis = () => {
    if (!profile) return;
    if (!username.trim()) {
      alert('Please fill out your Manager Alias registration ID first!');
      return;
    }
    if (!favoriteNation.trim()) {
      alert('Please fill out your National Allegiance to style the jersey colors!');
      return;
    }
    if (!pendingPhoto) {
      alert('Please select and upload a source face photo first!');
      return;
    }

    setIsSynthesizing(true);
    setSynthProgress(0);
    setSynthLogs(["[AI-GATE] Initializing image generation connection (NVIDIA NIM)..."]);

    const logMessages = [
      "Establishing link with GPU computing node (NVIDIA L40S)...",
      "Scanning facial geometry & alignment (ViT Model)...",
      "Isolating face contours and extracting alpha transparency mask...",
      "Generating sports jersey stripes template in vector layers...",
      "Rendering custom stripes matching national flag colors...",
      "Applying ambient locker room 3D lighting occlusion...",
      "Refining overall BallKnowledge OVR rating boundaries...",
      "Synthesis complete! Updating custom card avatar details..."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setSynthProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        if (p > 0 && p % 12 === 0 && currentLogIndex < logMessages.length) {
          const logMsg = logMessages[currentLogIndex];
          setSynthLogs(logs => [...logs, `[AI-MODEL] ${logMsg}`]);
          currentLogIndex++;
        }
        
        return p + 2;
      });
    }, 50);

    setTimeout(() => {
      setAvatarSeed(pendingPhoto);
      setAvatarStyle(avatarStyle);
      setIsSynthesizing(false);
      setSynthLogs(logs => [...logs, "[SYSTEM] Synthesis successfully committed! Live Manager Card updated."]);
      
      const updated: FootballIQProfile = {
        ...profile,
        username: username.trim().replace(/\s+/g, '_'),
        favoriteClub,
        favoriteNation,
        role,
        avatarSeed: pendingPhoto,
        avatarStyle: avatarStyle
      };
      setProfile(updated);
      saveStoredProfile(updated);
      window.dispatchEvent(new Event('storage'));
    }, 3000);
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
    if (!profile) return;
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

  const displayAvatarStyle = avatarStyle.startsWith('ai-') ? avatarStyle : 'ai-3d-render';

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
    avatarStyle: displayAvatarStyle,
    avatarSeed: avatarSeed,
    stats: [
      { label: 'PRD', name: 'Prediction', val: profile.predictionRating },
      { label: 'HTK', name: 'Hot Take', val: profile.hotTakeRating },
      { label: 'SEL', name: 'Team Selection', val: profile.tacticalRating },
      { label: 'CMY', name: 'Community Banter', val: profile.communityRating }
    ]
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white pb-20 overflow-hidden">

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
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider leading-none mb-3"
                style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)' }}>
              LOCKER ROOM <span className="text-[#D97706]">ACCESS GATE</span>
            </h1>
            
            <p className="text-gray-400 text-[10px] sm:text-[11px] mt-2.5 font-bold uppercase tracking-widest leading-none max-w-sm mx-auto mb-8">
              VERIFY IDENTITY TO ACCESS SEASON PREDICTIONS COCKPIT <span className="text-gray-600 mx-2">•</span> UNLOCK COLLECTIBLES
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
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-[100px]">
          
          {/* Locker Room Stadium Backdrop */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <Image 
              src="/images/world_cup_stadium.webp" 
              alt="World Cup Stadium Background" 
              fill 
              className="object-cover opacity-35 object-center scale-102" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-[#0A0A0A]" />
          </div>

          {/* Heading HUD Panel: Spacing-aligned */}
          <div className="relative z-20 text-center max-w-xl mx-auto mb-6 bg-gradient-to-b from-black/90 to-black/30 border border-white/5 rounded-2xl p-4 shadow-2xl backdrop-blur-xs">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#881337] via-[#D97706] to-[#881337] rounded-t-2xl" />
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider leading-none mb-1.5"
                style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85)' }}>
              MANAGER <span className="text-[#D97706]">COCKPIT</span>
            </h1>
            <p className="text-gray-400 text-[10px] sm:text-[11px] mt-2 font-bold uppercase tracking-widest leading-none">
              CONFIGURE DETAILS & TRIGGER AI PORTRAIT SYNTHESIS
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 max-w-6xl mx-auto">
            
            {/* LEFT COLUMN: AI Manager Card Generator */}
            <div className="lg:col-span-7">
              <div className="glass-panel border-white/10 bg-black/60 backdrop-blur-md rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#881337] via-[#D97706] to-[#881337]" />
                
                <div>
                  <h3 className="font-display font-black text-base text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D97706] animate-pulse" /> AI Manager Card Generator
                  </h3>
                  <p className="text-gray-400 text-[9.5px] uppercase font-bold tracking-widest mt-0.5">
                    Generate your personalized FIFA-style manager card using AI synthesis
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Manager Name */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-1.5">
                      Manager Name / Alias
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => {
                        const val = e.target.value;
                        setUsername(val);
                        if (profile) {
                          const updated = { ...profile, username: val };
                          setProfile(updated);
                          saveStoredProfile(updated);
                          window.dispatchEvent(new Event('storage'));
                        }
                      }}
                      className="w-full h-10 bg-black/45 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] transition-all"
                      placeholder="e.g. Pep_Guardiola"
                    />
                  </div>

                  {/* Favorite Country */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-1.5">
                      Favorite Country
                    </label>
                    <input
                      type="text"
                      value={favoriteNation}
                      onChange={e => {
                        const val = e.target.value;
                        setFavoriteNation(val);
                        if (profile) {
                          const updated = { ...profile, favoriteNation: val };
                          setProfile(updated);
                          saveStoredProfile(updated);
                          window.dispatchEvent(new Event('storage'));
                        }
                      }}
                      className="w-full h-10 bg-black/45 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] transition-all"
                      placeholder="e.g. Argentina, France, Portugal"
                    />
                  </div>

                  {/* AI Style Model */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-1.5">
                      AI Portrait Style Model
                    </label>
                    <select
                      value={displayAvatarStyle}
                      onChange={e => {
                        const val = e.target.value;
                        setAvatarStyle(val);
                        if (profile) {
                          const updated = { ...profile, avatarStyle: val };
                          setProfile(updated);
                          saveStoredProfile(updated);
                          window.dispatchEvent(new Event('storage'));
                        }
                      }}
                      className="w-full h-10 bg-black/45 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] transition-all cursor-pointer"
                    >
                      <option value="ai-3d-render">FIFA 3D Render (Default)</option>
                      <option value="ai-hologram">Futuristic Cyan Hologram</option>
                      <option value="ai-cyber-gold">Cyberpunk Gold Elite</option>
                      <option value="ai-oil-paint">VAR Tribunal Sketch</option>
                    </select>
                  </div>

                  {/* License Tier Info */}
                  <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                    <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest">Active License:</span>
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      role === 'PREMIUM' ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}>
                      {role === 'ADMIN' ? 'Crimson Pass (Commissioner)' : role === 'PREMIUM' ? 'Gold Pass (Chef)' : 'Bronze Pass (Free)'}
                    </span>
                  </div>

                  {/* Face Photo Uploader */}
                  <div>
                    <label className="block text-[10px] font-black text-[#D97706] uppercase tracking-widest mb-1.5">Upload Source Face Photo</label>
                    <div className="flex items-center gap-3 bg-black/45 border border-white/10 rounded-xl p-2.5">
                      <div className="relative w-12 h-12 bg-zinc-900 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                        {pendingPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pendingPhoto} alt="Pending Source" className="w-full h-full object-cover" />
                        ) : avatarSeed.startsWith('data:image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarSeed} alt="Active Source" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-grow text-left">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="portrait-upload"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <label
                            htmlFor="portrait-upload"
                            className="px-2.5 py-1.5 bg-[#D97706]/10 hover:bg-[#D97706]/20 border border-[#D97706]/40 hover:border-[#D97706]/60 rounded-lg font-display font-black text-[8px] uppercase tracking-widest text-[#D97706] cursor-pointer transition-all active:scale-95"
                          >
                            Choose Face
                          </label>
                          {(pendingPhoto || avatarSeed.startsWith('data:image/')) && (
                            <button
                              type="button"
                              onClick={() => {
                                setPendingPhoto(null);
                                handleRemoveCustomPhoto();
                              }}
                              className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-900/60 rounded-lg font-display font-black text-[8px] uppercase tracking-widest text-red-400 cursor-pointer transition-all active:scale-95"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Synthesizer trigger */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSynthesizing || !pendingPhoto}
                      onClick={runAISynthesis}
                      className={`w-full py-3 rounded-xl font-display font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-[0.98] ${
                        !pendingPhoto 
                          ? 'bg-[#1b1f2e] text-gray-500 border border-white/5 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#D97706] via-[#881337] to-[#D97706] hover:opacity-95 text-white cursor-pointer shadow-[0_0_15px_rgba(217,119,6,0.15)]'
                      }`}
                    >
                      {isSynthesizing ? 'Synthesizing...' : 'Run AI Card Synthesis Model'}
                    </button>
                  </div>

                  {/* Synthesis Progress Terminals */}
                  {isSynthesizing && (
                    <div className="bg-black/95 border border-white/10 rounded-xl p-3 font-mono text-[9px] text-emerald-400 space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center font-bold">
                        <span>MODEL PIPELINE SYNTHESIS</span>
                        <span>{synthProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-950 border border-white/5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-200" style={{ width: `${synthProgress}%` }} />
                      </div>
                      <div className="max-h-[60px] overflow-y-auto space-y-0.5 scrollbar-none pt-0.5">
                        {synthLogs.slice(-2).map((log, idx) => (
                          <div key={idx} className="leading-normal truncate">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: FUT Manager Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              
              {/* FUT-Style Manager Badge Preview */}
              <div className="text-center w-full flex flex-col items-center">
                <span className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.25em] mb-3">Live Manager License Card</span>
                
                {/* Static Preview Container */}
                <div className="relative bg-transparent rounded-[32px] scale-90 sm:scale-95 origin-top my-1">
                  <SportsCenterCard data={managerCardData} />
                </div>
              </div>

            </div>

          </div>

          {/* Danger Zone: Low profile contract termination at the page footer */}
          <div className="relative z-20 flex justify-center mt-6">
            <button
              type="button"
              onClick={handleResetCampaign}
              className="px-4 py-2 bg-red-950/10 hover:bg-red-950/30 border border-red-900/20 hover:border-red-900/40 rounded-xl font-display font-black text-[9px] uppercase tracking-widest text-red-400/80 hover:text-red-400 cursor-pointer transition-all active:scale-[0.97] flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(239,68,68,0.06)]"
            >
              <RotateCcw className="w-3 h-3 text-red-500" /> WIPE CAMPAIGN & TERMINATE CONTRACT
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
