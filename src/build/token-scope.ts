// Custom properties a stylesheet declares on the document (FINDINGS N1).
//
// Tailwind emits its theme as `:root, :host { --color-...: ... }`, Untitled UI's dark
// tokens sit on a bare `.dark-mode`, and the app's own tokens were on `:root`. In a host
// those selectors match the HOST's <html>, so a second package built the same way --
// @ichava/react-landingpage is one -- overwrites this one's tokens, or this one
// overwrites its, depending only on which stylesheet loads last.
//
// `globalTokenRules` is the guard: every rule that declares a custom property on
// :root, :host, html, body or an unqualified `.dark-mode`. `scopeTokens` is the repair
// the library build applies: the same rules, re-targeted at `[data-ichava-theme]`,
// which the component root and its overlay container carry (and, standalone, <html>).
//
// Each package passes its own scope (`THEME_SCOPES` in the kernel's theme module): they
// must differ, or each package's rules would match the other's root. Shared by every
// package's vite configs and its library-build check, so the repair and the guard read
// selectors the same way. Moved from react-icon-browser's scripts/token-scope.mjs, of
// which react-landingpage kept a copy differing only in the scope.

/** A selector item that names the document rather than an element of ours. */
const DOCUMENT = /^(:root|:host|html|body)(?![\w-])/;
/** Untitled UI's dark-mode class with nothing qualifying it. */
const BARE_DARK = /^\.dark-mode(?![\w-])/;

const RULE = /([^{}]+)\{([^{}]*)\}/g;
const DECLARES_PROPERTY = /(^|[;\s])--[\w-]+\s*:/;

function items(selector: string): string[] {
  return selector
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAtRulePrelude(selector: string): boolean {
  return selector.trim().startsWith('@');
}

/** Rules declaring a custom property on the document: the offending selectors. */
export function globalTokenRules(css: string): string[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out: string[] = [];
  for (const [, selector = '', body = ''] of clean.matchAll(RULE)) {
    if (isAtRulePrelude(selector) || !DECLARES_PROPERTY.test(body)) continue;
    if (items(selector).some((s) => DOCUMENT.test(s) || BARE_DARK.test(s))) out.push(selector.trim());
  }
  return out;
}

/**
 * Re-target every document-level custom-property rule at `scope`.
 *
 * `:root` and `[data-ichava-theme]` have the same specificity (0,1,0), so the cascade
 * between this sheet's own rules is unchanged; `.dark-mode` becomes
 * `[scope].dark-mode`, which still outranks the light rules it used to beat. `scope` is
 * an attribute selector, e.g. `[data-ichava-theme]`.
 */
export function scopeTokens(css: string, scope: string): string {
  return css.replace(RULE, (whole: string, selector: string, body: string) => {
    if (isAtRulePrelude(selector) || !DECLARES_PROPERTY.test(body)) return whole;
    const list = items(selector);
    if (!list.some((s) => DOCUMENT.test(s) || BARE_DARK.test(s))) return whole;
    const lead = /^\s*/.exec(selector)?.[0] ?? '';
    const mapped = list.map((s) => {
      if (DOCUMENT.test(s)) return s.replace(DOCUMENT, scope);
      if (BARE_DARK.test(s)) return `${scope}${s}`;
      return s;
    });
    return `${lead}${[...new Set(mapped)].join(',')}{${body}}`;
  });
}

/** The subset of a Vite/Rollup output chunk this plugin reads. */
interface BundleEntry {
  type: string;
  fileName: string;
  source?: string | Uint8Array;
}

/** A Vite plugin, typed structurally so the kernel needs no Vite dependency. */
export interface ScopeThemeTokensPlugin {
  name: string;
  enforce: 'post';
  generateBundle(options: unknown, bundle: Record<string, BundleEntry>): void;
}

/**
 * Vite plugin: scope a package's tokens in every emitted stylesheet (FINDINGS N1).
 * Runs on the bundle rather than the source, because Tailwind writes `:root, :host`
 * for `@theme` whatever the source says. Build only: the dev server serves the unscoped
 * sheet, where every scope still inherits from :root.
 */
export function scopeThemeTokens(scope: string): ScopeThemeTokensPlugin {
  return {
    name: 'ichava:scope-theme-tokens',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const out of Object.values(bundle)) {
        if (out.type !== 'asset' || !out.fileName.endsWith('.css')) continue;
        out.source = scopeTokens(String(out.source), scope);
      }
    },
  };
}
