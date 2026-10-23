import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { contrastRatio, readableOn } from '../src/color.js';
import {
  BRAND_RAMP,
  LANDING_SURFACES,
  PAGE_BG,
  RADIUS_SCALE,
  THEME_SCOPES,
  THEME_VAR_NAMES,
  brandRamp,
  brandText,
  radiusScale,
  resolveTheme,
  systemTheme,
  themeVars,
  type Theme,
} from '../src/theme.js';

// Moved from react-icon-browser's core/brandTokens.test.ts and core/theme.test.ts, plus
// the parity table that proves the move changed no output.

const ACCENTS = ['#7c3aed', '#2563eb', '#059669', '#e11d48', '#ea580c'];
const THEMES: readonly Theme[] = ['light', 'dark'];

type Row = { browserAccentText: string; themeVars: Record<string, string>; landingAccentText: string };
/**
 * Captured from the code this module replaces, at react-icon-browser and
 * react-landingpage `main` on 2026-10-23: the browser's `themeVars` (with its
 * page-background accent text) and the landing's `accentText`, for every shipped accent
 * in both themes.
 */
const PARITY = JSON.parse(readFileSync(new URL('./fixtures/theme-parity.json', import.meta.url), 'utf8')) as Record<
  string,
  Row
>;

describe('parity with the code it replaces', () => {
  it('covers every shipped accent in both themes', () => {
    expect(Object.keys(PARITY).sort()).toEqual(ACCENTS.flatMap((a) => THEMES.map((t) => `${a}/${t}`)).sort());
  });

  it.each(ACCENTS.flatMap((a) => THEMES.map((t) => [a, t] as const)))('%s in %s', (accent, theme) => {
    const row = PARITY[`${accent}/${theme}`]!;
    const browserText = readableOn(accent, PAGE_BG[theme]);
    expect(browserText).toBe(row.browserAccentText);
    expect(themeVars(accent, browserText, theme, 8)).toEqual(row.themeVars);
    expect(brandText(accent, theme, { surfaces: LANDING_SURFACES[theme] })).toBe(row.landingAccentText);
  });
});

describe('brandRamp', () => {
  const STEPS = Object.keys(BRAND_RAMP);

  it('covers every step Untitled UI defines, with the accent at 600', () => {
    expect(STEPS).toEqual(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);
    expect(brandRamp('#2563eb')['--color-brand-600']).toBe('#2563eb');
  });

  it('runs from light to dark', () => {
    const ramp = brandRamp('#7c3aed');
    const vs = STEPS.map((s) => contrastRatio(ramp[`--color-brand-${s}`]!, '#ffffff'));
    for (let i = 1; i < vs.length; i++) expect(vs[i]!).toBeGreaterThan(vs[i - 1]!);
  });

  it('writes nothing for an accent that does not parse', () => {
    expect(brandRamp('nope')).toEqual({});
    expect(brandRamp('#abc')).toEqual({});
  });
});

describe('radiusScale', () => {
  it('reproduces Untitled UI at the default radius of 8px', () => {
    expect(radiusScale(8)).toEqual({
      '--radius-xs': '2px',
      '--radius-sm': '4px',
      '--radius-DEFAULT': '4px',
      '--radius-md': '6px',
      '--radius-lg': '8px',
      '--radius-xl': '12px',
      '--radius-2xl': '16px',
      '--radius-3xl': '24px',
    });
    expect(Object.keys(radiusScale(4))).toHaveLength(Object.keys(RADIUS_SCALE).length);
  });
});

describe('brandText', () => {
  it.each(ACCENTS)('%s clears AA on every landing surface in both themes', (accent) => {
    for (const theme of THEMES) {
      const text = brandText(accent, theme, { surfaces: LANDING_SURFACES[theme] });
      for (const bg of LANDING_SURFACES[theme]) expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('falls back to the default accent when the landing rule gets an unparseable one', () => {
    expect(brandText('nope', 'light', { surfaces: LANDING_SURFACES.light })).toBe(
      brandText('#7c3aed', 'light', { surfaces: LANDING_SURFACES.light }),
    );
  });

  it('names every variable themeVars can write', () => {
    expect([...THEME_VAR_NAMES].sort()).toEqual(Object.keys(themeVars('#7c3aed', '#7c3aed', 'dark', 10)).sort());
  });
});

describe('theme resolution', () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubScheme = (dark: boolean) =>
    vi.stubGlobal('window', { matchMedia: (q: string) => ({ matches: dark && q.includes('dark') }) });

  it('follows the system when asked, and keeps an explicit choice', () => {
    stubScheme(true);
    expect(systemTheme()).toBe('dark');
    expect(resolveTheme('system')).toBe('dark');
    expect(resolveTheme(null)).toBe('dark');
    expect(resolveTheme('light')).toBe('light');
  });

  it('is light where the media query cannot be read', () => {
    vi.stubGlobal('window', undefined);
    expect(systemTheme()).toBe('light');
  });

  it('gives the two surfaces different scopes', () => {
    expect(THEME_SCOPES.browser).not.toBe(THEME_SCOPES.landing);
  });
});
