'use client';
import { useEffect } from 'react';

/**
 * Unregisters all browser service workers on mount.
 * Prevents stale cached JS chunks (from browser extensions or old SW registrations)
 * from serving outdated module bundles that cause Turbopack module-factory errors.
 */
export default function ServiceWorkerKiller() {
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(sw => {
          sw.unregister();
          console.log('[BK] Stale service worker unregistered:', sw.scope);
        });
      });
    }
  }, []);
  return null;
}
