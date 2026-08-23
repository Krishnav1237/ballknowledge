'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Scroll-to-top on route change. Does not wrap or hide page content. */
export default function AppEffects() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
