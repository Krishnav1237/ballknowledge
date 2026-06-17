'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Award, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'World Cup 2026', href: '/world-cup-hub', icon: Trophy },
    { name: 'My Card', href: '/football-iq', icon: Award },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full h-[52px] flex items-center z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-panel border-b border-black/5 bg-background/85 shadow-md'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="w-full px-6 flex items-center justify-between">
          {/* Logo — extreme left */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[6deg]">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Back card */}
                <rect x="2" y="6" width="11" height="14" rx="2" fill="#881337" fillOpacity="0.1" stroke="#881337" strokeWidth="2" strokeLinejoin="round" />
                {/* Front card (glowing gold) */}
                <rect x="9" y="4" width="11" height="14" rx="2" fill="#D97706" fillOpacity="0.2" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" className="filter drop-shadow-[0_0_4px_rgba(217,119,6,0.3)]" />
                {/* Minimalist V letter inside front card */}
                <path d="M12 9l2.5 5.5h-1L12 11l-1.5 3.5h-1L12 9z" fill="#D97706" />
                {/* Mini star at bottom right of front card */}
                <path d="M17.5 12l.6 1.2 1.3.2-1 .9.2 1.3-1.1-.7-1.1.7.2-1.3-1-.9 1.3-.2.6-1.2z" fill="#D97706" />
              </svg>
            </div>
            <span className={`font-display font-black text-2xl tracking-widest flex items-center transition-colors duration-300 ${scrolled ? 'text-foreground' : 'text-white'}`}>
              VAR<span className={`ml-1 transition-colors duration-300 ${scrolled ? 'text-primary group-hover:text-secondary' : 'text-[#D97706] group-hover:text-white'}`}>CARDS</span>
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
                      : (scrolled ? 'text-muted hover:text-foreground' : 'text-white/70 hover:text-white')
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
          </nav>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden ml-auto transition-colors focus:outline-none ${
              scrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-[#D97706]'
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
            className="fixed inset-0 z-40 bg-background pt-[80px] px-6 md:hidden flex flex-col justify-between pb-12"
          >
            <div className="flex flex-col space-y-6">
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
                        ? 'border-primary/20 bg-primary/5 text-primary'
                        : 'border-black/5 bg-surface hover:bg-surface-elevated text-foreground'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted'}`} />
                    <span className="font-sans font-bold text-lg">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col space-y-4">
              <Link
                href="/world-cup-hub"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-4 rounded-xl bg-primary text-white font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                World Cup Hub
              </Link>
              <Link
                href="/football-iq"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-4 rounded-xl bg-surface border border-black/10 text-foreground font-bold uppercase tracking-wider hover:bg-surface-elevated transition-all"
              >
                My Card
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
