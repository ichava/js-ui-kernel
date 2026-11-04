# Catalog model

Nine types and two functions describe the icon catalog both UI packages render, mirroring the Laravel `IconResource` and its API envelope.

## Types

| Type | What it is |
|---|---|
| `RawIcon` | The snake_case wire shape the REST API serializes |
| `Icon` | The camelCase shape the UI works in |
| `IconPackage`, `Term`, `Filters` | Packages, categories and variants as the filters endpoint returns them |
| `PageMeta`, `PageResult`, `Envelope` | Pagination and the `{ success, data, message }` envelope |
| `ListParams` | The query every catalog source accepts |
| `Catalog` | A bundled static catalog |

## Functions

```ts
import { toIcon, svgHasOwnColors } from '@ichava/js-ui-kernel';

const icon = toIcon(raw);          // defaults: variant 'outline', viewBox '0 0 24 24'
svgHasOwnColors(icon.svgContent);  // true for flags and emoji, which render untouched
```

---

[← Docs index](../../README.md#documentation)
