import Link from 'next/link';
import { Home, Search, Trophy } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#881337]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#D97706]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-md">
        {/* 404 Big Number */}
        <div className="relative">
          <span
            className="font-display font-black text-[10rem] leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #881337 0%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.25,
            }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-16 h-16 text-[#D97706]/60" />
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D97706] font-black mb-2">
            VAR Reviewed — Not Found
          </p>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-3">
            Page Offside
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            The VAR tribunal couldn&apos;t find this page. It may have been moved,
            deleted, or never existed — much like some managers&apos; tactical plans.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#881337] hover:bg-[#9f1239] text-white text-sm font-bold transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/world-cup-hub"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all active:scale-95"
          >
            <Search className="w-4 h-4" />
            World Cup Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
