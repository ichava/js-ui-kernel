// The language handoff between the Ichava UI surfaces. The browser and the landing page
// run on one origin and share one localStorage key, `ichava.locale`, so switching the
// language in either carries to the other and survives reloads. Framework-free: any
// framework can wrap the subscription (plus the `storage` event for other tabs).

import { DEFAULT_LOCALE, isLocale, type Locale } from './i18n.js';

/** The single localStorage key both surfaces read and write. */
export const SHARED_LOCALE_KEY = 'ichava.locale';

// Same-document subscribers. The `storage` event only fires in OTHER tabs, so a write
// here notifies local subscribers directly.
const listeners = new Set<(l: Locale) => void>();

/** Read the shared locale, or the default when unset, invalid or unreadable. */
export function loadSharedLocale(): Locale {
  try {
    const v = globalThis.localStorage?.getItem(SHARED_LOCALE_KEY);
    if (isLocale(v)) return v;
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_LOCALE;
}

/** Persist the shared locale and notify same-document subscribers. */
export function saveSharedLocale(locale: Locale): void {
  try {
    globalThis.localStorage?.setItem(SHARED_LOCALE_KEY, locale);
  } catch {
    /* storage unavailable: subscribers still hear about it */
  }
  for (const fn of listeners) fn(locale);
}

/** Subscribe to same-document locale changes. Returns an unsubscribe function. */
export function subscribeSharedLocale(fn: (l: Locale) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
