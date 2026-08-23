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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((sw) => {
          void sw.unregister();
        });
      });
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          void caches.delete(key);
        });
      });
    }
  }, []);

  return null;
}
