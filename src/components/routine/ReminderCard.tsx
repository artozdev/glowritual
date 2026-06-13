import { useEffect } from 'react';
import { BellRing, Bell, Sunrise, Moon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useReminders } from '@/hooks/useReminders';
import { cn } from '@/lib/utils';

/** Millisecondes jusqu'à la prochaine occurrence de 'HH:MM'. */
function msUntil(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h ?? 0, m ?? 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

/**
 * Carte de réglage des rappels de routine.
 * Programme une notification matin/soir tant que l'app est ouverte.
 */
export function ReminderCard() {
  const { prefs, permission, update, requestPermission } = useReminders();
  const active = prefs.enabled && permission === 'granted';

  // Programme les notifications du jour (matin / soir).
  useEffect(() => {
    if (!active) return;
    const timers: number[] = [];
    const schedule = (time: string, label: string) => {
      timers.push(
        window.setTimeout(() => {
          try {
            new Notification('Glow', {
              body: `C’est l’heure de votre routine du ${label} 🌿`,
            });
          } catch {
            /* ignore */
          }
        }, msUntil(time)),
      );
    };
    schedule(prefs.morning, 'matin');
    schedule(prefs.evening, 'soir');
    return () => timers.forEach((t) => clearTimeout(t));
  }, [active, prefs.morning, prefs.evening]);

  async function toggle() {
    if (!prefs.enabled) {
      // À l'activation, on demande la permission de notifier.
      if (permission !== 'granted') await requestPermission();
      update({ enabled: true });
    } else {
      update({ enabled: false });
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-50">
            {active ? (
              <BellRing className="h-4 w-4 text-sage-500" />
            ) : (
              <Bell className="h-4 w-4 text-sage-400" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-sage-900">Rappels</p>
            <p className="text-xs text-sage-500">
              {active
                ? 'Activés — quand l’app est ouverte'
                : 'Recevez un rappel matin & soir'}
            </p>
          </div>
        </div>

        {/* Interrupteur */}
        <button
          type="button"
          role="switch"
          aria-checked={prefs.enabled}
          onClick={toggle}
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors',
            prefs.enabled ? 'bg-sage-500' : 'bg-beige-200',
          )}
        >
          <span
            className={cn(
              'absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition-transform',
              prefs.enabled ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {prefs.enabled && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="rounded-2xl border border-beige-200 bg-beige-50 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-sage-600">
              <Sunrise className="h-3.5 w-3.5" /> Matin
            </span>
            <input
              type="time"
              value={prefs.morning}
              onChange={(e) => update({ morning: e.target.value })}
              className="mt-1 w-full bg-transparent text-lg font-semibold text-sage-900 focus:outline-none"
            />
          </label>
          <label className="rounded-2xl border border-beige-200 bg-beige-50 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-sage-600">
              <Moon className="h-3.5 w-3.5" /> Soir
            </span>
            <input
              type="time"
              value={prefs.evening}
              onChange={(e) => update({ evening: e.target.value })}
              className="mt-1 w-full bg-transparent text-lg font-semibold text-sage-900 focus:outline-none"
            />
          </label>
        </div>
      )}

      {prefs.enabled && permission === 'denied' && (
        <p className="mt-3 text-xs text-amber-600">
          Notifications bloquées par le navigateur — autorisez-les pour recevoir
          les rappels.
        </p>
      )}
      {prefs.enabled && permission === 'unsupported' && (
        <p className="mt-3 text-xs text-sage-400">
          Notifications non disponibles sur cet appareil.
        </p>
      )}
    </Card>
  );
}
