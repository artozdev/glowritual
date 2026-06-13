import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import Landing from '@/pages/Landing';

// Pages chargées à la demande (code-splitting → bundle initial allégé).
const Auth = lazy(() => import('@/pages/Auth'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Scan = lazy(() => import('@/pages/Scan'));
const Results = lazy(() => import('@/pages/Results'));
const Routine = lazy(() => import('@/pages/Routine'));
const Progress = lazy(() => import('@/pages/Progress'));
const Profile = lazy(() => import('@/pages/Profile'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Ambassador = lazy(() => import('@/pages/Ambassador'));

/**
 * Routing applicatif.
 * - Routes publiques : Landing (eager) + Auth.
 * - Routes applicatives : protégées par <RequireAuth> (qui rend <AppShell>,
 *   lequel enveloppe l'<Outlet> dans un <Suspense> pour le lazy-loading).
 */
export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    path: '/auth',
    element: (
      <Suspense fallback={<FullScreenLoader />}>
        <Auth />
      </Suspense>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <Suspense fallback={<FullScreenLoader />}>
        <Onboarding />
      </Suspense>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      { path: '/scan', element: <Scan /> },
      { path: '/results/:scanId?', element: <Results /> },
      { path: '/routine', element: <Routine /> },
      { path: '/progress', element: <Progress /> },
      { path: '/profile', element: <Profile /> },
      { path: '/pricing', element: <Pricing /> },
      { path: '/ambassador', element: <Ambassador /> },
    ],
  },
]);
