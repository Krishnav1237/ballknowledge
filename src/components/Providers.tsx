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
        const errorMsg = String(args[0] || '');
        // Silence hydration errors caused by browser extensions like Apollo.io, Grammarly, etc.
        if (
          errorMsg.includes('Hydration failed') ||
          errorMsg.includes('There was an error while hydrating') ||
          errorMsg.includes('does not match the server') ||
          errorMsg.includes('zp-open-popup-button') ||
          errorMsg.includes('apolloio-css-vars-reset') ||
          errorMsg.includes('apolloio')
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
