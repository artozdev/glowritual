import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { DEFAULT_PROFILE } from '@/data/profileOptions';
import type { UserProfile } from '@/types/profile';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { fetchProfile, saveProfile } from '@/lib/profileSync';

/**
 * Store du profil utilisateur (réponses d'onboarding + préférences).
 * Source unique exploitée par l'analyse, le scoring et les routines.
 *
 * - Supabase configuré : le profil est chargé depuis le cloud au login
 *   (un compte existant retrouve ses données, sur n'importe quel appareil,
 *   sans refaire l'onboarding) et réenregistré à chaque modification.
 * - Mode démo (pas de backend) : persistance en localStorage.
 */

const STORAGE_KEY = 'naturalme.profile.v1';

interface ProfileContextValue {
  profile: UserProfile;
  /** Vrai quand le profil a fini de charger (local ou cloud). */
  hydrated: boolean;
  /** Met à jour partiellement le profil. */
  update: (patch: Partial<UserProfile>) => void;
  /** Termine l'onboarding (et applique d'éventuelles dernières réponses). */
  completeOnboarding: (final?: Partial<UserProfile>) => void;
  /** Réinitialise le profil (ex. suppression des données). */
  reset: () => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function loadLocal(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_PROFILE;
}

function persistLocal(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Identité cloud : un vrai compte Supabase (pas une session de démo).
  const userId = user && !user.isDemo ? user.id : null;
  const cloud = isSupabaseConfigured && !!userId;

  // En mode cloud on part d'un profil vierge (chargé ensuite depuis Supabase) ;
  // en mode démo on lit directement le localStorage.
  const [profile, setProfile] = useState<UserProfile>(() =>
    isSupabaseConfigured ? DEFAULT_PROFILE : loadLocal(),
  );
  const [hydrated, setHydrated] = useState(!isSupabaseConfigured);

  // Charge le profil quand l'utilisateur change (login / logout / changement de compte).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProfile(loadLocal());
      setHydrated(true);
      return;
    }
    if (!userId) {
      // Déconnecté : profil vierge (aucune fuite de données entre comptes).
      setProfile(DEFAULT_PROFILE);
      setHydrated(false);
      return;
    }
    let cancelled = false;
    setHydrated(false);
    void (async () => {
      const cloudProfile = await fetchProfile(userId);
      if (cancelled) return;
      setProfile({ ...DEFAULT_PROFILE, ...(cloudProfile ?? {}) });
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /** Persiste le profil : cloud si connecté, sinon localStorage. */
  const persist = useCallback(
    (next: UserProfile) => {
      if (cloud && userId) void saveProfile(userId, next);
      else persistLocal(next);
    },
    [cloud, userId],
  );

  const update = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const completeOnboarding = useCallback(
    (final: Partial<UserProfile> = {}) => {
      setProfile((prev) => {
        const next = { ...prev, ...final, onboardingCompleted: true };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    persist(DEFAULT_PROFILE);
  }, [persist]);

  return (
    <ProfileContext.Provider
      value={{ profile, hydrated, update, completeOnboarding, reset }}
    >
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
