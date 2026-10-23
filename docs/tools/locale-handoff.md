# Locale handoff

One localStorage key, `ichava.locale`, carries the chosen language between the browser and the landing page on one origin.

```ts
import { loadSharedLocale, saveSharedLocale, subscribeSharedLocale } from '@ichava/js-ui-kernel';

const locale = loadSharedLocale();          // 'en' when unset, invalid or unreadable
saveSharedLocale('ar');                     // writes the key and notifies this document
const off = subscribeSharedLocale((l) => {}); // same-document changes; use the storage event for other tabs
```

Storage that throws (private mode, a sandboxed frame) degrades to the default locale; subscribers still hear about a save.

---

[← Docs index](../../README.md#documentation)
