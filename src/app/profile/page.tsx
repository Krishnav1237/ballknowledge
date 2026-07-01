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
  RotateCcw,
  LogOut
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
  // Toast notification (replaces all alert() calls)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'warn' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  
  
  // Custom Credentials Auth Inputs
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [password, setPassword] = useState('');

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
    if (prof.inputImage) {
      setPendingPhoto(prof.inputImage);
    }

    // Sync with database on load
    syncProfileWithDb(prof).then(synced => {
      setProfile(synced);
      setUsername(synced.username);
      setFavoriteClub(synced.favoriteClub || '');
      setFavoriteNation(synced.favoriteNation || '');
      setRole(synced.role);
      setAvatarSeed(synced.avatarSeed);
      setAvatarStyle(synced.avatarStyle);
      if (synced.inputImage) {
        setPendingPhoto(synced.inputImage);
      }
    }).catch(err => console.warn('Failed to sync profile with database on mount:', err));
  }, []);

  // Reused to verify credential tokens from both SDK prompt and custom redirect flows
  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setAuthStage('Authenticating with Google...');
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google login failed');
      }

      setAuthStage('');
      const loggedInProfile: FootballIQProfile = {
        ...data.profile,
        isAuthenticated: true,
        collectedCards: data.profile.collectedCards || []
      };
      setProfile(loggedInProfile);
      saveStoredProfile(loggedInProfile);
      
      // Fetch user-specific predictions and match cards to prevent data overlap
      await syncProfileWithDb(loggedInProfile);
      
      // Update form values
      setUsername(data.profile.username);
      setFavoriteClub(data.profile.favoriteClub || '');
      setFavoriteNation(data.profile.favoriteNation || '');
      setRole(data.profile.role);
      setAvatarSeed(data.profile.avatarSeed);
      setAvatarStyle(data.profile.avatarStyle);
      if (data.profile.inputImage) {
        setPendingPhoto(data.profile.inputImage);
      }

      window.dispatchEvent(new Event('storage'));
      showToast('Successfully signed in with Google! 🚀', 'success');
    } catch (err: any) {
      console.error(err);
      setAuthStage('');
      showToast(err.message || 'Google Auth failed', 'error');
    }
  };

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const parseGoogleHash = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('id_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get('id_token');
        if (idToken) {
          // If this window is the popup, post the token back to the main window and close
          if (window.opener) {
            window.opener.postMessage({ type: 'google-popup-success', token: idToken }, '*');
            window.close();
            return;
          }

          // Direct redirect flow execution
          await handleGoogleCredentialResponse({ credential: idToken });
          window.location.hash = ''; // Clear Hash to prevent route replays
        }
      }
    };

    const handleOAuthMessage = async (event: MessageEvent) => {
      // 1. Existing OAuth callback routes (e.g. Discord, Facebook)
      if (event.data?.type === 'oauth-success') {
        const profileData = event.data.profile;
        const loggedIn = { ...profileData, isAuthenticated: true };
        setProfile(loggedIn);
        saveStoredProfile(loggedIn);
        await syncProfileWithDb(loggedIn);

        setUsername(profileData.username);
        setFavoriteClub(profileData.favoriteClub || '');
        setFavoriteNation(profileData.favoriteNation || '');
        setRole(profileData.role);
        setAvatarSeed(profileData.avatarSeed);
        setAvatarStyle(profileData.avatarStyle);
        if (profileData.inputImage) {
          setPendingPhoto(profileData.inputImage);
        }

        window.dispatchEvent(new Event('storage'));
        showToast('Successfully authenticated! 🚀', 'success');
      }

      // 2. Custom Google popup implicit auth success
      if (event.data?.type === 'google-popup-success' && event.data.token) {
        await handleGoogleCredentialResponse({ credential: event.data.token });
      }
    };

    parseGoogleHash();
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [mounted]);

  const handleCustomGoogleLogin = () => {
    const clientId = '1047514336049-7gr11k2iirfphv7242m8u8v83q89k6e8.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(window.location.origin + '/profile');
    const nonce = `bk_${Math.random().toString(36).substring(2)}`;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=openid%20profile%20email&nonce=${nonce}&state=google`;

    // Open Google Sign-In in a premium window popup
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    try {
      const popup = window.open(url, 'GoogleSignIn', `width=${width},height=${height},left=${left},top=${top}`);
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Fallback to direct redirect if popups are blocked by browser settings
        window.location.href = url;
      }
    } catch (e) {
      window.location.href = url;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Photo too large. Please choose an image under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // 768px gives Flux enough resolution to read facial features accurately.
        // 256px was too low — face details were lost, causing identity mismatch.
        const MAX_DIM = 768;
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.92);
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

  const runAISynthesis = async () => {
    if (!profile) return;
    if (!username.trim()) {
      showToast('Please enter your Manager Alias first.', 'warn');
      return;
    }
    if (!favoriteNation.trim()) {
      showToast('Please enter your Supporting Country first.', 'warn');
      return;
    }
    if (!pendingPhoto) {
      showToast('Please upload a face photo first.', 'warn');
      return;
    }

    setIsSynthesizing(true);

    try {
      const res = await fetch('/api/generate-viral-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().replace(/\s+/g, '_'),
          faceImage: pendingPhoto,
          favoriteNation,
          overallRating: profile.overallRating,
          predictionRating: profile.predictionRating,
          hotTakeRating: profile.hotTakeRating,
          managerRating: profile.managerRating,
          roastScore: profile.roastScore,
          verdict: 'CERTIFIED CHEF',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(`AI Error: ${data.error || 'Server error'}`, 'error');
        setIsSynthesizing(false);
        return;
      }

      const finalAvatar = data.aiImageUrl || pendingPhoto;
      setAvatarSeed(finalAvatar);
      setIsSynthesizing(false);

      const updated: FootballIQProfile = {
        ...profile,
        username: username.trim().replace(/\s+/g, '_'),
        favoriteNation,
        avatarSeed: finalAvatar,
        inputImage: pendingPhoto
      };
      setProfile(updated);
      saveStoredProfile(updated);
      window.dispatchEvent(new Event('storage'));

      try {
        await syncProfileWithDb(updated);
      } catch (err) {
        console.warn('DB sync failed after synthesis:', err);
      }

      if (data.aiImageUrl) {
        showToast('AI card generated successfully!', 'success');
      }
    } catch (err: any) {
      setIsSynthesizing(false);
      showToast(`Generation error: ${err?.message || 'Failed to connect to AI engine.'}`, 'error');
    }
  };

  const handleSaveSettings = async () => {
    if (!profile) return;
    if (!username.trim()) {
      showToast('Username cannot be empty.', 'warn');
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
      showToast('Settings saved and synced!', 'success');
    } catch (e) {
      console.warn('Failed to sync settings with database:', e);
      showToast('Saved locally (database sync failed).', 'warn');
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

  // Toast banner component
  const Toast = toastMessage ? (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-top-4 duration-300 ${
      toastMessage.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-200' :
      toastMessage.type === 'error'   ? 'bg-red-900/90 border-red-500/30 text-red-200' :
                                        'bg-amber-900/90 border-amber-500/30 text-amber-200'
    }`}>{toastMessage.text}</div>
  ) : null;

  // Custom Credentials Authentication handler
  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Please enter a username and password.', 'warn');
      return;
    }
    
    setAuthLoading(true);
    setAuthProgress(30);
    setAuthStage(authMode === 'signup' ? 'Signing up credentials...' : 'Verifying credentials...');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          username: username.trim(),
          password: password.trim(),
          favoriteClub: favoriteClub || 'VAR FC',
          favoriteNation: favoriteNation || 'Argentina'
        })
      });

      setAuthProgress(70);
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Authentication failed.', 'error');
        setAuthLoading(false);
        return;
      }

      setAuthProgress(100);
      setAuthStage('Access granted!');
      
      const loggedInProfile: FootballIQProfile = {
        ...data.profile,
        isAuthenticated: true,
        collectedCards: data.profile.collectedCards || []
      };

      setProfile(loggedInProfile);
      saveStoredProfile(loggedInProfile);
      
      // Fetch user-specific predictions and match cards to prevent data overlap
      await syncProfileWithDb(loggedInProfile);
      
      // Update settings inputs with db profile values
      setUsername(data.profile.username);
      setFavoriteClub(data.profile.favoriteClub || '');
      setFavoriteNation(data.profile.favoriteNation || '');
      setRole(data.profile.role);
      setAvatarSeed(data.profile.avatarSeed);
      setAvatarStyle(data.profile.avatarStyle);

      showToast(data.message || 'Locker room access active!', 'success');
      
      // Dispatch storage event to sync Navbar changes instantly
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      showToast('Connection failed. Please try again.', 'error');
      console.error('[Auth Client] Error:', err);
    } finally {
      setAuthLoading(false);
      setAuthProgress(0);
    }
  };



  const handleSignOut = () => {
    localStorage.removeItem('var_cards_profile');
    localStorage.removeItem('var_cards_predictions');
    setProfile(null);
    setUsername('');
    setPassword('');
    setFavoriteClub('');
    setFavoriteNation('');
    setAvatarSeed('Reputation');
    setAvatarStyle('fun-emoji');
    setPendingPhoto(null);
    window.dispatchEvent(new Event('storage'));
    showToast('Successfully signed out of Locker Room. 🚪', 'success');
  };

  const handleResetCampaign = async () => {
    if (confirm('🚨 RED CARD DECISION: This will permanently terminate your manager contract, delete all predictions, wipe your collected verdict cards, and reset your rating to 50 OVR. This action cannot be undone. Are you sure you want to proceed?')) {
      if (profile && profile.username) {
        try {
          await wipeProfileFromDb(profile.username);
        } catch (e) {
          console.warn('Failed to wipe profile from database:', e);
        }
      }
      localStorage.removeItem('var_cards_profile');
      localStorage.removeItem('var_cards_predictions');
      window.dispatchEvent(new Event('storage'));
      showToast('Contract terminated. Profile reset.', 'warn');
      setTimeout(() => { window.location.href = '/world-cup-hub'; }, 1500);
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
    aiImageUrl: (avatarSeed.startsWith('http') || avatarSeed.startsWith('data:image')) ? avatarSeed : undefined,
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
        <div className="relative w-full min-h-screen flex flex-col justify-center items-center px-6 pt-[52px] z-10">
          
          {/* Locker Room Background (High Contrast, Immersive) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <Image 
              src="/images/locker_room_auth.webp" 
              alt="Locker Room Authentication Background" 
              fill 
              className="object-cover opacity-[0.52] object-center" 
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
              
              {authLoading ? (
                /* Preloading Progress State */
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#E11D48] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-1.5 rounded-full border-2 border-b-[#881337] border-t-transparent border-r-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  
                  <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#E11D48] animate-pulse">
                    {authStage}
                  </h4>
                  
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative mt-4 max-w-[200px] mx-auto">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#881337] to-[#E11D48] transition-all duration-300" style={{ width: `${authProgress}%` }} />
                  </div>
                </div>
              ) : (
                /* Credentials Form */
                <form onSubmit={handleCredentialsAuth} className="space-y-4 pt-2">
                  <div className="flex bg-[#13070A] p-1 rounded-xl border border-rose-950/45">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        authMode === 'signin'
                          ? 'bg-[#E11D48] text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        authMode === 'signup'
                          ? 'bg-[#E11D48] text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-[8.5px] font-black uppercase tracking-widest text-rose-400">
                      Manager Alias
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="tactical_titan"
                      className="w-full h-10 bg-[#13070A] border border-rose-900/50 focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/45 rounded-xl px-3.5 text-xs font-bold text-white placeholder-rose-500/20 shadow-inner font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-[8.5px] font-black uppercase tracking-widest text-rose-400">
                      Security Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 bg-[#13070A] border border-rose-900/50 focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/45 rounded-xl px-3.5 text-xs font-bold text-white placeholder-rose-500/20 shadow-inner"
                    />
                  </div>

                  {authMode === 'signup' && (
                    <>
                      <div className="space-y-1.5 text-left">
                        <label className="block text-[8.5px] font-black uppercase tracking-widest text-rose-400">
                          National Allegiance
                        </label>
                        <input
                          type="text"
                          value={favoriteNation}
                          onChange={e => setFavoriteNation(e.target.value)}
                          placeholder="e.g. Argentina, Germany"
                          className="w-full h-10 bg-[#13070A] border border-rose-900/50 focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/45 rounded-xl px-3.5 text-xs font-bold text-white placeholder-rose-500/20 shadow-inner"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#881337] hover:from-rose-500 hover:to-[#a21a3a] text-white font-display font-black text-[10px] uppercase tracking-widest cursor-pointer group shadow-[0_4px_12px_rgba(225,29,72,0.2)] hover:shadow-[0_4px_16px_rgba(225,29,72,0.35)] active:scale-98 transition-all"
                  >
                    {authMode === 'signin' ? 'ENTER LOCKER ROOM' : 'CREATE MANAGER PROFILE'}
                  </button>

                  <div className="relative flex items-center justify-center my-3.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-rose-950/20"></div>
                    </div>
                    <span className="relative px-3 bg-[#0B0305] text-[9px] font-black tracking-widest text-zinc-500 uppercase">OR</span>
                  </div>

                  <div className="flex flex-col gap-2.5 items-center w-full mt-3">
                    <button
                      type="button"
                      onClick={handleCustomGoogleLogin}
                      className="w-full max-w-[280px] h-11 rounded-xl bg-white hover:bg-zinc-100 text-black font-sans font-black text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 14.99 1 12 1 7.24 1 3.21 3.73 1.25 7.69l3.87 3C6.04 7.63 8.78 5.04 12 5.04z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.87 3c2.26-2.09 3.54-5.17 3.54-8.79z" />
                        <path fill="#FBBC05" d="M5.12 10.69c-.25-.76-.39-1.57-.39-2.42s.14-1.66.39-2.42L1.25 4.85C.45 6.45 0 8.23 0 10.12s.45 3.67 1.25 5.27l3.87-3z" />
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.87-3c-1.1.74-2.5 1.18-4.09 1.18-3.22 0-5.96-2.59-6.93-5.65l-3.87 3C3.21 20.27 7.24 23 12 23z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="relative flex flex-col bg-[#07090E] pt-[52px] min-h-[calc(100vh-52px)] flex-grow pb-8 justify-center">

          {/* Clean Subdued Background */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <Image
              src="/images/world_cup_stadium.webp"
              alt="World Cup Stadium Background"
              fill
              className="object-cover opacity-[0.52] object-center scale-102"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/60 via-black/70 to-[#07090E]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-rose-950/10 rounded-full blur-[120px] pointer-events-none" />
          </div>

          {/* Main Dashboard Panel */}
          <div className="relative z-10 flex flex-col px-4 sm:px-6 py-4 max-w-8xl w-full mx-auto flex-grow justify-center">
            <div className="w-full flex flex-col bg-[#0F111A]/90 border border-rose-900/40 rounded-3xl shadow-[0_0_60px_rgba(225,29,72,0.12)] backdrop-blur-2xl relative overflow-hidden select-none">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#E11D48] to-transparent z-30" />

              {/* ─── TOP BAR ─── */}
              <div className="flex justify-between items-center px-6 sm:px-8 py-5 border-b border-rose-950/30 shrink-0 z-20 bg-black/30">
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
                <div className="col-span-12 lg:col-span-4 flex flex-col justify-between h-[520px] bg-[#14080B]/80 border border-rose-900/40 rounded-2xl p-6 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
                  <div className="flex flex-col gap-6">
                    <div className="shrink-0 flex items-center justify-between border-b border-rose-900/30 pb-3">
                      <h3 className="text-xs font-black text-rose-400 tracking-widest uppercase border-l-2 border-[#E11D48] pl-2.5">Identity Credentials</h3>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold">DOSSIER #2026</span>
                    </div>

                    {/* Avatar Upload zone and inputs stack vertically */}
                    <div className="flex flex-col gap-6">
                      
                      {/* Avatar preview */}
                      <div className="flex items-center gap-4 bg-[#13070A]/60 border border-rose-900/30 rounded-xl p-4 shadow-inner">
                        <div className="relative w-20 h-20 shrink-0">
                          <input
                            type="file"
                            accept="image/*"
                            id="portrait-upload"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <label
                            htmlFor="portrait-upload"
                            className="relative flex w-full h-full bg-[#13070A] border-2 border-dashed border-rose-900/60 hover:border-[#E11D48] rounded-xl overflow-hidden cursor-pointer group transition-all shadow-md"
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
                                <span className="text-[8px] font-black uppercase tracking-wider text-rose-400 group-hover:text-rose-300 transition-colors">Upload Face</span>
                              </div>
                            )}
                          </label>
                          {(pendingPhoto || avatarSeed.startsWith('data:image/')) && (
                            <button
                              type="button"
                              onClick={() => { setPendingPhoto(null); handleRemoveCustomPhoto(); }}
                              className="absolute -top-1.5 -right-1.5 bg-[#E11D48] hover:bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black cursor-pointer shadow-md z-30 transition-all"
                              title="Remove photo"
                            >×</button>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white uppercase tracking-wider">Manager Face Photo</span>
                          <p className="text-[9.5px] text-zinc-400 leading-snug mt-1">
                            Upload high-res portrait for AI trading card cutout.
                          </p>
                        </div>
                      </div>

                      {/* Inputs form */}
                      <div className="flex flex-col gap-4">
                        <div className="space-y-1.5 group">
                          <label className="block text-[10px] font-black text-rose-400 uppercase tracking-widest transition-all duration-200 group-focus-within:text-rose-300">
                            Manager Alias (Username)
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
                            className="w-full h-10 bg-[#13070A] border border-rose-900/50 hover:border-rose-500/60 focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/40 rounded-xl px-3.5 text-xs font-bold text-white placeholder-rose-500/30 shadow-inner transition-all font-mono"
                            placeholder="tactical_titan"
                          />
                        </div>

                        <div className="space-y-1.5 group">
                          <label className="block text-[10px] font-black text-rose-400 uppercase tracking-widest transition-all duration-200 group-focus-within:text-rose-300">
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
                            className="w-full h-10 bg-[#13070A] border border-rose-900/50 hover:border-rose-500/60 focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/40 rounded-xl px-3.5 text-xs font-bold text-white placeholder-rose-500/30 shadow-inner transition-all"
                            placeholder="Argentina / Brazil / England"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Reset & Sign Out actions at the bottom */}
                  <div className="pt-4 border-t border-rose-900/30 shrink-0 mt-auto flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex-1 h-10 rounded-xl bg-rose-950/20 hover:bg-rose-900/25 border border-rose-900/40 hover:border-rose-500/50 text-zinc-300 hover:text-white font-sans font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCampaign}
                      className="flex-1 h-10 rounded-xl bg-rose-900/10 hover:bg-rose-900/20 border border-rose-900/30 hover:border-rose-600/40 text-rose-400 hover:text-rose-200 font-sans font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Profile
                    </button>
                    {resetMessage && (
                      <p className="text-xs text-amber-400 font-bold mt-2 text-center">{resetMessage}</p>
                    )}
                  </div>
                </div>

                {/* ══ COLUMN 2: Live Card Preview Showcase (col-span-12 lg:col-span-4) ══ */}
                <div className="col-span-12 lg:col-span-4 flex flex-col justify-center items-center h-[520px] bg-[#12070A]/60 border border-rose-900/40 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-md">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(225,29,72,0.2),transparent_70%)] pointer-events-none" />
                  <div className="relative flex items-center justify-center w-full h-full">
                    <div className="scale-[0.80] min-[360px]:scale-[0.88] min-[400px]:scale-[0.95] sm:scale-100 origin-center shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
                      <SportsCenterCard data={managerCardData} />
                    </div>
                  </div>
                </div>

                {/* ══ COLUMN 3: Stats & Actions (col-span-12 lg:col-span-4) ══ */}
                <div className="col-span-12 lg:col-span-4 flex flex-col justify-between h-[520px] bg-[#14080B]/80 border border-rose-900/40 rounded-2xl p-6 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
                  <div className="flex flex-col gap-5">
                    <div className="shrink-0 flex items-center justify-between border-b border-rose-900/30 pb-3">
                      <h3 className="text-xs font-black text-rose-400 tracking-widest uppercase border-l-2 border-[#E11D48] pl-2.5">Reputation &amp; Telemetry</h3>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold">SEASON 2026</span>
                    </div>

                    {/* OVR Summary Badge */}
                    <div className="flex items-center gap-4 bg-[#13070A] border border-rose-900/50 rounded-xl p-3.5 shrink-0 shadow-inner relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#E11D48]/10 to-transparent pointer-events-none" />
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#881337] flex flex-col items-center justify-center shrink-0 shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-[#E11D48]/30">
                        <span className="text-white font-black text-xl leading-none">{profile.overallRating}</span>
                        <span className="text-[7px] text-rose-200 font-black uppercase tracking-widest mt-0.5">OVR</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10.5px] font-black text-white uppercase tracking-wider leading-none">FOOTBALL IQ RATING</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1 truncate">{username || 'MANAGER'}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shrink-0 shadow-sm ${
                        profile.overallRating >= 80
                          ? 'text-rose-400 border-rose-500/40 bg-rose-500/15'
                          : profile.overallRating >= 60
                          ? 'text-orange-400 border-orange-500/40 bg-orange-500/15'
                          : 'text-zinc-400 border-rose-950/40 bg-rose-950/20'
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
                        <div key={stat.label} className="bg-[#13070A] border border-rose-900/30 rounded-xl p-3 space-y-1.5 shadow-inner">
                          <div className="flex justify-between items-baseline">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-[11px]" style={{ color: stat.color }}>{stat.label}</span>
                              <span className="text-[9.5px] font-black text-zinc-300 uppercase tracking-wider">{stat.name}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-mono font-black text-xs text-white">{stat.val}</span>
                              <span className="text-[8.5px] text-zinc-500 font-mono font-bold">/{stat.weight}</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                            <div
                              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-rose-900 via-rose-600 to-[#E11D48] shadow-[0_0_10px_rgba(225,29,72,0.6)]"
                              style={{ width: `${stat.val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Operations */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-rose-900/30 shrink-0 mt-auto">
                    <button
                      type="button"
                      disabled={isSynthesizing || !pendingPhoto}
                      onClick={runAISynthesis}
                      className={`flex-grow h-11 rounded-xl font-sans font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,29,72,0.25)] ${
                        !pendingPhoto
                          ? 'bg-rose-950/20 text-rose-900/40 border border-rose-950/30 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-[#E11D48] to-[#881337] hover:from-rose-500 hover:to-[#a21a3a] text-white cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {isSynthesizing ? 'SYNTHESIZING...' : 'SYNTHESIZE'}
                    </button>

                    <button
                      type="button"
                      disabled={saveLoading}
                      onClick={handleSaveSettings}
                      className="flex-grow h-11 rounded-xl bg-[#13070A] hover:bg-rose-950/50 border border-rose-900/50 hover:border-rose-500/70 text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-md"
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
      {Toast}
    </div>
  );
}
