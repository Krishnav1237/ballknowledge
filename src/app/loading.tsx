'use client';

export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-[#0A0A0A] relative z-20">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        {/* Spinning Golden & Burgundy Rings */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-t-[#D97706] border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '0.8s' }} />
          <div className="absolute inset-1.5 rounded-full border-2 border-b-[#881337] border-t-transparent border-r-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />
          <span className="font-display font-black text-[9px] text-white/80 uppercase tracking-widest animate-pulse">VAR</span>
        </div>
        
        <p className="text-[10px] font-sans font-black text-gray-500 uppercase tracking-[0.2em] mt-1">
          Reviewing Pitch Data...
        </p>
      </div>
    </div>
  );
}
