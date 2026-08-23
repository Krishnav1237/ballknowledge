import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0B0F19] px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <Link href="/" className="text-white hover:text-[#E11D48]">
          BALL<span className="text-[#E11D48]">KNOWLEDGE</span>
        </Link>
        <span>Season 26/27 · Take #1</span>
      </div>
    </footer>
  );
}
