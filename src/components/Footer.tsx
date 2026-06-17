'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#881337]/20 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 text-center md:text-left">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[6deg]">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Back card */}
                <rect x="2" y="6" width="11" height="14" rx="2" fill="#881337" fillOpacity="0.15" stroke="#881337" strokeWidth="2" strokeLinejoin="round" />
                {/* Front card (glowing gold) */}
                <rect x="9" y="4" width="11" height="14" rx="2" fill="#D97706" fillOpacity="0.25" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" />
                {/* Minimalist V letter inside front card */}
                <path d="M12 9l2.5 5.5h-1L12 11l-1.5 3.5h-1L12 9z" fill="#D97706" />
              </svg>
            </div>
            <span className="font-display font-black text-lg tracking-tight text-white">
              VAR<span className="text-[#D97706]">CARDS</span>
            </span>
          </Link>
          <p className="text-gray-400 text-xs font-sans max-w-xs">
            Deciding who cooked and who bottled for World Cup 2026.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wider text-gray-300">
          <Link href="/world-cup-hub" className="hover:text-[#D97706] transition-colors">
            World Cup 2026
          </Link>
          <Link href="/football-iq" className="hover:text-[#D97706] transition-colors">
            My Football IQ
          </Link>
          <Link href="/profile" className="hover:text-[#D97706] transition-colors">
            Profile & Settings
          </Link>
        </div>

        {/* Legal Humor & Creator Info */}
        <div className="flex flex-col items-center md:items-end space-y-1">
          <p className="text-[10px] text-gray-400 tracking-wide uppercase">
            Verdicts binding under Stockley Park statutes.
          </p>
        </div>
      </div>
    </footer>
  );
}
