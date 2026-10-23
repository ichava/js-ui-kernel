import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SHARED_LOCALE_KEY, loadSharedLocale, saveSharedLocale, subscribeSharedLocale } from '../src/locale-handoff.js';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));
afterEach(() => vi.unstubAllGlobals());

describe('the shared locale', () => {
  it('is the one key both surfaces read', () => {
    expect(SHARED_LOCALE_KEY).toBe('ichava.locale');
  });

  it('round-trips, and reads the default when unset or invalid', () => {
    expect(loadSharedLocale()).toBe('en');
    saveSharedLocale('sw');
    expect(localStorage.getItem(SHARED_LOCALE_KEY)).toBe('sw');
    expect(loadSharedLocale()).toBe('sw');
    localStorage.setItem(SHARED_LOCALE_KEY, 'xx');
    expect(loadSharedLocale()).toBe('en');
  });

  it('notifies same-document subscribers until they unsubscribe', () => {
    const seen: string[] = [];
    const off = subscribeSharedLocale((l) => seen.push(l));
    saveSharedLocale('fr');
    off();
    saveSharedLocale('de');
    expect(seen).toEqual(['fr']);
  });

  it('survives storage that throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    expect(loadSharedLocale()).toBe('en');
    expect(() => saveSharedLocale('ar')).not.toThrow();
  });
});
