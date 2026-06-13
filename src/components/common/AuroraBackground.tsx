import { cn } from '@/lib/utils';

/**
 * Fond décoratif premium : blobs sauge/beige flous en mouvement lent
 * + voile « mesh » + grain subtil. Purement visuel (aria-hidden).
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-cream grain',
        className,
      )}
    >
      {/* Voile mesh organique */}
      <div className="absolute inset-0 bg-mesh opacity-90" />

      {/* Blobs flottants */}
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-sage-300/40 blur-3xl animate-float-slow" />
      <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-beige-300/50 blur-3xl animate-float-slower" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sage-200/40 blur-3xl animate-float-slow" />
    </div>
  );
}
