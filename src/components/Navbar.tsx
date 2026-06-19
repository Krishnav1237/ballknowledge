'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Award, User, Menu, X, LogOut, LogIn, Tag, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredProfile, saveStoredProfile, FootballIQProfile } from '@/lib/profileSync';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const updateProfile = () => {
      setProfile(getStoredProfile());
    };

    updateProfile();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', updateProfile);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateProfile);
    };
  }, []);

  const handleSignOut = () => {
    if (!profile) return;
    const signedOutProfile = {
      ...profile,
      isAuthenticated: false,
      authProvider: null
    };
    setProfile(signedOutProfile);
    saveStoredProfile(signedOutProfile);
    // Dispatch event to sync state across other pages/components instantly
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'World Cup 2026', href: '/world-cup-hub', icon: Trophy },
    { name: 'Leaderboard',    href: '/leaderboard',   icon: BarChart2 },
    { name: 'My Card',        href: '/football-iq',   icon: Award },
    { name: 'Pricing',        href: '/pricing',        icon: Tag },
    { name: 'Profile',        href: '/profile',        icon: User },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full h-[52px] flex items-center z-50 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? 'glass-panel border-b border-white/5 bg-black/85 shadow-md shadow-black/45'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="w-full px-6 flex items-center justify-between">
          {/* Logo — extreme left */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[6deg]">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="11" height="14" rx="2" fill="#881337" fillOpacity="0.1" stroke="#881337" strokeWidth="2" strokeLinejoin="round" />
                <rect x="9" y="4" width="11" height="14" rx="2" fill="#D97706" fillOpacity="0.2" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" className="filter drop-shadow-[0_0_4px_rgba(217,119,6,0.3)]" />
                <path d="M12 9l2.5 5.5h-1L12 11l-1.5 3.5h-1L12 9z" fill="#D97706" />
                <path d="M17.5 12l.6 1.2 1.3.2-1 .9.2 1.3-1.1-.7-1.1.7.2-1.3-1-.9 1.3-.2.6-1.2z" fill="#D97706" />
              </svg>
            </div>
            <span className={`font-display font-black text-2xl tracking-widest flex items-center transition-colors duration-300 ${scrolled ? 'text-white' : 'text-white'}`}>
              BALL<span className={`ml-1 transition-colors duration-300 ${scrolled ? 'text-primary group-hover:text-secondary' : 'text-[#D97706] group-hover:text-white'}`}>KNOWLEDGE</span>
            </span>
          </Link>

          {/* Desktop Nav — extreme right */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative font-sans text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                    isActive
                      ? (scrolled ? 'text-primary' : 'text-[#D97706]')
                      : (scrolled ? 'text-muted hover:text-white' : 'text-white/70 hover:text-white')
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className={`absolute left-0 bottom-[-6px] w-full h-[2px] ${
                        scrolled ? 'bg-primary shadow-[0_0_8px_rgba(136,19,55,0.4)]' : 'bg-[#D97706] shadow-[0_0_8px_rgba(217,119,6,0.6)]'
                      }`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Auth Button/Pill */}
            {profile?.isAuthenticated ? (
              <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-full px-3 py-1 shadow-inner relative z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://api.dicebear.com/7.x/${profile.avatarStyle}/svg?seed=${encodeURIComponent(profile.avatarSeed)}`} 
                  className="w-5 h-5 object-contain" 
                  alt="Avatar" 
                />
                <span className="font-sans font-bold text-xs text-white uppercase tracking-wider max-w-[85px] truncate">
                  {profile.username}
                </span>
                <div className="w-[1px] h-3 bg-white/10" />
                <button 
                  onClick={handleSignOut} 
                  className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Sign Out Manager"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link 
                href="/profile" 
                className="px-4 py-2 rounded-full font-display font-black text-[11px] uppercase tracking-widest text-white transition-all hover:scale-105 bg-gradient-to-r from-[#881337] to-[#D97706] shadow-md hover:shadow-[0_0_15px_rgba(217,119,6,0.35)] flex items-center gap-1.5"
              >
                <LogIn className="w-3 h-3" /> Locker Room Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden ml-auto transition-colors focus:outline-none ${
              scrolled || mobileMenuOpen ? 'text-white hover:text-[#D97706]' : 'text-white hover:text-[#D97706]'
            }`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-lg pt-[80px] px-6 md:hidden flex flex-col justify-between pb-12"
          >
            <div className="flex flex-col space-y-5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'border-[#D97706]/20 bg-[#D97706]/5 text-[#D97706]'
                        : 'border-white/5 bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-[#D97706]' : 'text-gray-400'}`} />
                    <span className="font-sans font-bold text-base uppercase tracking-wider">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col space-y-4">
              {profile?.isAuthenticated ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.dicebear.com/7.x/${profile.avatarStyle}/svg?seed=${encodeURIComponent(profile.avatarSeed)}`} 
                      className="w-10 h-10 object-contain" 
                      alt="Avatar" 
                    />
                    <div>
                      <h4 className="font-sans font-black text-sm uppercase text-white leading-none">{profile.username}</h4>
                      <p className="text-[8.5px] font-black uppercase text-[#D97706] tracking-widest mt-1">OVR {profile.overallRating} • {profile.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-center py-4 rounded-xl border border-red-500/35 text-red-500 font-bold uppercase tracking-wider hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out Manager
                  </button>
                </div>
              ) : (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-4 rounded-xl bg-gradient-to-r from-[#881337] to-[#D97706] text-white font-bold uppercase tracking-wider hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Locker Room Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
