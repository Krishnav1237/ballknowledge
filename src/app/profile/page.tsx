'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getStoredProfile, saveStoredProfile, FootballIQProfile } from '@/lib/profileSync';
import { User, Settings, ShieldAlert, Sparkles, CheckCircle, RotateCcw } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  
  // Settings inputs
  const [username, setUsername] = useState('');
  const [favoriteClub, setFavoriteClub] = useState('');
  const [favoriteNation, setFavoriteNation] = useState('');
  const [role, setRole] = useState<'FREE' | 'PREMIUM' | 'ADMIN'>('FREE');
  const [avatarSeed, setAvatarSeed] = useState('Reputation');
  const [avatarStyle, setAvatarStyle] = useState('fun-emoji');

  useEffect(() => {
    const prof = getStoredProfile();
    setProfile(prof);
    setUsername(prof.username);
    setFavoriteClub(prof.favoriteClub || '');
    setFavoriteNation(prof.favoriteNation || '');
    setRole(prof.role);
    setAvatarSeed(prof.avatarSeed);
    setAvatarStyle(prof.avatarStyle);
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-gray-500">Loading settings cockpit...</p>
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

    alert('Profile credentials saved successfully!');
  };

  const handleResetCampaign = () => {
    if (confirm('CAUTION: This will delete your entire prediction history, collected match cards, and reset your Football IQ to 50. Are you sure?')) {
      localStorage.removeItem('var_cards_profile');
      localStorage.removeItem('var_cards_predictions');
      alert('Campaign reset. Reloading app...');
      window.location.href = '/world-cup-hub';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-foreground pb-20">
      <Navbar />

      {/* Header Banner */}
      <div className="relative pt-[90px] pb-8 px-6 bg-gradient-to-b from-white/5 via-transparent to-transparent border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-widest mb-3">
            <Settings className="w-3.5 h-3.5" /> Cockpit Settings
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight leading-none">
            Profile Settings
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-lg font-medium">
            Customize your identity details, toggle roles for feature testing, or reset your campaign progress.
          </p>
        </div>
      </div>

      {/* Settings Form Container */}
      <div className="max-w-4xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Controls */}
          <div className="md:col-span-8 space-y-6">
            
            <div className="glass-panel border-white/5 bg-[#0B0F19]/40 rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="font-display font-black text-base text-white uppercase tracking-wider border-b border-white/5 pb-3">
                Credentials Setup
              </h3>

              {/* Username */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Manager Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706]"
                  placeholder="e.g. messi_prophet"
                />
              </div>

              {/* Favorites Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Favorite Football Club</label>
                  <input
                    type="text"
                    value={favoriteClub}
                    onChange={e => setFavoriteClub(e.target.value)}
                    className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706]"
                    placeholder="e.g. Real Madrid"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Favorite Nation</label>
                  <input
                    type="text"
                    value={favoriteNation}
                    onChange={e => setFavoriteNation(e.target.value)}
                    className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706]"
                    placeholder="e.g. Argentina"
                  />
                </div>
              </div>

              {/* Avatar settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Avatar Seed</label>
                  <input
                    type="text"
                    value={avatarSeed}
                    onChange={e => setAvatarSeed(e.target.value)}
                    className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Avatar Style (Dicebear)</label>
                  <select
                    value={avatarStyle}
                    onChange={e => setAvatarStyle(e.target.value)}
                    className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="fun-emoji">Fun Emoji</option>
                    <option value="bottts">Bots</option>
                    <option value="pixel-art">Pixel Art</option>
                    <option value="avataaars">Avatars</option>
                  </select>
                </div>
              </div>

              {/* Development Role Selector */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Feature Role Settings
                  </label>
                  <span className="text-[9px] font-black uppercase text-[#D97706] tracking-wider bg-[#D97706]/10 border border-[#D97706]/20 px-2 py-0.5 rounded">
                    Dev Mode
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['FREE', 'PREMIUM', 'ADMIN'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        role === r
                          ? 'bg-[#881337]/10 border-[#881337] text-rose-300'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[9.5px] text-gray-500 mt-2 font-medium">
                  Select <span className="text-white">PREMIUM</span> to unlock 5 hot takes and selects. Select <span className="text-white">ADMIN</span> to bypass match day date locks.
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className="w-full py-4 rounded-xl bg-[#881337] hover:bg-[#881337]/90 text-white font-display font-black text-sm uppercase tracking-widest shadow-md transition-all active:scale-[0.98]"
              >
                Save Profile Configuration
              </button>

            </div>

          </div>

          {/* Right Column: Danger Zone / Previews */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Avatar preview */}
            <div className="glass-panel border-white/5 bg-[#0B0F19]/40 rounded-3xl p-5 shadow-lg flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Avatar Preview</span>
              <div className="w-24 h-24 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center p-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`}
                  alt="Avatar Preview"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                />
              </div>
              <span className="font-bold text-white text-sm">{username || 'Manager'}</span>
            </div>

            {/* Reset / Danger Zone */}
            <div className="glass-panel border-red-500/10 bg-red-500/5 rounded-3xl p-5 shadow-lg">
              <h4 className="font-display font-black text-xs text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 shrink-0" /> Danger Zone
              </h4>
              <p className="text-[10px] text-gray-500 leading-relaxed mb-4 font-medium">
                Resetting your campaign deletes all prediction history, card packs, and resets your Overall Ball IQ.
              </p>
              <button
                onClick={handleResetCampaign}
                className="w-full py-3 rounded-xl border border-red-500/35 hover:border-red-500 text-red-500 hover:bg-red-500/5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Reset Campaign
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
