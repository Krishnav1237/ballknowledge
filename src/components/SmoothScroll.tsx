'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Native scroll only — Lenis made every page feel floaty and late. */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
