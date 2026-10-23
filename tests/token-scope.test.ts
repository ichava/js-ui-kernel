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
