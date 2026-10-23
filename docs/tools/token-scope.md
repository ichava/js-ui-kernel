# Token scope

The build step that keeps each package's CSS custom properties off the host document, at `@ichava/js-ui-kernel/build`.

Tailwind writes its theme as `:root, :host { ... }` and Untitled UI's dark tokens sit on a bare `.dark-mode`. In a host page those match the host's `<html>`, so two packages built the same way overwrite each other's tokens in load order.

| Export | Use |
|---|---|
| `globalTokenRules(css)` | The selectors that declare a custom property on `:root`, `:host`, `html`, `body` or a bare `.dark-mode`. A library-build check fails on any |
| `scopeTokens(css, scope)` | The same CSS with those rules re-targeted at `scope` |
| `scopeThemeTokens(scope)` | A Vite plugin applying `scopeTokens` to every emitted stylesheet |

```ts
// vite.lib.config.ts
import { scopeThemeTokens } from '@ichava/js-ui-kernel/build';
import { THEME_SCOPES } from '@ichava/js-ui-kernel';

export default { plugins: [scopeThemeTokens(THEME_SCOPES.landing)] };
```

The plugin is typed structurally, so the kernel needs no Vite dependency.

---

[← Docs index](../../README.md#documentation)
