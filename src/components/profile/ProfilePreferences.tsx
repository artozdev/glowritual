import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldAlert, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useProfile } from '@/hooks/useProfile';
import {
  SKIN_TYPE_OPTIONS,
  PRODUCT_PREF_OPTIONS,
  ALLERGEN_OPTIONS,
  type Option,
} from '@/data/profileOptions';
import { cn } from '@/lib/utils';

function Pills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === o.value
              ? 'bg-sage-600 text-white shadow-soft'
              : 'bg-beige-100 text-sage-600 hover:bg-beige-200',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-sage-700">{label}</p>
      {children}
    </div>
  );
}

/** Édition des préférences clés (issues de l'onboarding) + reprise du questionnaire. */
export function ProfilePreferences() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();

  const allergenActive = (tokens: string[]) =>
    tokens.every((t) => profile.allergies.includes(t));

  const toggleAllergen = (tokens: string[]) => {
    const set = new Set(profile.allergies);
    const active = allergenActive(tokens);
    tokens.forEach((t) => (active ? set.delete(t) : set.add(t)));
    update({ allergies: [...set] });
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-sage-900">
          <Sparkles className="h-4 w-4 text-sage-500" />
          Mes préférences
        </h2>
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-sage-500 hover:text-sage-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refaire le questionnaire
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <Field label="Comment vous appeler ?">
          <Input
            id="displayName"
            value={profile.displayName}
            onChange={(e) => update({ displayName: e.target.value })}
            placeholder="Votre prénom"
          />
        </Field>

        <Field label="Type de peau">
          <Pills
            value={profile.skinType}
            options={SKIN_TYPE_OPTIONS}
            onChange={(v) => update({ skinType: v })}
          />
        </Field>

        <Field label="Préférence produits">
          <Pills
            value={profile.productPref}
            options={PRODUCT_PREF_OPTIONS}
            onChange={(v) => update({ productPref: v })}
          />
        </Field>

        <Field label="Allergies / ingrédients à éviter">
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map((a) => {
              const active = allergenActive(a.tokens);
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
          <p className="mt-2 text-xs text-sage-400">
            Les produits contenant ces ingrédients seront strictement exclus.
          </p>
        </Field>
      </div>
    </Card>
  );
}
