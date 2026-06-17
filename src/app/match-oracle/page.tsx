'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MatchOracleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/world-cup-hub');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center p-6 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
      <p className="font-display font-black text-sm uppercase tracking-widest text-[#D97706]">Upgrading to Unified Football IQ Reputation Platform...</p>
    </div>
  );
}
