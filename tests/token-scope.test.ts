import { describe, expect, it } from 'vitest';

import { globalTokenRules, scopeThemeTokens, scopeTokens } from '../src/build/token-scope.js';
import { THEME_SCOPES } from '../src/theme.js';

const CSS = [
  ':root, :host { --color-brand-600: #7c3aed; }',
  '.dark-mode { --color-bg: #000; }',
  'html { --x: 1; }',
  '.btn { --local: 1; color: red; }',
  'body { margin: 0; }',
  '@media (min-width: 1px) { .a { color: red; } }',
].join('\n');

describe('globalTokenRules', () => {
  it('finds every custom property declared on the document, and nothing else', () => {
    expect(globalTokenRules(CSS)).toEqual([':root, :host', '.dark-mode', 'html']);
  });
});

describe('scopeTokens', () => {
  it('re-targets document-level token rules at the scope and leaves the rest', () => {
    const out = scopeTokens(CSS, THEME_SCOPES.landing);
    expect(globalTokenRules(out)).toEqual([]);
    expect(out).toContain('[data-ichava-landing]{ --color-brand-600: #7c3aed; }');
    expect(out).toContain('[data-ichava-landing].dark-mode{ --color-bg: #000; }');
    expect(out).toContain('.btn { --local: 1; color: red; }');
    expect(out).toContain('body { margin: 0; }');
  });
});

describe('scopeThemeTokens', () => {
  it('scopes emitted stylesheets only', () => {
    const bundle = {
      'a.css': { type: 'asset', fileName: 'a.css', source: ':root { --x: 1; }' },
      'b.js': { type: 'chunk', fileName: 'b.js' },
    };
    scopeThemeTokens(THEME_SCOPES.browser).generateBundle({}, bundle);
    expect(bundle['a.css'].source).toBe('[data-ichava-theme]{ --x: 1; }');
    expect(bundle['b.js']).toEqual({ type: 'chunk', fileName: 'b.js' });
  });
});

describe('linear time on hostile input (CodeQL js/polynomial-redos)', () => {
  const hostile = ['z'.repeat(60_000), `/*${'a/*'.repeat(30_000)}`, `${'a{'.repeat(30_000)}`, `x${'}'.repeat(60_000)}`];

  it.each(hostile.map((css, i) => [i, css] as const))('input %i is scanned quickly', (_i, css) => {
    const start = performance.now();
    globalTokenRules(css);
    scopeTokens(css, THEME_SCOPES.browser);
    expect(performance.now() - start).toBeLessThan(250);
  });
});

describe('the one-pass scanner matches the regexes it replaced', () => {
  // The previous implementation, kept as the reference. Fine on short input.
  const RULE = /([^{}]+)\{([^{}]*)\}/g;
  const DOCUMENT = /^(:root|:host|html|body)(?![\w-])/;
  const BARE_DARK = /^\.dark-mode(?![\w-])/;
  const DECLARES = /(^|[;\s])--[\w-]+\s*:/;
  const items = (sel: string) => sel.split(',').map((s) => s.trim()).filter(Boolean);
  const refRules = (css: string) => {
    const out: string[] = [];
    for (const [, sel = '', body = ''] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(RULE)) {
      if (sel.trim().startsWith('@') || !DECLARES.test(body)) continue;
      if (items(sel).some((s) => DOCUMENT.test(s) || BARE_DARK.test(s))) out.push(sel.trim());
    }
    return out;
  };
  const refScope = (css: string, scope: string) =>
    css.replace(RULE, (whole: string, sel: string, body: string) => {
      if (sel.trim().startsWith('@') || !DECLARES.test(body)) return whole;
      const list = items(sel);
      if (!list.some((s) => DOCUMENT.test(s) || BARE_DARK.test(s))) return whole;
      const lead = /^\s*/.exec(sel)?.[0] ?? '';
      const mapped = list.map((s) => (DOCUMENT.test(s) ? s.replace(DOCUMENT, scope) : BARE_DARK.test(s) ? `${scope}${s}` : s));
      return `${lead}${[...new Set(mapped)].join(',')}{${body}}`;
    });

  it('on 50,000 random fragments', () => {
    // Weighted towards what changes the output: document selectors next to braces,
    // custom properties, nesting and comments.
    const pieces = ['{', '}', '/*', '*/', ':root', ':root{', 'html,', '.dark-mode{', ' --x:1;', '--y: 2}', '@media x{', 'a{', 'b ', ';', ',', '\n'];
    // mulberry32: seeded, so a failure reproduces. (A plain LCG's low bits cycle with a
    // short period, which made an earlier version of this test draw the same few inputs.)
    let seed = 7;
    const rand = (n: number) => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return (((t ^ (t >>> 14)) >>> 0) % n);
    };
    for (let i = 0; i < 50_000; i++) {
      let css = '';
      for (let j = rand(16); j > 0; j--) css += pieces[rand(pieces.length)];
      expect(globalTokenRules(css), css).toEqual(refRules(css));
      expect(scopeTokens(css, '[s]'), css).toBe(refScope(css, '[s]'));
    }
  });
});
