'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Award, User, Menu, X, LogOut, LogIn, BarChart2 } from 'lucide-react';
import { clearStoredProfile, getStoredProfile, FootballIQProfile, getAvatarUrl } from '@/lib/profileSync';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateProfile = () => setProfile(getStoredProfile());
    updateProfile();
    setHydrated(true);
    window.addEventListener('storage', updateProfile);
    return () => window.removeEventListener('storage', updateProfile);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const handleSignOut = () => {
    if (!profile) return;
    void fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
    clearStoredProfile();
    setProfile(getStoredProfile());
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Board', href: '/leaderboard', icon: BarChart2 },
    { name: 'Season', href: '/premier-league', icon: Trophy },
    { name: 'Card', href: '/football-iq', icon: Award },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 z-[100] flex h-[var(--nav-h)] w-full items-center border-b border-white/10 bg-[#0B0F19] shadow-[0_8px_24px_rgba(0,0,0,0.45)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#E11D48]/60 after:to-transparent after:content-['']">
        <div className="flex w-full items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center space-x-3">
            <div className="relative flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ball_knowledge_logo.png"
                alt="Ball Knowledge Logo"
                className="h-9 w-9 rounded-full border border-[#E11D48]/35 object-contain shadow-[0_0_12px_rgba(225,29,72,0.25)]"
              />
            </div>
            <span className="hidden items-center font-display text-2xl font-black tracking-widest text-white transition-colors duration-300 sm:flex">
              BALL<span className="ml-1 text-[#E11D48] transition-colors group-hover:text-rose-400">KNOWLEDGE</span>
            </span>
          </Link>

          <nav className="hidden items-center space-x-7 md:flex">
            {navLinks.filter((link) => link.name !== 'Profile').map((link) => {
              const isActive = link.href === '/leaderboard'
                ? pathname === '/' || pathname === '/leaderboard'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative font-sans text-sm font-semibold uppercase tracking-wide transition-colors duration-150 ${
                    isActive ? 'text-[#E11D48]' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && <span className="absolute bottom-[-6px] left-0 h-[2px] w-full bg-[#E11D48] shadow-[0_0_8px_rgba(225,29,72,0.4)]" />}
                </Link>
              );
            })}

            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full border border-[#E11D48]/25 bg-white/5 py-1 pl-1.5 pr-3 shadow-[0_0_12px_rgba(225,29,72,0.15)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#881337] to-[#E11D48] font-display text-[10px] font-black text-white">
                {hydrated ? (profile?.overallRating ?? 50) : '—'}
              </span>
              <span className="max-w-[90px] truncate font-sans text-[10px] font-bold uppercase tracking-wider text-white">
                {!hydrated ? '—' : profile?.isAuthenticated ? profile.username : 'Guest'}
              </span>
            </Link>
            {hydrated && profile?.isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="cursor-pointer text-gray-400 transition-colors hover:text-red-400"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            ) : hydrated ? (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#881337] to-[#E11D48] px-3 py-1.5 font-display text-[10px] font-black uppercase tracking-widest text-white"
              >
                <LogIn className="h-3 w-3" /> Get in
              </Link>
            ) : (
              <span className="h-7 w-16 rounded-full skel" />
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-auto text-zinc-400 transition-colors hover:text-[#E11D48] focus:outline-none md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-between bg-[#0B0F19] px-6 pb-12 pt-[calc(var(--nav-h)+20px)] md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = link.href === '/leaderboard'
                ? pathname === '/' || pathname === '/leaderboard'
                : pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 rounded-xl border p-4 transition-all ${
                    isActive
                      ? 'border-[#E11D48]/20 bg-[#E11D48]/5 text-[#E11D48]'
                      : 'border-white/5 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#E11D48]' : 'text-gray-400'}`} />
                  <span className="font-sans text-base font-bold uppercase tracking-wider">{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col space-y-4">
            {hydrated && profile?.isAuthenticated ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAvatarUrl(profile.avatarStyle, profile.avatarSeed)}
                    className="h-10 w-10 rounded-full object-cover"
                    alt="Avatar"
                  />
                  <div>
                    <h4 className="font-sans text-sm font-black uppercase leading-none text-white">{profile.username}</h4>
                    <p className="mt-1 text-[8.5px] font-black uppercase tracking-widest text-[#E11D48]">
                      OVR {profile.overallRating} • {profile.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/35 py-4 text-center font-bold uppercase tracking-wider text-red-500 transition-all hover:bg-red-500/5"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#881337] to-[#E11D48] py-4 text-center font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.01]"
              >
                <LogIn className="h-4 w-4" /> Get in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
