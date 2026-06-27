'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SportsCenterCard from '@/components/SportsCenterCard';
import { getStoredProfile, saveStoredProfile, syncProfileWithDb, wipeProfileFromDb, FootballIQProfile } from '@/lib/profileSync';
import { VerdictData } from '@/lib/tribunalDB';
import { getFlagEmoji } from '@/lib/matchUtils';
import { 
  User, 
  Sparkles, 
  RotateCcw
} from 'lucide-react';

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

  // AI synthesis states
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);

  // Settings Save State
  const [saveLoading, setSaveLoading] = useState(false);

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

    // Sync with database on load
    syncProfileWithDb(prof).then(synced => {
      setProfile(synced);
      setUsername(synced.username);
      setFavoriteClub(synced.favoriteClub || '');
      setFavoriteNation(synced.favoriteNation || '');
      setRole(synced.role);
      setAvatarSeed(synced.avatarSeed);
      setAvatarStyle(synced.avatarStyle);
    }).catch(err => console.warn('Failed to sync profile with database on mount:', err));
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

    setTimeout(async () => {
      setAvatarSeed(pendingPhoto);
      setAvatarStyle(avatarStyle);
      setIsSynthesizing(false);
      
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

      try {
        await syncProfileWithDb(updated);
      } catch (err) {
        console.warn('DB sync failed after synthesis:', err);
      }
    }, 3000);
  };

  const handleSaveSettings = async () => {
    if (!profile) return;
    if (!username.trim()) {
      alert('Username cannot be empty.');
      return;
    }
    setSaveLoading(true);
    const updated: FootballIQProfile = {
      ...profile,
      username: username.trim().replace(/\s+/g, '_'),
      favoriteClub,
      favoriteNation,
      role
    };
    try {
      const synced = await syncProfileWithDb(updated);
      setProfile(synced);
      setUsername(synced.username);
      setFavoriteClub(synced.favoriteClub || '');
      setFavoriteNation(synced.favoriteNation || '');
      setRole(synced.role);
      alert('Settings saved and synchronized with database! 🤝');
    } catch (e) {
      console.warn('Failed to sync settings with database:', e);
      alert('Settings saved locally, but database sync failed.');
    } finally {
      setSaveLoading(false);
    }
  };


  if (!mounted || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337]/20 border-t-[#E11D48] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-zinc-500">Loading Manager Locker Room...</p>
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

    setTimeout(async () => {
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

      try {
        await syncProfileWithDb(loggedInProfile);
      } catch (err) {
        console.warn('DB sync failed after social login:', err);
      }
    }, 2200);
  };



  const handleResetCampaign = async () => {
    if (confirm('🚨 RED CARD DECISION: This will permanently terminate your manager contract, delete all predictions, wipe your collected verdict cards, and reset your rating to 50 OVR. This action cannot be undone. Are you sure you want to proceed?')) {
      if (profile && profile.isAuthenticated && profile.username) {
        try {
          await wipeProfileFromDb(profile.username);
        } catch (e) {
          console.warn('Failed to wipe profile from database:', e);
        }
      }
      localStorage.removeItem('var_cards_profile');
      localStorage.removeItem('var_cards_predictions');
      window.dispatchEvent(new Event('storage'));
      alert('Contract terminated. Campaign progress wiped. Resetting manager profile...');
      window.location.href = '/world-cup-hub';
    }
  };

  // Removed image presets style fallback

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
    cardTheme: 'gold',
    countryFlag: favoriteNation ? getFlagEmoji(favoriteNation) : '🏳️',
    playerName: username.toUpperCase() || 'MANAGER',
    playerPosition: 'MGR',
    clubName: favoriteClub || 'VAR FC',
    avatarStyle: avatarStyle,
    avatarSeed: avatarSeed,
    stats: [
      { label: 'PRD', name: 'Prediction', val: profile.predictionRating },
      { label: 'MGR', name: 'Manager Score', val: profile.managerRating },
      { label: 'HOT', name: 'Hot Take', val: profile.hotTakeRating },
      { label: 'RST', name: 'Roast Score', val: profile.roastScore }
    ]
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white flex flex-col">

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CASE A: SIGNED OUT (OAUTH AUTHENTICATION LOCKER ROOM)                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {!profile.isAuthenticated ? (
        <div className="relative w-screen min-h-screen flex flex-col justify-center items-center px-6 pt-[52px] z-10">
          
          {/* Locker Room Background (High Contrast, Immersive) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <Image 
              src="/images/locker_room_auth.webp" 
              alt="Locker Room Authentication Background" 
              fill 
              className="object-cover opacity-[0.40] object-center" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-background/60 to-background" />
          </div>

          <div className="relative z-10 w-full max-w-md text-center">
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider leading-none mb-3">
              LOCKER ROOM <span className="text-[#E11D48]">ACCESS GATE</span>
            </h1>
            
            <p className="text-gray-400 text-[10px] sm:text-[11px] mt-2.5 font-bold uppercase tracking-widest leading-none max-w-sm mx-auto mb-8">
              VERIFY IDENTITY TO ACCESS SEASON PREDICTIONS COCKPIT <span className="text-zinc-300 mx-2">•</span> UNLOCK COLLECTIBLES
            </p>

            {/* Authenticator Buttons Card */}
            <div className="bg-[#12070A]/85 border border-rose-900/35 rounded-[2rem] p-6 md:p-8 space-y-5 shadow-[0_0_50px_rgba(225,29,72,0.15)] relative backdrop-blur-md">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#881337] via-[#E11D48] to-[#881337]" />
              
              <h3 className="font-display font-black text-xs text-rose-300 uppercase tracking-widest border-b border-rose-900/30 pb-3">
                Choose Authentication Provider
              </h3>

              {authLoading ? (
                /* Preloading Progress State */
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#E11D48] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-1.5 rounded-full border-2 border-b-[#881337] border-t-transparent border-r-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  
                  <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#E11D48] animate-pulse">
                    Authorizing Session
                  </h4>
                  
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative mt-4 max-w-[200px] mx-auto">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#881337] to-[#E11D48] transition-all duration-300" style={{ width: `${authProgress}%` }} />
                  </div>
                  
                  <p className="text-[9px] font-sans font-black text-gray-400 uppercase tracking-wider mt-2.5 px-4 leading-relaxed line-clamp-1">
                    {authStage}
                  </p>
                </div>
              ) : (
                /* Provider Buttons */
                <div className="space-y-3 pt-2">
                  
                  {/* Google */}
                  <button
                    onClick={() => handleSocialSignIn('google')}
                    className="w-full h-12 rounded-xl bg-rose-950/10 border border-rose-900/40 hover:bg-rose-900/20 hover:border-rose-500/50 transition-all text-white font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer group hover:shadow-[0_4px_12px_rgba(225,29,72,0.15)] active:scale-98"
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
                    className="w-full h-12 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/25 hover:bg-[#5865F2] hover:border-[#5865F2] transition-all text-[#5865F2] hover:text-white font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer group hover:shadow-[0_4px_12px_rgba(88,101,242,0.25)] active:scale-98"
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
                    className="w-full h-12 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/25 hover:bg-[#1877F2] hover:border-[#1877F2] transition-all text-[#1877F2] hover:text-white font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer group hover:shadow-[0_4px_12px_rgba(24,119,242,0.25)] active:scale-98"
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
        <div className="relative flex flex-col bg-[#07090E] pt-[52px] flex-grow pb-16">

          {/* Clean Subdued Background */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <Image
              src="/images/world_cup_stadium.webp"
              alt="World Cup Stadium Background"
              fill
              className="object-cover opacity-[0.25] object-center scale-102"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/60 via-black/70 to-[#07090E]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-rose-950/10 rounded-full blur-[120px] pointer-events-none" />
          </div>

          {/* Main Dashboard Panel */}
          <div className="relative z-10 flex flex-col px-6 pt-1 pb-4 max-w-8xl w-full mx-auto">
            <div className="w-full flex flex-col bg-[#0F111A]/85 border border-rose-900/35 rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.08)] backdrop-blur-2xl relative overflow-hidden select-none">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#E11D48] to-transparent z-30" />

              {/* ─── TOP BAR ─── */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-rose-950/20 shrink-0 z-20">
                <div>
                  <h2 className="font-sans font-bold text-base text-white uppercase tracking-wider leading-none">
                    Manager Profile Settings
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="border border-rose-900/35 text-rose-300 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-[#881337]/10">
                    {role === 'ADMIN' ? 'Crimson Pass' : role === 'PREMIUM' ? 'Gold Pass' : 'Bronze Pass'}
                  </span>
                </div>
              </div>

              {/* ─── 3-COLUMN GRID (DASHBOARD CONSOLE) ─── */}
              <div className="grid grid-cols-12 gap-6 p-6 z-20">

                {/* ══ COLUMN 1: Identity & Credentials (col-span-12 lg:col-span-4) ══ */}
                <div className="col-span-12 lg:col-span-4 flex flex-col justify-between gap-5 bg-[#14080B]/50 border border-rose-900/30 rounded-xl p-6 relative shadow-lg">
                  <div className="flex flex-col gap-5">
                    <div className="shrink-0 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-rose-500 tracking-wider uppercase border-l-2 border-rose-600 pl-2">Identity Credentials</h3>
                    </div>

                    {/* Avatar Upload zone and inputs stack vertically */}
                    <div className="flex flex-col gap-5">
                      
                      {/* Avatar preview */}
                      <div className="flex flex-col items-center gap-3 bg-[#13070A]/30 border border-rose-900/10 rounded-xl p-4">
                        <div className="relative w-24 h-24 shrink-0">
                          <input
                            type="file"
                            accept="image/*"
                            id="portrait-upload"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <label
                            htmlFor="portrait-upload"
                            className="relative flex w-full h-full bg-[#13070A]/85 border border-dashed border-rose-900/40 hover:border-[#E11D48]/55 rounded-xl overflow-hidden cursor-pointer group transition-all"
                          >
                            {pendingPhoto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={pendingPhoto} alt="Upload preview" className="w-full h-full object-cover" />
                            ) : avatarSeed.startsWith('data:image/') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarSeed} alt="Active face" className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                                <User className="w-6 h-6 mb-1 text-rose-500/80 group-hover:text-[#E11D48] transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 group-hover:text-rose-300 transition-colors">Upload Portrait</span>
                              </div>
                            )}
                          </label>
                          {(pendingPhoto || avatarSeed.startsWith('data:image/')) && (
                            <button
                              type="button"
                              onClick={() => { setPendingPhoto(null); handleRemoveCustomPhoto(); }}
                              className="absolute -top-1.5 -right-1.5 bg-[#E11D48] hover:bg-rose-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer shadow-md z-30 transition-all"
                              title="Remove photo"
                            >×</button>
                          )}
                        </div>
                        <p className="text-[9px] text-zinc-400 leading-snug text-center max-w-[150px]">
                          Upload square portrait photo
                        </p>
                      </div>

                      {/* Inputs form */}
                      <div className="flex flex-col gap-4">
                        <div className="space-y-1.5 group">
                          <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-wide transition-all duration-200 group-focus-within:text-rose-300 group-hover:text-rose-300 drop-shadow-[0_0_6px_rgba(225,29,72,0.2)]">
                            Manager Alias
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
                            className="w-full h-9 bg-[#13070A]/85 border border-rose-900/50 hover:border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded-lg px-3 text-xs font-semibold text-white placeholder-rose-500/30 focus:shadow-[0_0_15px_rgba(225,29,72,0.25)] transition-all font-mono"
                            placeholder="tactical_titan"
                          />
                        </div>

                        <div className="space-y-1.5 group">
                          <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-wide transition-all duration-200 group-focus-within:text-rose-300 group-hover:text-rose-300 drop-shadow-[0_0_6px_rgba(225,29,72,0.2)]">
                            Supporting Country (National Allegiance)
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
                            className="w-full h-9 bg-[#13070A]/85 border border-rose-900/50 hover:border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded-lg px-3 text-xs font-semibold text-white placeholder-rose-500/30 focus:shadow-[0_0_15px_rgba(225,29,72,0.25)] transition-all"
                            placeholder="Argentina / Brazil / England"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Reset button at the bottom */}
                  <div className="pt-3 border-t border-rose-900/20 shrink-0 mt-auto">
                    <button
                      type="button"
                      onClick={handleResetCampaign}
                      className="w-full h-9 rounded-lg bg-rose-900/10 hover:bg-rose-900/25 border border-rose-900/35 hover:border-rose-600/50 text-rose-400 hover:text-rose-200 font-sans font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Wipe Campaign &amp; Reset Profile
                    </button>
                  </div>
                </div>

                {/* ══ COLUMN 2: Live Card Preview Showcase (col-span-12 lg:col-span-4) ══ */}
                <div className="col-span-12 lg:col-span-4 flex flex-col justify-center items-center h-[510px] bg-[#12070A]/30 border border-rose-900/30 rounded-xl p-4 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-rose-900/10 via-transparent to-transparent pointer-events-none" />
                  <div className="relative flex items-center justify-center w-full h-full">
                    <div className="absolute scale-[0.9] origin-center shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                      <SportsCenterCard data={managerCardData} />
                    </div>
                  </div>
                </div>

                {/* ══ COLUMN 3: Stats & Actions (col-span-12 lg:col-span-4) ══ */}
                <div className="col-span-12 lg:col-span-4 flex flex-col justify-between gap-5 bg-[#14080B]/50 border border-rose-900/30 rounded-xl p-6 relative shadow-lg">
                  <div className="flex flex-col gap-4">
                    <div className="shrink-0 flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-rose-500 tracking-wider uppercase border-l-2 border-rose-600 pl-2">Reputation &amp; Stats</h3>
                    </div>

                    {/* OVR Summary Badge */}
                    <div className="flex items-center gap-4 bg-[#13070A]/85 border border-rose-900/40 rounded-xl p-3.5 shrink-0 shadow-inner relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#E11D48]/5 to-transparent pointer-events-none" />
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E11D48] to-[#881337] flex flex-col items-center justify-center shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                        <span className="text-white font-black text-xl leading-none">{profile.overallRating}</span>
                        <span className="text-[7px] text-rose-200 font-bold uppercase tracking-widest mt-0.5">OVR</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">FOOTBALL IQ RATING</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate">{username || 'MANAGER'}</p>
                      </div>
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0 ${
                        profile.overallRating >= 80
                          ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                          : profile.overallRating >= 60
                          ? 'text-orange-400 border-orange-500/30 bg-orange-500/10'
                          : 'text-zinc-400 border-rose-950/30 bg-rose-950/10'
                      }`}>
                        {profile.overallRating >= 80 ? 'WORLD CLASS' : profile.overallRating >= 60 ? 'PRO' : 'AMATEUR'}
                      </span>
                    </div>

                    {/* Stat bars */}
                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: 'PRD', val: profile.predictionRating, color: '#E11D48', name: 'PREDICTIONS', weight: '35%' },
                        { label: 'MGR', val: profile.managerRating,    color: '#FB7185', name: 'MANAGER INDEX', weight: '25%' },
                        { label: 'HOT', val: profile.hotTakeRating,    color: '#F43F5E', name: 'HOT TAKES',    weight: '25%' },
                        { label: 'RST', val: profile.roastScore,       color: '#FDA4AF', name: 'ROAST INDEX',  weight: '15%' }
                      ].map(stat => (
                        <div key={stat.label} className="bg-[#13070A]/50 border border-rose-900/20 rounded-lg p-2.5 space-y-1.5 shadow-inner">
                          <div className="flex justify-between items-baseline">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-[10px]" style={{ color: stat.color }}>{stat.label}</span>
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">{stat.name}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-mono font-black text-xs" style={{ color: stat.color }}>{stat.val}</span>
                              <span className="text-[8px] text-zinc-500 font-mono font-bold">/{stat.weight}</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-rose-900 via-rose-600 to-[#E11D48]"
                              style={{ width: `${stat.val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Operations */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-rose-900/20 shrink-0 mt-auto">
                    <button
                      type="button"
                      disabled={isSynthesizing || !pendingPhoto}
                      onClick={runAISynthesis}
                      className={`flex-grow h-10 rounded-lg font-sans font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(225,29,72,0.15)] ${
                        !pendingPhoto
                          ? 'bg-rose-950/5 text-rose-900/40 border border-rose-950/20 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-rose-600 to-[#881337] hover:from-rose-500 hover:to-[#a21a3a] text-white cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isSynthesizing ? 'SYNTHESIZING...' : 'SYNTHESIZE'}
                    </button>

                    <button
                      type="button"
                      disabled={saveLoading}
                      onClick={handleSaveSettings}
                      className="flex-grow h-10 rounded-lg bg-[#12070A]/80 hover:bg-rose-950/40 border border-rose-900/40 hover:border-rose-600/60 text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      {saveLoading ? 'SAVING...' : 'SAVE DOSSIER'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
