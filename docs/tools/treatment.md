# Treatment

One vocabulary for the five icon treatments, with the landing page's older ids mapped onto it.

| Canonical | Landing id |
|---|---|
| `default` | `stroke` |
| `solid` | `solid` |
| `duotone` | `dual` |
| `midtone` | `midtone` |
| `halftone` | `halftone` |

The canonical ids are the browser's, because they are what users have persisted.

```ts
import { toTreatment } from '@ichava/js-ui-kernel';

toTreatment('dual');   // 'duotone'
toTreatment('nope');   // undefined
```

---

[← Docs index](../../README.md#documentation)
