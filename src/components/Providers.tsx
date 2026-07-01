'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      })
  );

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      console.error = (...args: any[]) => {
        const errorMsg = args.map((arg) => String(arg || '')).join(' ');
        const normalized = errorMsg.toLowerCase();
        const isExtensionNoise =
          normalized.includes('__gcruniqueid') ||
          normalized.includes('apolloio') ||
          normalized.includes('zp-open-popup-button') ||
          normalized.includes('grammarly');
        const isHydrationNoise =
          normalized.includes('hydration failed') ||
          normalized.includes('there was an error while hydrating') ||
          normalized.includes('a tree hydrated but some attributes') ||
          normalized.includes("didn't match the client properties") ||
          normalized.includes('does not match the server');

        // Silence known browser-extension hydration noise without hiding app-owned mismatches.
        if (
          isExtensionNoise &&
          isHydrationNoise
        ) {
          return;
        }
        originalError(...args);
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
