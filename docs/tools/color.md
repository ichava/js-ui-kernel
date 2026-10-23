# Colour

Eight pure functions and one constant for hex parsing, WCAG contrast and readable accent text.

| Export | Use |
|---|---|
| `isValidHex(v)` | 3, 6 or 8 hex digits after `#` |
| `hexToRgba(hex, alpha)` | `rgba()`, falling back to `FALLBACK_ACCENT_RGB` for anything but a 6-digit hex |
| `hexWithAlpha(hex, pct)` | An 8-digit hex with a 0 to 100 alpha |
| `contrastRatio(a, b)` | WCAG 2.x ratio, 1 to 21; 1 for unparseable input |
| `mixHex(hex, t)` | Mix towards white (`t > 0`) or black (`t < 0`) |
| `compositeHex(fg, alpha, bg)` | A translucent colour as seen over an opaque one |
| `readableOn(hex, bg, target = 4.5)` | The least-adjusted variant of `hex` that clears `target` on `bg` |

```ts
import { readableOn } from '@ichava/js-ui-kernel';

readableOn('#7c3aed', '#0a0a0a'); // lightened until it clears 4.5:1 on the dark page
```

---

[← Docs index](../../README.md#documentation)
