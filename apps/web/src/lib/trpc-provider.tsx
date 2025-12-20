'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './trpc';

/**
 * Get the API URL from environment or default to localhost
 */
function getBaseUrl() {
  // 1. If we are in the browser, auto-detect the hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If not localhost, assume backend is on the same host but port 4000
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:4000/trpc`;
    }
  }

  // 2. Fallback to env var (baked in at build time)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 3. Default for local development
  return 'http://localhost:4000/trpc';
}

/**
 * Provider component for tRPC and React Query
 * Wraps the app to provide API access to all components
 */
export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getBaseUrl(),
          headers() {
            // Add auth token if available
            const token =
              typeof window !== 'undefined'
                ? localStorage.getItem('auth_token')
                : null;
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
