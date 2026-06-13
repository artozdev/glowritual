import { useMemo, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { AuroraBackground } from '@/components/common/AuroraBackground';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { isMinor, type Concern, type UserProfile } from '@/types/profile';
import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  SKIN_TYPE_OPTIONS,
  CONCERN_OPTIONS,
  GOAL_OPTIONS,
  SLEEP_OPTIONS,
  HYDRATION_OPTIONS,
  ACTIVITY_OPTIONS,
  STRESS_OPTIONS,
  DIET_OPTIONS,
  CURRENT_ROUTINE_OPTIONS,
  ROUTINE_TIME_OPTIONS,
  PRODUCT_PREF_OPTIONS,
  ALLERGEN_OPTIONS,
  type Option,
} from '@/data/profileOptions';
import { cn } from '@/lib/utils';

/* ── Sélecteurs réutilisables ───────────────────────────────────── */

function SingleSelect<T extends string>({
  value,
  options,
  onSelect,
}: {
  value: T | null;
  options: Option<T>[];
  onSelect: (v: T) => void;
}) {
  return (
    <div className="grid gap-2.5">
      {options.map((o) => (
        <OptionCard
          key={o.value}
          emoji={o.emoji}
          label={o.label}
          hint={o.hint}
          selected={value === o.value}
          onClick={() => onSelect(o.value)}
        />
      ))}
    </div>
  );
}

function MultiSelect<T extends string>({
  values,
  options,
  onToggle,
}: {
  values: T[];
  options: Option<T>[];
  onToggle: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((o) => (
        <OptionCard
          key={o.value}
          emoji={o.emoji}
          label={o.label}
          selected={values.includes(o.value)}
          onClick={() => onToggle(o.value)}
        />
      ))}
    </div>
  );
}

function PillRow<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T | null;
  options: Option<T>[];
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-sage-700">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            className={cn(
              'rounded-2xl border p-2.5 text-center text-xs font-medium transition-colors',
              value === o.value
                ? 'border-sage-400 bg-sage-50 text-sage-800'
                : 'border-beige-200 bg-white text-sage-600 hover:border-sage-200',
            )}
          >
            <span className="mb-0.5 block text-lg">{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Page d'onboarding ──────────────────────────────────────────── */

interface Step {
  title: string;
  subtitle?: string;
  skippable: boolean;
  valid: boolean;
  content: ReactNode;
}

export default function Onboarding() {
  const { user } = useAuth();
  const { profile, completeOnboarding } = useProfile();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<UserProfile>(() => ({ ...profile }));
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [dir, setDir] = useState(1);

  const set = (patch: Partial<UserProfile>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const toggleConcern = (v: Concern) =>
    set({
      concerns: draft.concerns.includes(v)
        ? draft.concerns.filter((c) => c !== v)
        : [...draft.concerns, v],
    });

  const toggleAllergen = (tokens: string[]) => {
    const next = new Set(draft.allergies);
    const active = tokens.every((t) => next.has(t));
    tokens.forEach((t) => (active ? next.delete(t) : next.add(t)));
    set({ allergies: [...next] });
  };

  const minor = isMinor(draft);
  // Garde-fou mineur : on reste centré sur le soin de la peau.
  const concernOptions = minor
    ? CONCERN_OPTIONS.filter((o) =>
        ['hydration', 'radiance', 'dark_circles', 'texture', 'acne'].includes(
          o.value,
        ),
      )
    : CONCERN_OPTIONS;

  const steps: Step[] = useMemo(() => {
    return [
      {
        title: 'Comment souhaites-tu être appelé·e ?',
        subtitle: 'On personnalise tout à partir de là.',
        skippable: false,
        valid: draft.displayName.trim().length > 0,
        content: (
          <Input
            id="displayName"
            label="Ton prénom"
            placeholder="Ex. Léa"
            value={draft.displayName}
            onChange={(e) => set({ displayName: e.target.value })}
            autoFocus
          />
        ),
      },
      {
        title: 'Quel est ton âge ?',
        subtitle: 'Pour adapter nos conseils en douceur.',
        skippable: false,
        valid: true,
        content: (
          <SingleSelect
            value={draft.ageBand}
            options={AGE_OPTIONS}
            onSelect={(v) => set({ ageBand: v })}
          />
        ),
      },
      {
        title: 'Tu te reconnais comme…',
        subtitle: 'Utile pour affiner les recommandations.',
        skippable: true,
        valid: true,
        content: (
          <SingleSelect
            value={draft.gender}
            options={GENDER_OPTIONS}
            onSelect={(v) => set({ gender: v })}
          />
        ),
      },
      {
        title: 'Ta peau, plutôt…',
        skippable: false,
        valid: true,
        content: (
          <SingleSelect
            value={draft.skinType}
            options={SKIN_TYPE_OPTIONS}
            onSelect={(v) => set({ skinType: v })}
          />
        ),
      },
      {
        title: 'Qu’aimerais-tu sublimer ?',
        subtitle: 'Plusieurs choix possibles.',
        skippable: false,
        valid: draft.concerns.length > 0,
        content: (
          <MultiSelect
            values={draft.concerns}
            options={concernOptions}
            onToggle={toggleConcern}
          />
        ),
      },
      {
        title: 'Ton objectif principal ?',
        skippable: true,
        valid: true,
        content: (
          <SingleSelect
            value={draft.goal}
            options={GOAL_OPTIONS}
            onSelect={(v) => set({ goal: v })}
          />
        ),
      },
      {
        title: 'Tes habitudes de vie',
        subtitle: 'Le bien-être commence par le quotidien.',
        skippable: true,
        valid: true,
        content: (
          <div className="space-y-4">
            <PillRow
              label="Sommeil par nuit"
              value={draft.sleep}
              options={SLEEP_OPTIONS}
              onSelect={(v) => set({ sleep: v })}
            />
            <PillRow
              label="Eau par jour"
              value={draft.hydration}
              options={HYDRATION_OPTIONS}
              onSelect={(v) => set({ hydration: v })}
            />
            <PillRow
              label="Activité physique"
              value={draft.activity}
              options={ACTIVITY_OPTIONS}
              onSelect={(v) => set({ activity: v })}
            />
            <PillRow
              label="Niveau de stress"
              value={draft.stress}
              options={STRESS_OPTIONS}
              onSelect={(v) => set({ stress: v })}
            />
          </div>
        ),
      },
      {
        title: 'Ton alimentation',
        subtitle: 'Pour des conseils naturels adaptés.',
        skippable: true,
        valid: true,
        content: (
          <div className="space-y-4">
            <SingleSelect
              value={draft.diet}
              options={DIET_OPTIONS}
              onSelect={(v) => set({ diet: v })}
            />
            <div>
              <p className="mb-2 text-sm font-medium text-sage-700">
                Allergies / ingrédients à éviter
              </p>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((a) => {
                  const active = a.tokens.every((t) =>
                    draft.allergies.includes(t),
                  );
                  return (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => toggleAllergen(a.tokens)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-red-100 text-red-600'
                          : 'bg-beige-100 text-sage-600 hover:bg-beige-200',
                      )}
                    >
                      {active && <ShieldAlert className="h-3.5 w-3.5" />}
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Ta routine beauté actuelle ?',
        skippable: true,
        valid: true,
        content: (
          <SingleSelect
            value={draft.currentRoutine}
            options={CURRENT_ROUTINE_OPTIONS}
            onSelect={(v) => set({ currentRoutine: v })}
          />
        ),
      },
      {
        title: 'Combien de temps par jour ?',
        subtitle: 'On calibrera ta routine en conséquence.',
        skippable: true,
        valid: true,
        content: (
          <SingleSelect
            value={draft.routineTime}
            options={ROUTINE_TIME_OPTIONS}
            onSelect={(v) => set({ routineTime: v })}
          />
        ),
      },
      {
        title: 'Tes préférences produits',
        skippable: true,
        valid: true,
        content: (
          <SingleSelect
            value={draft.productPref}
            options={PRODUCT_PREF_OPTIONS}
            onSelect={(v) => set({ productPref: v })}
          />
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, concernOptions]);

  // Sécurité : l'onboarding nécessite une session.
  if (!user) return <Navigate to="/auth" replace />;

  const total = steps.length;
  const step = steps[index]!;
  const progress = finished ? 100 : Math.round(((index + 1) / (total + 1)) * 100);

  function goNext() {
    if (index < total - 1) {
      setDir(1);
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }
  function goPrev() {
    if (finished) {
      setFinished(false);
      return;
    }
    if (index > 0) {
      setDir(-1);
      setIndex((i) => i - 1);
    }
  }
  function finish() {
    completeOnboarding(draft);
    navigate('/scan', { replace: true });
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-5 py-6">
      <AuroraBackground />

      {/* En-tête : logo + progression */}
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <Logo />
          {!finished && (
            <span className="text-xs font-medium text-sage-500">
              Étape {index + 1} / {total}
            </span>
          )}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-beige-200">
          <motion.div
            className="h-full rounded-full bg-sage-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Contenu */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
        <AnimatePresence mode="wait" custom={dir}>
          {finished ? (
            <motion.div
              key="end"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-sage-gradient shadow-soft"
              >
                <Check className="h-10 w-10 text-sage-600" strokeWidth={2.5} />
              </motion.span>
              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-sage-900">
                {minor
                  ? `Parfait ${draft.displayName} ! On va prendre soin de ta peau, en douceur 🌱`
                  : `Parfait ${draft.displayName} ! On a tout ce qu’il faut pour révéler ton potentiel ✨`}
              </h1>
              <p className="mx-auto mt-3 max-w-xs text-sage-600">
                Tes réponses personnalisent dès maintenant tes analyses et tes
                routines.
              </p>
              <Button size="lg" className="mt-8 w-full" onClick={finish}>
                <Sparkles className="h-5 w-5" />
                Lancer ma première analyse
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={index}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
                {step.title}
              </h1>
              {step.subtitle && (
                <p className="mt-1.5 text-sage-600">{step.subtitle}</p>
              )}
              {minor && index === 1 && (
                <p className="mt-3 rounded-2xl bg-sage-50 px-3 py-2 text-xs text-sage-600">
                  🌱 On restera concentré sur le soin de ta peau et de saines
                  habitudes.
                </p>
              )}
              <div className="mt-6">{step.content}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pied : navigation + confidentialité */}
      {!finished && (
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={goPrev}
              disabled={index === 0}
              className="px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>
            <div className="flex-1" />
            {step.skippable && (
              <button
                type="button"
                onClick={goNext}
                className="text-sm font-medium text-sage-500 hover:text-sage-700"
              >
                Passer
              </button>
            )}
            <Button onClick={goNext} disabled={!step.valid && !step.skippable}>
              {index === total - 1 ? 'Terminer' : 'Suivant'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-sage-400">
            <Lock className="h-3 w-3" />
            Ces infos restent privées et servent uniquement à personnaliser ton
            expérience.
          </p>
        </div>
      )}
    </div>
  );
}
