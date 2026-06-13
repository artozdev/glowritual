import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { useScanReminder } from '@/hooks/useScanReminder';

/**
 * Coquille des écrans applicatifs : TopBar (desktop) + contenu + BottomNav (mobile).
 * Le padding bas réserve la place de la barre inférieure sur mobile.
 */
export function AppShell() {
  useScanReminder();
  return (
    <div className="min-h-screen bg-cream">
      <TopBar />
      <main className="container-app pb-28 pt-6 md:pb-12">
        <Suspense
          fallback={
            <div className="flex justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-sage-400" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
