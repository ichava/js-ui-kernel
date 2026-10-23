# Theme

The accent-to-token derivation and theme resolution both surfaces apply, so one accent produces one token set everywhere.

## Resolution

`resolveTheme(pref)` returns `light` or `dark`; anything else (`system`, null) follows `systemTheme()`, which reads `prefers-color-scheme` and answers `light` where it cannot.

## Tokens

`themeVars(accent, accentText, theme, radius)` returns every CSS variable a mount writes: the accent, its soft tint and ring, the Untitled UI brand ramp (`brandRamp`), the radius scale (`radiusScale`) and the brand text roles. `THEME_VAR_NAMES` lists them for removal on unmount.

`brandText(accent, theme, options?)` is the brand text colour:

```ts
import { brandText, LANDING_SURFACES, PAGE_BG, readableOn, themeVars } from '@ichava/js-ui-kernel';

brandText('#7c3aed', 'dark');                                         // the browser's rule
brandText('#7c3aed', 'dark', { surfaces: LANDING_SURFACES.dark });   // the landing's rule
themeVars('#7c3aed', readableOn('#7c3aed', PAGE_BG.dark), 'dark', 8);
```

## Scopes

`THEME_SCOPES.browser` (`[data-ichava-theme]`) and `THEME_SCOPES.landing` (`[data-ichava-landing]`) are the attributes each package declares its tokens on. They must differ; see [Token scope](token-scope.md).

---

[← Docs index](../../README.md#documentation)
