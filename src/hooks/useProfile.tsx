import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { DEFAULT_PROFILE } from '@/data/profileOptions';
import type { UserProfile } from '@/types/profile';

/**
 * Store du profil utilisateur (réponses d'onboarding + préférences).
 * Source unique exploitée par l'analyse, le scoring et les routines.
 *
 * Persisté en localStorage en mode démo. Les colonnes Supabase
 * correspondantes existent (cf. schema.sql) pour la synchronisation
 * dès que le backend est branché.
 */

const STORAGE_KEY = 'naturalme.profile.v1';

interface ProfileContextValue {
  profile: UserProfile;
  /** Met à jour partiellement le profil. */
  update: (patch: Partial<UserProfile>) => void;
  /** Termine l'onboarding (et applique d'éventuelles dernières réponses). */
  completeOnboarding: (final?: Partial<UserProfile>) => void;
  /** Réinitialise le profil (ex. suppression des données). */
  reset: () => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function load(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_PROFILE;
}

function persist(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(load);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback((final: Partial<UserProfile> = {}) => {
    setProfile((prev) => {
      const next = { ...prev, ...final, onboardingCompleted: true };
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    persist(DEFAULT_PROFILE);
    setProfile(DEFAULT_PROFILE);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, update, completeOnboarding, reset }}>
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile doit être utilisé dans <ProfileProvider>.');
  return ctx;
}
