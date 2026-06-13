import { Leaf } from 'lucide-react';

/** Écran de chargement plein écran, le temps de résoudre la session. */
export function FullScreenLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-sage-gradient shadow-soft">
        <Leaf className="h-6 w-6 text-sage-600" />
      </span>
      <p className="text-sm text-sage-500">{label}</p>
    </div>
  );
}
