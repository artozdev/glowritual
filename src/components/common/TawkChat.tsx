import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';

/**
 * Live chat Tawk.to avec un déclencheur personnalisé au style Glow.
 *
 * - Injecte le script Tawk une seule fois (garde via l'id du <script>).
 * - Masque le widget natif (`onLoad` → `hideWidget`) pour ne montrer que
 *   notre bulle de marque. Après fermeture du chat (`onChatMinimized`), on
 *   re-masque le launcher natif.
 * - Au clic : `Tawk_API.maximize()` ouvre la fenêtre de chat.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const TAWK_SRC = 'https://embed.tawk.to/6a328e1fb319cc1d4d432720/1jranmbfd';

function loadTawk(): void {
  if (typeof window === 'undefined') return;
  if (document.getElementById('tawk-script')) return; // déjà chargé

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const hide = () => {
    try {
      window.Tawk_API?.hideWidget?.();
    } catch {
      /* ignore */
    }
  };
  // Masque le launcher natif au chargement, et après chaque fermeture.
  window.Tawk_API.onLoad = hide;
  window.Tawk_API.onChatMinimized = hide;

  const s = document.createElement('script');
  s.id = 'tawk-script';
  s.async = true;
  s.src = TAWK_SRC;
  s.charset = 'UTF-8';
  s.setAttribute('crossorigin', '*');
  document.body.appendChild(s);
}

/** Ouvre la fenêtre de chat Tawk (réaffiche le widget puis le maximise). */
function openTawk(): void {
  const api = window.Tawk_API;
  if (!api) return;
  try {
    api.showWidget?.();
    api.maximize?.();
  } catch {
    /* ignore */
  }
}

/** Avatar du fondateur (placeholder → remplacer par /img/founder.jpg). */
function FounderAvatar({ size = 48 }: { size?: number }) {
  const [ok, setOk] = useState(true);
  const style = { width: size, height: size };
  if (ok)
    return (
      <img
        src="/img/founder.jpg"
        alt="Arthur, fondateur de Glow"
        onError={() => setOk(false)}
        style={style}
        className="rounded-full object-cover"
      />
    );
  return (
    <span
      style={style}
      className="flex items-center justify-center rounded-full bg-mint text-lg font-bold text-forest"
    >
      A
    </span>
  );
}

export function TawkChat() {
  const { t } = useTranslation();
  useEffect(() => {
    loadTawk();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
      className="fixed bottom-5 right-5 z-[60]"
    >
      {/* Desktop : carte de marque */}
      <button
        type="button"
        onClick={openTawk}
        aria-label="Contactez-nous sur le chat"
        className="hidden items-center gap-3 rounded-3xl border border-forest/10 bg-white p-2.5 pr-3 text-left shadow-soft-lg transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:flex"
      >
        <span className="relative shrink-0">
          <FounderAvatar size={48} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-forest">{t('chat.name')}</span>
          <span className="block text-xs text-forest/60">{t('chat.role')}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t('chat.online')}
          </span>
        </span>
        <span className="ml-1 shrink-0 rounded-full bg-forest px-3.5 py-2 text-xs font-semibold text-sand shadow-soft">
          {t('chat.cta')}
        </span>
      </button>

      {/* Mobile : icône ronde discrète */}
      <button
        type="button"
        onClick={openTawk}
        aria-label="Contactez-nous sur le chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-forest text-sand shadow-soft-lg transition-transform active:scale-95 sm:hidden"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-forest bg-emerald-500" />
      </button>
    </motion.div>
  );
}
