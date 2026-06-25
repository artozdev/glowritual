import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { Input } from '@/components/ui/Input';
import { Highlight } from '@/components/landing/Highlight';
import { AvatarStack } from '@/components/landing/AvatarStack';
import { StarRating } from '@/components/landing/StarRating';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'signin' | 'signup' | 'forgot';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_COUNT = 100;

/** Mappe un message d'erreur Supabase vers une clé i18n (ou null si inconnu). */
function errorKey(msg: string): string | null {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'errInvalidLogin';
  if (m.includes('already registered') || m.includes('already exists'))
    return 'errExists';
  if (m.includes('email not confirmed')) return 'errNotConfirmed';
  if (m.includes('password should be at least')) return 'errPasswordShort';
  if (m.includes('invalid email') || m.includes('unable to validate email'))
    return 'errInvalidEmail';
  if (m.includes('rate limit') || m.includes('too many')) return 'errRate';
  return null;
}

export default function Auth() {
  const { t } = useTranslation();
  const { user, isConfigured, signIn, signUp, resetPassword, signInDemo } =
    useAuth();
  const showError = (msg: string) => {
    const k = errorKey(msg);
    setError(k ? t(`auth.${k}`) : msg);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { from?: string; mode?: Mode } | null;
  const from = navState?.from ?? '/scan';

  const [mode, setMode] = useState<Mode>(navState?.mode ?? 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirection dès qu'une session existe.
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setInfo(null);
  }

  /** Validation côté client avant appel. */
  function validate(): string | null {
    if (!EMAIL_RE.test(email.trim())) return t('auth.errInvalidEmail');
    if (mode !== 'forgot') {
      if (password.length < 6) return t('auth.errPasswordShort');
      if (mode === 'signup' && password !== confirm)
        return t('auth.errPasswordMismatch');
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);

    // ── Réinitialisation du mot de passe
    if (mode === 'forgot') {
      const { error: err } = await resetPassword(email);
      setSubmitting(false);
      if (err) return showError(err);
      setInfo(t('auth.resetSent'));
      return;
    }

    // ── Connexion / inscription
    const action = mode === 'signin' ? signIn : signUp;
    const { error: err } = await action(email.trim(), password);
    setSubmitting(false);
    if (err) return showError(err);

    if (mode === 'signup' && isConfigured) {
      setInfo(t('auth.createdInfo'));
    }
    // Sinon : la redirection se fait via l'effet (session établie).
  }

  const title =
    mode === 'signin'
      ? t('auth.titleSignin')
      : mode === 'signup'
        ? t('auth.titleSignup')
        : t('auth.titleForgot');
  const subtitle =
    mode === 'signin'
      ? t('auth.subtitleSignin')
      : mode === 'signup'
        ? t('auth.subtitleSignup')
        : t('auth.subtitleForgot');

  const perks = t('auth.perks', { returnObjects: true }) as string[];

  const pwToggle = (
    <button
      type="button"
      onClick={() => setShowPw((s) => !s)}
      aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:text-ink"
    >
      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* ── Panneau de marque (desktop) ─────────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Halos accent discrets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-sage-300/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-sage-300/10 blur-3xl" />
        </div>

        <Link to="/" className="relative w-fit">
          <Logo tone="dark" />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight xl:text-5xl">
            <Highlight text={t('hero.title')} mutedClassName="text-white/45" />
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            {t('footer.tagline')}
          </p>
          <ul className="mt-8 space-y-3.5">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] text-white/85">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-300 text-ink">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3">
          <AvatarStack />
          <div>
            <StarRating size={14} className="text-white" />
            <p className="mt-0.5 text-xs font-medium text-white/60">
              {t('hero.rating')} · {t('hero.social', { count: USER_COUNT })}
            </p>
          </div>
        </div>
      </aside>

      {/* ── Panneau formulaire ──────────────────────────────────────── */}
      <main className="relative flex min-h-screen flex-col px-5 py-7 sm:px-10">
        {/* Halo accent discret (surtout visible sur mobile) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-64 bg-gradient-to-b from-sage-300/10 to-transparent lg:hidden" />

        {/* Barre du haut : logo (mobile) + sélecteur de langue */}
        <div className="relative flex items-center justify-between">
          <Link to="/" className="lg:hidden">
            <Logo className="h-7" />
          </Link>
          <LanguageSwitcher className="ml-auto" />
        </div>

        <div className="relative flex flex-1 items-center justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-sm"
          >
            <h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1>
            <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>

            {/* Onglets (masqués en mode « mot de passe oublié ») */}
            {mode !== 'forgot' && (
              <div className="mt-7 grid grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1">
                {(['signin', 'signup'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`h-10 rounded-full text-sm font-semibold transition-all ${
                      mode === m
                        ? 'bg-ink text-white shadow-sm'
                        : 'text-neutral-500 hover:text-ink'
                    }`}
                  >
                    {m === 'signin' ? t('auth.signin') : t('auth.signup')}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              <Input
                id="email"
                tone="ink"
                type="email"
                label={t('auth.email')}
                placeholder="vous@exemple.com"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              {mode !== 'forgot' && (
                <Input
                  id="password"
                  tone="ink"
                  type={showPw ? 'text' : 'password'}
                  label={t('auth.password')}
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  trailing={pwToggle}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                />
              )}

              {mode === 'signup' && (
                <Input
                  id="confirm"
                  tone="ink"
                  type={showPw ? 'text' : 'password'}
                  label={t('auth.confirm')}
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-medium text-neutral-500 transition-colors hover:text-ink"
                  >
                    {t('auth.forgot')}
                  </button>
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </p>
              )}
              {info && (
                <p className="rounded-xl bg-sage-50 px-3 py-2 text-xs font-medium text-sage-700">
                  {info}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-ink-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
              >
                {submitting
                  ? t('auth.submitting')
                  : mode === 'signin'
                    ? t('auth.submitSignin')
                    : mode === 'signup'
                      ? t('auth.submitSignup')
                      : t('auth.submitForgot')}
                {!submitting && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>

            {/* Retour depuis « mot de passe oublié » */}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.backToSignin')}
              </button>
            )}

            {/* Mode invité (Supabase non configuré) */}
            {!isConfigured && mode !== 'forgot' && (
              <>
                <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
                  <span className="h-px flex-1 bg-ink/10" />
                  ou
                  <span className="h-px flex-1 bg-ink/10" />
                </div>
                <button
                  type="button"
                  onClick={signInDemo}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:bg-neutral-50 active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('auth.guest')}
                </button>
                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-neutral-400">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Supabase n’est pas connecté : les comptes sont stockés localement
                  sur cet appareil. Renseignez la clé{' '}
                  <code className="rounded bg-neutral-100 px-1">VITE_SUPABASE_ANON_KEY</code>{' '}
                  pour activer les comptes réels.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
