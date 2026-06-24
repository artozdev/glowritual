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
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuroraBackground } from '@/components/common/AuroraBackground';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'signin' | 'signup' | 'forgot';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const pwToggle = (
    <button
      type="button"
      onClick={() => setShowPw((s) => !s)}
      aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-sage-400 transition-colors hover:text-sage-600"
    >
      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-10">
      <AuroraBackground />

      <div className="mb-8 flex flex-col items-center gap-3">
        <Link to="/">
          <Logo />
        </Link>
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-4xl border border-white/60 bg-white/80 p-7 shadow-soft-lg backdrop-blur-xl"
      >
        <h1 className="text-center text-2xl font-semibold tracking-tight text-sage-900">
          {title}
        </h1>
        <p className="mt-1 text-center text-sm text-sage-600">{subtitle}</p>

        {/* Onglets (masqués en mode « mot de passe oublié ») */}
        {mode !== 'forgot' && (
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-beige-100 p-1">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`h-9 rounded-xl text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-white text-sage-900 shadow-soft'
                    : 'text-sage-500 hover:text-sage-700'
                }`}
              >
                {m === 'signin' ? t('auth.signin') : t('auth.signup')}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <Input
            id="email"
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
                className="text-xs font-medium text-sage-500 hover:text-sage-700"
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
            <p className="rounded-xl bg-sage-50 px-3 py-2 text-xs text-sage-700">
              {info}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? t('auth.submitting')
              : mode === 'signin'
                ? t('auth.submitSignin')
                : mode === 'signup'
                  ? t('auth.submitSignup')
                  : t('auth.submitForgot')}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        {/* Retour depuis « mot de passe oublié » */}
        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-sage-500 hover:text-sage-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToSignin')}
          </button>
        )}

        {/* Mode invité (Supabase non configuré) */}
        {!isConfigured && mode !== 'forgot' && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-sage-400">
              <span className="h-px flex-1 bg-beige-200" />
              ou
              <span className="h-px flex-1 bg-beige-200" />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={signInDemo}
            >
              <Sparkles className="h-4 w-4" />
              {t('auth.guest')}
            </Button>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-sage-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Supabase n’est pas connecté : les comptes sont stockés localement
              sur cet appareil. Renseignez la clé{' '}
              <code className="rounded bg-beige-100 px-1">VITE_SUPABASE_ANON_KEY</code>{' '}
              pour activer les comptes réels.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
