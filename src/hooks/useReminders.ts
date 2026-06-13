import { useCallback, useState } from 'react';

export interface ReminderPrefs {
  enabled: boolean;
  morning: string; // 'HH:MM'
  evening: string; // 'HH:MM'
}

const STORAGE_KEY = 'naturalme.reminders.v1';
const DEFAULT_PREFS: ReminderPrefs = {
  enabled: false,
  morning: '08:00',
  evening: '21:00',
};

function load(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_PREFS;
}

type Permission = NotificationPermission | 'unsupported';

function currentPermission(): Permission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

/**
 * Préférences de rappels de routine (heure matin/soir) + permission de
 * notification. Les rappels se déclenchent lorsque l'app est ouverte ;
 * les notifications push hors-ligne (service worker) seront ajoutées plus tard.
 */
export function useReminders() {
  const [prefs, setPrefs] = useState<ReminderPrefs>(load);
  const [permission, setPermission] = useState<Permission>(currentPermission);

  const update = useCallback((patch: Partial<ReminderPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<Permission> => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return { prefs, permission, update, requestPermission };
}
