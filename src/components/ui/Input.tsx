import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Icône optionnelle affichée à gauche du champ. */
  icon?: ReactNode;
  /** Élément optionnel affiché à droite (ex. bouton afficher/masquer). */
  trailing?: ReactNode;
  error?: string;
}

/** Champ de saisie du design system : arrondi, focus sauge accessible. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, trailing, error, id, ...props }, ref) => {
    return (
      <label htmlFor={id} className="block">
        {label && (
          <span className="mb-1.5 block text-sm font-medium text-sage-700">
            {label}
          </span>
        )}
        <span className="relative block">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sage-400">
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              'h-11 w-full rounded-2xl border border-beige-200 bg-white text-sm text-sage-900 placeholder:text-sage-400',
              'transition-colors focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-200',
              icon ? 'pl-10' : 'pl-4',
              trailing ? 'pr-11' : 'pr-4',
              error && 'border-red-300 focus:ring-red-100',
              className,
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute inset-y-0 right-2 flex items-center">
              {trailing}
            </span>
          )}
        </span>
        {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
      </label>
    );
  },
);

Input.displayName = 'Input';
