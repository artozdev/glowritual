import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Cadre de téléphone réaliste (bezel noir + encoche dynamique).
 * Le contenu est l'écran de l'app.
 */
export function PhoneFrame({
  children,
  width = 240,
  className,
}: {
  children: ReactNode;
  width?: number;
  className?: string;
}) {
  return (
    <div className={cn('relative shrink-0', className)} style={{ width }}>
      <div className="relative rounded-[2.6rem] border-[7px] border-[#111418] bg-[#111418] shadow-soft-lg">
        {/* Encoche */}
        <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#111418]" />
        {/* Écran */}
        <div className="relative aspect-[9/19.3] overflow-hidden rounded-[2.1rem] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Mini barre d'état iOS (heure + icônes). */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? 'text-white' : 'text-forest';
  return (
    <div className={cn('flex items-center justify-between px-5 pt-2.5 text-[10px] font-semibold', c)}>
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-2 w-3.5 rounded-[2px] border border-current" />
      </span>
    </div>
  );
}
