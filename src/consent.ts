// The site-wide consent answer. Consent is an origin-level answer: it lives under one
// localStorage key, `ichava.consent`, so every surface on the origin (the browser, the
// landing page, a host's own pages) and every later visit reads the same answer, and
// only one mount at a time shows the notice. Framework-free, like locale-handoff: any
// framework can build a reactive wrapper on the two subscriptions.
//
// Moved from react-icon-browser's `src/core/consentShare.ts` with the same key, values
// and functions, so a surface on the kernel and one still on the old module agree.

export type Consent = 'essential' | 'all';

/** The site-wide localStorage key. */
export const SITE_CONSENT_KEY = 'ichava.consent';

export function isConsent(v: unknown): v is Consent {
  return v === 'essential' || v === 'all';
}

const answerListeners = new Set<(c: Consent | null) => void>();

/** The site-wide answer, or null when nobody has answered (or storage is unavailable). */
export function loadSiteConsent(): Consent | null {
  try {
    const v = globalThis.localStorage?.getItem(SITE_CONSENT_KEY);
    return isConsent(v) ? v : null;
  } catch {
    return null;
  }
}

/** Record (or, with null, clear) the site-wide answer and tell every same-document mount. */
export function saveSiteConsent(c: Consent | null): void {
  try {
    if (c === null) globalThis.localStorage?.removeItem(SITE_CONSENT_KEY);
    else globalThis.localStorage?.setItem(SITE_CONSENT_KEY, c);
  } catch {
    /* storage unavailable: the answer still reaches this page's mounts */
  }
  for (const fn of answerListeners) fn(c);
}

/** Subscribe to same-document answer changes. Returns an unsubscribe function. */
export function subscribeSiteConsent(fn: (c: Consent | null) => void): () => void {
  answerListeners.add(fn);
  return () => {
    answerListeners.delete(fn);
  };
}

/**
 * The answer a store starts from: the site-wide one when it exists; otherwise a valid
 * per-mount answer from the mount's persisted blob, which is adopted as the site-wide
 * answer so it is read only this once.
 */
export function resolveConsent(perMount: unknown): Consent | null {
  const site = loadSiteConsent();
  if (site !== null) return site;
  if (isConsent(perMount)) {
    saveSiteConsent(perMount);
    return perMount;
  }
  return null;
}

// The notice: one per page. Each unanswered mount queues a claim; the first claim
// holds the notice, and releasing it hands the notice to the next.
const claims: symbol[] = [];
const holderListeners = new Set<() => void>();

function notifyHolder(): void {
  for (const fn of holderListeners) fn();
}

/** Queue a claim on the page's single consent notice. Returns the release function. */
export function claimConsentNotice(id: symbol): () => void {
  if (!claims.includes(id)) {
    claims.push(id);
    notifyHolder();
  }
  return () => {
    const i = claims.indexOf(id);
    if (i !== -1) {
      claims.splice(i, 1);
      notifyHolder();
    }
  };
}

/** Whether this claim currently holds the notice. */
export function holdsConsentNotice(id: symbol): boolean {
  return claims[0] === id;
}

/** Subscribe to changes of which claim holds the notice. */
export function subscribeConsentNotice(fn: () => void): () => void {
  holderListeners.add(fn);
  return () => {
    holderListeners.delete(fn);
  };
}
