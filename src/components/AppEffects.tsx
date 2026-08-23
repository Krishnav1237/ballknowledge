'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Scroll-to-top on route change and drop stale service workers. Does not wrap or hide page content. */
export default function AppEffects() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((sw) => {
        void sw.unregister();
      });
    });
  }, []);

  return null;
}
