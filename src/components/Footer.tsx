'use client';

import Link from 'next/link';

export default function Footer() {



  return (
    <footer className="bg-[#0A0A0A] border-t border-[#881337]/20 py-8 px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 text-center md:text-left">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start space-y-1">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[6deg]">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="11" height="14" rx="2" fill="#E11D48" fillOpacity="0.15" stroke="#E11D48" strokeWidth="2" strokeLinejoin="round" />
                <rect x="9" y="4" width="11" height="14" rx="2" fill="#881337" fillOpacity="0.25" stroke="#881337" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 9l2.5 5.5h-1L12 11l-1.5 3.5h-1L12 9z" fill="#881337" />
              </svg>
            </div>
            <span className="font-display font-black text-lg tracking-widest text-white">
              BALL<span className="text-[#E11D48]">KNOWLEDGE</span>
            </span>
          </Link>
          <p className="text-gray-500 text-[11px] font-sans">
            The premium football reputation arena for World Cup 2026.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3.5">
          {/* X / Twitter */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#E11D48]/40 hover:bg-[#E11D48]/10 hover:text-[#E11D48] text-gray-400 flex items-center justify-center transition-all shadow-sm"
            aria-label="Twitter / X"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* Instagram — correct path */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#E11D48]/40 hover:bg-[#E11D48]/10 hover:text-[#E11D48] text-gray-400 flex items-center justify-center transition-all shadow-sm"
            aria-label="Instagram"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#E11D48]/40 hover:bg-[#E11D48]/10 hover:text-[#E11D48] text-gray-400 flex items-center justify-center transition-all shadow-sm"
            aria-label="LinkedIn"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right">
          <p className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-wider">
            © 2026 BallKnowledge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
