import { SUPPORTED_LANGS } from '@/i18n';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

/**
 * Sélecteur de langue FR / EN (segment). `tone` adapte les couleurs au fond.
 */
export function LanguageSwitcher({
  className,
  tone = 'light',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border p-0.5',
        tone === 'dark' ? 'border-white/20' : 'border-forest/15',
        className,
      )}
    >
      {SUPPORTED_LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
            lang === l
              ? tone === 'dark'
                ? 'bg-white text-forest'
                : 'bg-forest text-sand'
              : tone === 'dark'
                ? 'text-white/70 hover:text-white'
                : 'text-forest/55 hover:text-forest',
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
