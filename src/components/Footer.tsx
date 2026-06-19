'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#881337]/20 py-10 px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 text-center md:text-left">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[6deg]">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="11" height="14" rx="2" fill="#881337" fillOpacity="0.15" stroke="#881337" strokeWidth="2" strokeLinejoin="round" />
                <rect x="9" y="4" width="11" height="14" rx="2" fill="#D97706" fillOpacity="0.25" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 9l2.5 5.5h-1L12 11l-1.5 3.5h-1L12 9z" fill="#D97706" />
              </svg>
            </div>
            <span className="font-display font-black text-lg tracking-widest text-white">
              BALL<span className="text-[#D97706]">KNOWLEDGE</span>
            </span>
          </Link>
          <p className="text-gray-400 text-xs font-sans max-w-xs leading-normal">
            The premium football reputation arena for World Cup 2026.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wider text-gray-300">
          <Link href="/world-cup-hub" className="hover:text-[#D97706] transition-colors">
            World Cup 2026
          </Link>
          <Link href="/leaderboard" className="hover:text-[#D97706] transition-colors">
            Leaderboard
          </Link>
          <Link href="/football-iq" className="hover:text-[#D97706] transition-colors">
            My Card
          </Link>
          <Link href="/pricing" className="hover:text-[#D97706] transition-colors">
            Pricing
          </Link>
          <Link href="/profile" className="hover:text-[#D97706] transition-colors">
            Profile & Settings
          </Link>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col items-center md:items-end space-y-1">
          <p className="text-[10px] text-gray-400 tracking-wide uppercase font-bold">
            Verdicts binding under FIFA World Cup 2026 regulations.
          </p>
          <p className="text-[9px] text-gray-500 font-sans">
            © 2026 BallKnowledge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
