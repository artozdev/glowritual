import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Share2, Loader2 } from 'lucide-react';
import { ScanPhoto } from './ScanPhoto';
import { Button } from '@/components/ui/Button';
import { bestImprovement, chronological, daysBetween } from '@/lib/progress';
import type { StoredScan } from '@/types/domain';

/**
 * Carte récap partageable (branding Glow : menthe + doré) montrant
 * l'avant/après et le gain. Exportable en image (story Instagram).
 */
export function ShareCard({ history }: { history: StoredScan[] }) {
  const sorted = chronological(history);
  const older = sorted[0]!;
  const newer = sorted[sorted.length - 1]!;
  const best = bestImprovement(older, newer);
  const days = daysBetween(older.createdAt, newer.createdAt);
  const overallDelta = newer.overall - older.overall;

  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function share() {
    const node = cardRef.current;
    if (!node) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#b6ffc4',
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'ma-progression-glow.png', {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ma progression Glow',
          text: 'Mon glow up avec Glow ✨',
        });
      } else {
        // Repli : téléchargement de l'image.
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'ma-progression-glow.png';
        a.click();
      }
    } catch {
      /* partage annulé ou non supporté */
    } finally {
      setBusy(false);
    }
  }

  const gain =
    best && best.delta > 0
      ? `+${best.delta} points ${best.phrase}`
      : `${overallDelta >= 0 ? '+' : ''}${overallDelta} points`;

  return (
    <div>
      {/* Carte exportable */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl bg-mint p-5 text-forest"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/40 blur-2xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <img src="/img/glow-logo.png" alt="Glow" className="h-7 w-auto" />
            <span className="rounded-full bg-forest px-2.5 py-1 text-[10px] font-bold tracking-wide text-mint">
              MA PROGRESSION
            </span>
          </div>

          {/* Avant / Après */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              { s: older, l: 'Avant' },
              { s: newer, l: 'Après' },
            ].map(({ s, l }) => (
              <div key={l} className="relative overflow-hidden rounded-2xl">
                <ScanPhoto scan={s} className="aspect-[3/4] w-full" />
                <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-forest">
                  {l}
                </span>
                <span className="absolute bottom-2 right-2 rounded-full bg-forest px-2 py-0.5 text-[11px] font-bold text-mint">
                  {s.overall}
                </span>
              </div>
            ))}
          </div>

          {/* Gain */}
          <div className="mt-4 rounded-2xl bg-white/70 p-3 text-center">
            <p className="text-2xl font-bold text-forest">{gain}</p>
            <p className="text-xs font-semibold text-forest/70">
              en {days} jour{days > 1 ? 's' : ''} 🌿
            </p>
          </div>

          <p className="mt-3 text-center text-[11px] font-medium text-forest/60">
            glow · ton glow naturel, guidé par l’IA
          </p>
        </div>
      </div>

      <Button className="mt-3 w-full" onClick={share} disabled={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        Partager ma progression
      </Button>
    </div>
  );
}
