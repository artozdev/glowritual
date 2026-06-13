import { type RefObject } from 'react';
import { Camera, CameraOff, Loader2, ShieldAlert } from 'lucide-react';
import type { ScanKind } from '@/types/domain';
import type { CameraStatus } from '@/hooks/useCamera';
import { FaceGuideOverlay } from './FaceGuideOverlay';

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  status: CameraStatus;
  error: string | null;
  kind: ScanKind;
}

/**
 * Cadre caméra : flux vidéo miroir + guide de cadrage + états
 * (inactif / demande en cours / refusé / indisponible).
 */
export function CameraView({ videoRef, status, error, kind }: Props) {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-beige-200 bg-sage-900 shadow-soft-lg">
      {/* Flux vidéo (miroir pour l'effet selfie) */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="h-full w-full -scale-x-100 object-cover"
      />

      {/* Guide visible dès que le flux est prêt */}
      {status === 'ready' && <FaceGuideOverlay kind={kind} />}

      {/* États sans flux */}
      {status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-sage-100 to-beige-100 p-6 text-center">
          {status === 'idle' && (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/70 shadow-soft">
                <Camera className="h-7 w-7 text-sage-500" />
              </span>
              <p className="text-sm font-medium text-sage-700">
                Caméra prête à être activée
              </p>
              <p className="max-w-xs text-xs text-sage-500">
                Placez-vous dans un endroit lumineux, visage face à l’objectif.
              </p>
            </>
          )}
          {status === 'requesting' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-sage-500" />
              <p className="text-sm text-sage-600">Autorisation en cours…</p>
            </>
          )}
          {status === 'denied' && (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/70 shadow-soft">
                <ShieldAlert className="h-7 w-7 text-sage-500" />
              </span>
              <p className="text-sm font-medium text-sage-700">
                Accès caméra refusé
              </p>
              <p className="max-w-xs text-xs text-sage-500">
                {error ?? 'Autorisez la caméra dans votre navigateur.'}
              </p>
            </>
          )}
          {status === 'unavailable' && (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/70 shadow-soft">
                <CameraOff className="h-7 w-7 text-sage-500" />
              </span>
              <p className="text-sm font-medium text-sage-700">
                Caméra indisponible
              </p>
              <p className="max-w-xs text-xs text-sage-500">
                {error ?? 'Pas de caméra ici — utilisez la photo de démonstration.'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
