import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FALLBACK_ACCENT_RGB, compositeHex, contrastRatio, readableOn } from '../src/color.js';
import {
  BRAND_RAMP,
  DEFAULT_ACCENT,
  DEFAULT_RADIUS,
  LANDING_SURFACES,
  PAGE_BG,
  SOFT_ALPHA,
  SURFACES,
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
 * in both themes. Those used Untitled UI's achromatic greys, so the parity check passes
 * them explicitly; the surfaces the kernel ships moved to the restyle's warm ramp on
 * 2026-11-01, and only the three brand text roles `themeVars` derives from them differ.
 */
const GREY_PAGE_BG = { light: '#ffffff', dark: '#0a0a0a' } as const;
const GREY_SURFACES = {
  light: ['#ffffff', '#fafafa', '#f5f5f5'],
  dark: ['#0a0a0a', '#171717', '#262626'],
} as const;
const TEXT_ROLES = ['--color-fg-brand-primary', '--color-text-brand-secondary', '--color-text-brand-tertiary'];
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
    const browserText = readableOn(accent, GREY_PAGE_BG[theme]);
    expect(browserText).toBe(row.browserAccentText);
    const vars = themeVars(accent, browserText, theme, 8);
    const rest = (v: Record<string, string>) => Object.fromEntries(Object.entries(v).filter(([k]) => !TEXT_ROLES.includes(k)));
    expect(rest(vars)).toEqual(rest(row.themeVars));
    for (const role of TEXT_ROLES) expect(vars[role]).toBe(brandText(accent, theme, { surfaces: SURFACES[theme] }));
    expect(brandText(accent, theme, { surfaces: GREY_SURFACES[theme] })).toBe(row.landingAccentText);
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
      brandText(DEFAULT_ACCENT, 'light', { surfaces: LANDING_SURFACES.light }),
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

// The accents the browser offers (react-icon-browser `config.ts` accentOptions), the
// default first.
const OFFERED = ['#0e7c66', '#2f54d6', '#c2410c', '#7c3aed', '#be185d'];

describe('defaults and the warm surfaces', () => {
  it('opens on lagoon teal at 6px', () => {
    expect(DEFAULT_ACCENT).toBe('#0e7c66');
    expect(DEFAULT_RADIUS).toBe(6);
  });

  it('names the warm ramp the UI packages ship, for the page and the landing alike', () => {
    expect(SURFACES).toEqual({
      light: ['#ffffff', '#f6f4ee', '#ece8de'],
      dark: ['#14120e', '#1f1c17', '#2f2b24'],
    });
    expect(LANDING_SURFACES).toBe(SURFACES);
    expect(PAGE_BG).toEqual({ light: SURFACES.light[0], dark: SURFACES.dark[0] });
  });

  it('needs a measured text variant: the raw teal fails on the warm frame', () => {
    expect(contrastRatio(DEFAULT_ACCENT, compositeHex(DEFAULT_ACCENT, SOFT_ALPHA.light, SURFACES.light[2]))).toBeLessThan(4.5);
  });

  it.each(OFFERED.flatMap((a) => THEMES.map((t) => [a, t] as const)))(
    'themeVars brand text for %s in %s clears AA on every surface and its tint',
    (accent, theme) => {
      const vars = themeVars(accent, accent, theme, DEFAULT_RADIUS);
      for (const role of TEXT_ROLES) {
        for (const bg of SURFACES[theme]) {
          expect(contrastRatio(vars[role]!, bg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(vars[role]!, compositeHex(accent, SOFT_ALPHA[theme], bg))).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );

  it.each(OFFERED.flatMap((a) => THEMES.map((t) => [a, t] as const)))(
    'the browser rule for %s in %s clears AA on the tint over the frame',
    (accent, theme) => {
      const text = brandText(accent, theme);
      expect(contrastRatio(text, compositeHex(accent, SOFT_ALPHA[theme], SURFACES[theme][2]))).toBeGreaterThanOrEqual(4.5);
    },
  );
});

describe('the malformed-accent fallback', () => {
  it('is the default accent, so an unparseable accent tints in the colour its text is drawn in', () => {
    const rgb = [1, 3, 5].map((i) => parseInt(DEFAULT_ACCENT.slice(i, i + 2), 16)).join(',');
    expect(FALLBACK_ACCENT_RGB).toBe(rgb);
  });
});
