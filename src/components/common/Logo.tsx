import { cn } from '@/lib/utils';

type LogoProps = {
  /** Conservé pour compatibilité — le logo image inclut toujours le mot-symbole. */
  withWordmark?: boolean;
  className?: string;
};

/** Logo Glow (image officielle : pastille menthe + feuille + « glow »). */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/img/glow-logo.png"
      alt="Glow"
      className={cn('h-8 w-auto select-none', className)}
      draggable={false}
    />
  );
}
