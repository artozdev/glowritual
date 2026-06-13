import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'denied'
  | 'unavailable';

/**
 * Accès webcam via getUserMedia + capture d'une image.
 *
 * - `start()` demande l'autorisation et lance le flux.
 * - `capture()` fige l'image courante en dataURL (miroir pour la caméra frontale).
 * - Le flux est proprement coupé au démontage.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      setError('La caméra n’est pas disponible sur cet appareil/navigateur.');
      return;
    }
    setStatus('requesting');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatus('ready');
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setStatus('denied');
        setError('Accès caméra refusé. Autorisez la caméra pour scanner.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setStatus('unavailable');
        setError('Aucune caméra détectée.');
      } else {
        setStatus('unavailable');
        setError('Impossible d’accéder à la caméra.');
      }
    }
  }, []);

  /** Capture l'image courante en dataURL JPEG (miroir = aperçu frontal). */
  const capture = useCallback((mirror = true): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  /**
   * Capture une sous-zone (boîte normalisée en espace vidéo) en dataURL.
   * Le rendu est mis en miroir pour rester cohérent avec l'aperçu selfie.
   */
  const captureRegion = useCallback(
    (
      box: { minX: number; minY: number; maxX: number; maxY: number },
      pad = 0,
    ): string | null => {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return null;
      const VW = video.videoWidth;
      const VH = video.videoHeight;

      // Bornes en espace miroir (affichage selfie).
      const minX = Math.max(0, 1 - (box.maxX + pad));
      const maxX = Math.min(1, 1 - (box.minX - pad));
      const minY = Math.max(0, box.minY - pad);
      const maxY = Math.min(1, box.maxY + pad);
      const sx = minX * VW;
      const sy = minY * VH;
      const sw = (maxX - minX) * VW;
      const sh = (maxY - minY) * VH;
      if (sw < 4 || sh < 4) return null;

      // Cadre complet en miroir, puis découpe (la découpe correspond ainsi
      // exactement à l'image globale selfie conservée).
      const full = document.createElement('canvas');
      full.width = VW;
      full.height = VH;
      const fctx = full.getContext('2d');
      if (!fctx) return null;
      fctx.translate(VW, 0);
      fctx.scale(-1, 1);
      fctx.drawImage(video, 0, 0, VW, VH);

      const out = document.createElement('canvas');
      out.width = Math.round(sw);
      out.height = Math.round(sh);
      const octx = out.getContext('2d');
      if (!octx) return null;
      octx.drawImage(full, sx, sy, sw, sh, 0, 0, out.width, out.height);
      return out.toDataURL('image/jpeg', 0.85);
    },
    [],
  );

  // Coupe le flux quand le composant se démonte.
  useEffect(() => stop, [stop]);

  return { videoRef, status, error, start, stop, capture, captureRegion };
}
