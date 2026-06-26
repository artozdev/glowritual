import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MobileTabBar } from './MobileTabBar';
import { useScanReminder } from '@/hooks/useScanReminder';

/**
 * Coquille applicative responsive — deux expériences, un seul contenu :
 *  • Mobile / tablette (< lg) : app native (tab bar bas, Scan central).
 *  • Desktop (≥ lg) : dashboard (sidebar fixe + header + zone large).
 * Bascule purement CSS (Tailwind) — le contenu (Outlet) reste partagé.
 */
export function AppShell() {
  useScanReminder();
  const location = useLocation();
  return (
    <div className="min-h-screen bg-cream lg:bg-neutral-50">
      <DashboardSidebar />

      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="mx-auto w-full max-w-6xl px-5 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          <Suspense
            fallback={
              <div className="flex justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-sage-400" />
              </div>
            }
          >
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}
