# Consent

One localStorage key, `ichava.consent`, holds the visitor's consent answer, `essential` or `all`, for every Ichava surface on the origin, and one notice at a time asks for it.

```ts
import {
  loadSiteConsent, saveSiteConsent, subscribeSiteConsent, resolveConsent,
  claimConsentNotice, holdsConsentNotice, subscribeConsentNotice,
} from '@ichava/js-ui-kernel';

loadSiteConsent();                       // 'essential' | 'all' | null when unanswered or unreadable
saveSiteConsent('all');                  // writes the key and notifies this document; null clears it
const off = subscribeSiteConsent((c) => {}); // same-document changes; use the storage event for other tabs
resolveConsent(persisted.consent);       // the site answer, else adopts a valid per-mount one once
```

## The notice

Each unanswered mount calls `claimConsentNotice(Symbol())` and keeps the release function. `holdsConsentNotice(id)` is true for the first claim only, and `subscribeConsentNotice` reports when that changes, so a page with several mounts shows exactly one notice. Releasing hands the notice to the next claim.

## Storage

Storage that throws (private mode, a sandboxed frame) reads as unanswered; subscribers still hear about a save, so the page that answered stops asking.

The module moved here from react-icon-browser's `src/core/consentShare.ts` with the same key, values and functions.

---

[← Docs index](../../README.md#documentation)
