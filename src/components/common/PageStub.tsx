import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Étape de la feuille de route où l'écran sera complété. */
  step?: string;
  children?: ReactNode;
};

/**
 * Gabarit temporaire pour les écrans non encore implémentés.
 * Permet de naviguer dans toute l'app dès l'étape 1.
 */
export function PageStub({ icon: Icon, title, description, step, children }: Props) {
  return (
    <div className="mx-auto max-w-xl py-8 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-50">
        <Icon className="h-7 w-7 text-sage-500" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-sage-900">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sage-600">{description}</p>
      {step && (
        <span className="mt-4 inline-block rounded-full bg-beige-100 px-3 py-1 text-xs font-medium text-sage-500">
          À venir · {step}
        </span>
      )}
      {children && <div className="mt-8 text-left">{children}</div>}
    </div>
  );
}
