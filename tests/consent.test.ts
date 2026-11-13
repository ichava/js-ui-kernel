import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SITE_CONSENT_KEY,
  claimConsentNotice,
  holdsConsentNotice,
  isConsent,
  loadSiteConsent,
  resolveConsent,
  saveSiteConsent,
  subscribeConsentNotice,
  subscribeSiteConsent,
} from '../src/consent.js';

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

describe('the site-wide consent answer', () => {
  it('is the one key every surface reads', () => {
    expect(SITE_CONSENT_KEY).toBe('ichava.consent');
  });

  it('accepts exactly the two answers', () => {
    expect(isConsent('essential')).toBe(true);
    expect(isConsent('all')).toBe(true);
    for (const v of ['none', '', null, undefined, 1, 'ALL']) expect(isConsent(v)).toBe(false);
  });

  it('round-trips, clears with null, and reads null when unset or invalid', () => {
    expect(loadSiteConsent()).toBeNull();
    saveSiteConsent('all');
    expect(localStorage.getItem(SITE_CONSENT_KEY)).toBe('all');
    expect(loadSiteConsent()).toBe('all');
    saveSiteConsent(null);
    expect(localStorage.getItem(SITE_CONSENT_KEY)).toBeNull();
    localStorage.setItem(SITE_CONSENT_KEY, 'yes');
    expect(loadSiteConsent()).toBeNull();
  });

  it('notifies same-document subscribers until they unsubscribe', () => {
    const seen: (string | null)[] = [];
    const off = subscribeSiteConsent((c) => seen.push(c));
    saveSiteConsent('essential');
    saveSiteConsent(null);
    off();
    saveSiteConsent('all');
    expect(seen).toEqual(['essential', null]);
  });

  it('prefers the site answer, else adopts a valid per-mount one once', () => {
    expect(resolveConsent('bogus')).toBeNull();
    expect(resolveConsent('essential')).toBe('essential');
    expect(localStorage.getItem(SITE_CONSENT_KEY)).toBe('essential');
    expect(resolveConsent('all')).toBe('essential');
  });

  it('degrades to null when storage throws, and still notifies', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    });
    expect(loadSiteConsent()).toBeNull();
    const seen: (string | null)[] = [];
    const off = subscribeSiteConsent((c) => seen.push(c));
    saveSiteConsent('all');
    off();
    expect(seen).toEqual(['all']);
  });
});

describe('the consent notice', () => {
  it('is held by the first claim and handed on when released', () => {
    const a = Symbol('a');
    const b = Symbol('b');
    let changes = 0;
    const off = subscribeConsentNotice(() => changes++);
    const releaseA = claimConsentNotice(a);
    const releaseB = claimConsentNotice(b);
    claimConsentNotice(a); // a repeat claim is not queued twice
    expect(holdsConsentNotice(a)).toBe(true);
    expect(holdsConsentNotice(b)).toBe(false);
    releaseA();
    expect(holdsConsentNotice(b)).toBe(true);
    releaseB();
    releaseB(); // releasing twice is a no-op
    expect(holdsConsentNotice(b)).toBe(false);
    off();
    expect(changes).toBe(4);
  });
});
