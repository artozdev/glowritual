import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { ProfileProvider } from './hooks/useProfile';
import { ScanSessionProvider } from './hooks/useScanSession';
import { router } from './router';

/** Capture un éventuel code promo dans l'URL (glow.app/?code=MIKE15). */
function capturePromoFromUrl() {
  try {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) localStorage.setItem('glow.pending-promo', code.trim().toUpperCase());
  } catch {
    /* ignore */
  }
}

// Client TanStack Query — cache + états de chargement propres.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(capturePromoFromUrl, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <ScanSessionProvider>
            <RouterProvider router={router} />
          </ScanSessionProvider>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
