'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 py-3 px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <Link href="/" className="text-white hover:text-[#E11D48]">
          BALL<span className="text-[#E11D48]">KNOWLEDGE</span>
        </Link>
        <span>Season 26/27</span>
      </div>
    </footer>
  );
}
