import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  /** Conservé pour compatibilité — le logo image inclut toujours le mot-symbole. */
  withWordmark?: boolean;
  /**
   * `image` (défaut) : logo officiel PNG (sur fond clair).
   * `dark` : lockup vectoriel pour fond sombre — pastille accent + feuille +
   * « glow » en blanc (le wordmark noir du PNG est invisible sur l'ink).
   */
  tone?: 'image' | 'dark';
  className?: string;
};

/** Logo Glow (pastille menthe + feuille + « glow »). */
export function Logo({ tone = 'image', className }: LogoProps) {
  if (tone === 'dark') {
    return (
      <span className={cn('inline-flex select-none items-center gap-2.5', className)}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage-300">
          <Leaf className="h-5 w-5 text-ink" strokeWidth={2.4} />
        </span>
        <span className="text-2xl font-bold lowercase tracking-tight text-white">
          glow
        </span>
      </span>
    );
  }
  return (
    <img
      src="/img/glow-logo.png"
      alt="Glow"
      className={cn('h-8 w-auto select-none', className)}
      draggable={false}
    />
  );
}
