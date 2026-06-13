import { Bell, BellRing } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useProfile } from '@/hooks/useProfile';
import { SCAN_REMINDER_OPTIONS } from '@/data/profileOptions';
import { cn } from '@/lib/utils';
import type { ScanReminder } from '@/types/profile';

/** Réglage de la fréquence de rappel de scan (stockée dans le profil). */
export function ScanReminderCard() {
  const { profile, update } = useProfile();
  const active = profile.scanReminder !== 'off';

  async function choose(value: ScanReminder) {
    // À l'activation, on demande la permission de notifier.
    if (
      value !== 'off' &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }
    update({ scanReminder: value });
  }

  const blocked =
    active &&
    typeof Notification !== 'undefined' &&
    Notification.permission === 'denied';

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-50">
          {active ? (
            <BellRing className="h-4 w-4 text-sage-500" />
          ) : (
            <Bell className="h-4 w-4 text-sage-400" />
          )}
        </span>
        <div>
          <p className="text-sm font-semibold text-sage-900">Rappel de scan</p>
          <p className="text-xs text-sage-500">
            Un rappel doux pour scanner régulièrement et suivre tes progrès.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {SCAN_REMINDER_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => choose(o.value)}
            className={cn(
              'rounded-2xl border p-2.5 text-center text-xs font-medium transition-colors',
              profile.scanReminder === o.value
                ? 'border-sage-400 bg-sage-50 text-sage-800'
                : 'border-beige-200 bg-white text-sage-600 hover:border-sage-200',
            )}
          >
            <span className="mb-0.5 block text-lg">{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>

      {blocked && (
        <p className="mt-3 text-xs text-amber-600">
          Notifications bloquées par le navigateur — autorise-les pour recevoir
          le rappel.
        </p>
      )}
    </Card>
  );
}
