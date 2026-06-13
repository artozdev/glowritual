import { useCallback, useState } from 'react';
import {
  prepareFaceLandmarker,
  detectFaceLandmarks,
} from '@/lib/landmarks';
import type { NormalizedPoint } from '@/types/domain';

export type LandmarkerStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Accès au Face Landmarker MediaPipe (chargé à la demande).
 * `prepare()` lance le téléchargement WASM + modèle ;
 * `detect()` renvoie les repères d'une dataURL (ou null si pas de visage).
 */
export function useFaceLandmarker() {
  const [status, setStatus] = useState<LandmarkerStatus>('idle');

  const prepare = useCallback(async () => {
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      await prepareFaceLandmarker();
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  const detect = useCallback(
    async (dataUrl: string): Promise<NormalizedPoint[] | null> => {
      try {
        const result = await detectFaceLandmarks(dataUrl);
        setStatus('ready');
        return result;
      } catch {
        setStatus('error');
        return null;
      }
    },
    [],
  );

  return { status, prepare, detect };
}
