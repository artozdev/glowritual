import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-sage-300 text-sage-900 hover:bg-sage-400 shadow-soft focus-visible:ring-sage-400',
  secondary:
    'bg-beige-100 text-sage-800 hover:bg-beige-200 focus-visible:ring-beige-300',
  outline:
    'border border-sage-300 text-sage-700 hover:bg-sage-50 focus-visible:ring-sage-200',
  ghost: 'text-sage-700 hover:bg-sage-50 focus-visible:ring-sage-200',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
};

/**
 * Bouton du design system : coins arrondis, transitions douces,
 * focus accessible, variantes sauge/beige.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex select-none items-center justify-center gap-2 rounded-2xl font-medium',
          'transition-all duration-200 ease-out active:scale-[0.98]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
