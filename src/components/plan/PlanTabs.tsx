import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PlanTab {
  id: string;
  label: string;
}

/**
 * Navigation par ancres collante du Glow Plan : scroll doux vers chaque
 * section, onglet actif suivi au défilement. Mobile-first (scroll horizontal).
 */
export function PlanTabs({ tabs }: { tabs: PlanTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');

  useEffect(() => {
    const onScroll = () => {
      let current = tabs[0]?.id ?? '';
      for (const t of tabs) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top <= 140) current = t.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [tabs]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 110,
      behavior: 'smooth',
    });
  };

  return (
    <div className="no-scrollbar sticky top-0 z-30 -mx-5 mt-4 flex gap-2 overflow-x-auto bg-cream/90 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => go(t.id)}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            active === t.id
              ? 'bg-sage-500 text-white shadow-soft'
              : 'border border-beige-200 bg-white text-sage-600 hover:bg-sage-50',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
