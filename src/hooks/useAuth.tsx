import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoSignUp,
  demoSignIn,
  demoUpdatePlan,
  type DemoAccount,
} from '@/lib/demoAuth';
import type { Plan } from '@/types/database';

export interface AuthUser {
  id: string;
  email: string;
  plan: Plan;
  /** Vrai si l'utilisateur est une session de démonstration locale. */
  isDemo: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Vrai si Supabase est configuré (auth réelle disponible). */
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Envoie un email de réinitialisation (réel) — info en mode démo. */
  resetPassword: (
    email: string,
  ) => Promise<{ error: string | null; demo: boolean }>;
  /** Active une session d'invité (sans inscription). */
  signInDemo: () => void;
  /** Bascule la session en Premium (stub Stripe). */
  upgradeDemo: () => void;
  signOut: () => Promise<void>;
}

const DEMO_KEY = 'naturalme.demo-user';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Fabrique un utilisateur invité de démonstration. */
function makeDemoUser(email = 'invite@glow.app'): AuthUser {
  return { id: 'demo-guest', email, plan: 'free', isDemo: true };
}

/** Convertit un compte démo en utilisateur de session. */
function accountToUser(account: DemoAccount): AuthUser {
  return {
    id: account.id,
    email: account.email,
    plan: account.plan,
    isDemo: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /** Récupère le profil (plan) pour un utilisateur Supabase authentifié. */
  const hydrateFromSupabase = useCallback(
    async (authUserId: string | null, email: string | null) => {
      if (!authUserId || !supabase) {
        setUser(null);
        return;
      }
      let plan: Plan = 'free';
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', authUserId)
        .maybeSingle();
      if (data?.plan) plan = data.plan;
      setUser({ id: authUserId, email: email ?? '', plan, isDemo: false });
    },
    [],
  );

  useEffect(() => {
    // ── Mode démo : pas de backend, on restaure une éventuelle session locale.
    if (!isSupabaseConfigured || !supabase) {
      const raw = localStorage.getItem(DEMO_KEY);
      if (raw) {
        try {
          setUser(JSON.parse(raw) as AuthUser);
        } catch {
          localStorage.removeItem(DEMO_KEY);
        }
      }
      setLoading(false);
      return;
    }

    // ── Mode réel : session Supabase + écoute des changements.
    supabase.auth
      .getSession()
      .then(({ data }) =>
        hydrateFromSupabase(
          data.session?.user.id ?? null,
          data.session?.user.email ?? null,
        ),
      )
      .finally(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateFromSupabase(
        session?.user.id ?? null,
        session?.user.email ?? null,
      );
    });

    return () => sub.subscription.unsubscribe();
  }, [hydrateFromSupabase]);

  const signInDemo = useCallback(() => {
    const u = makeDemoUser();
    localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured || !supabase) {
        const { account, error } = demoSignUp(email, password);
        if (error || !account) return { error: error ?? 'Inscription impossible.' };
        const u = accountToUser(account);
        localStorage.setItem(DEMO_KEY, JSON.stringify(u));
        setUser(u);
        return { error: null };
      }
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured || !supabase) {
        const { account, error } = demoSignIn(email, password);
        if (error || !account) return { error: error ?? 'Connexion impossible.' };
        const u = accountToUser(account);
        localStorage.setItem(DEMO_KEY, JSON.stringify(u));
        setUser(u);
        return { error: null };
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Pas d'envoi d'email en démo : on informe simplement.
      return { error: null, demo: true };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth`,
    });
    return { error: error?.message ?? null, demo: false };
  }, []);

  const upgradeDemo = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, plan: 'premium' as Plan };
      if (prev.isDemo) {
        localStorage.setItem(DEMO_KEY, JSON.stringify(next));
        if (prev.id !== 'demo-guest') demoUpdatePlan(prev.id, 'premium');
      }
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEMO_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        resetPassword,
        signInDemo,
        upgradeDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>.');
  return ctx;
}
