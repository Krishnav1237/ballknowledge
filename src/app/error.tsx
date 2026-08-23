'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[BallKnowledge] Uncaught client error:', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100dvh-var(--nav-h))] bg-[#030712] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#881337]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E11D48]/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#881337]/15 border border-[#881337]/30 flex items-center justify-center">
          <AlertTriangle className="w-9 h-9 text-[#881337]" />
        </div>

        {/* VAR Review styling */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#E11D48] font-black mb-2">
            Hold up
          </p>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-3">
            Something Broke
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            The pitch glitched. Hit retry and get back on the board.
            {error?.digest && (
              <span className="block mt-2 text-xs text-gray-600 font-mono">
                Error ID: {error.digest}
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#881337] hover:bg-[#9f1239] text-white text-sm font-bold transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
