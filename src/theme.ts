// Theme: the light/dark resolution and the accent-to-token derivation both Ichava UI
// surfaces apply, so one accent produces one token set on both. Pure apart from
// `systemTheme()`, which reads the media query. Moved from react-icon-browser's
// core/theme.ts and core/brandTokens.ts; the landing page's multi-surface accent text is
// `brandText(accent, theme, { surfaces: LANDING_SURFACES[theme] })`.

import { compositeHex, hexToRgba, isValidHex, mixHex, readableOn } from './color.js';

export type Theme = 'light' | 'dark';

/**
 * The default accent: lagoon teal, the 0.1.0 restyle's brand colour. Used when a picked
 * accent cannot be parsed, and as the default both UI packages open on.
 */
export const DEFAULT_ACCENT = '#0e7c66';

/** The default corner radius in px, the restyle's 6px. */
export const DEFAULT_RADIUS = 6;

/**
 * The attribute each surface's theme scope carries: tokens are declared on it rather
 * than on the host document. They must differ, or each package's rules would match the
 * other's root.
 */
export const THEME_SCOPES = {
  browser: '[data-ichava-theme]',
  landing: '[data-ichava-landing]',
} as const;

/**
 * A theme preference: an explicit `light` / `dark`, or `system` to follow the
 * operating system's `prefers-color-scheme`. The store itself only ever holds a
 * resolved `Theme`; `system` is resolved when a default is applied.
 */
export type ThemePreference = Theme | 'system';

/** The operating system's colour scheme, or `light` where it cannot be read (SSR, tests). */
export function systemTheme(): Theme {
  try {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** Resolve a preference to a concrete theme. Anything but `light`/`dark` follows the system. */
export function resolveTheme(pref: ThemePreference | null | undefined): Theme {
  return pref === 'light' || pref === 'dark' ? pref : systemTheme();
}

/**
 * The runtime theme variables a mount writes: the user's accent and radius, and the
 * Untitled UI tokens derived from them.
 *
 * Untitled UI styles every brand surface through `--color-brand-50..950` and a chain of
 * semantic tokens on top (`--color-bg-brand-solid`, `--background-color-brand-solid`, ...),
 * and every rounded corner through `--radius-xs..3xl`. The app used to write only its own
 * `--accent` and `--radius`, plus a handful of semantic brand tokens, so a primary Button,
 * a Checkbox or a Slider rendered Untitled UI's shipped purple whatever accent the user
 * picked, and ignored the radius slider entirely. Every PRO component uses the same
 * utilities, so each one adopted would have widened that gap.
 *
 * Pure, so the mapping is testable without a browser: `IchavaBrowser` applies the result
 * both to the component root and, in standalone mode, to `<html>`.
 */

/**
 * Where each step of the brand ramp sits relative to the accent: positive mixes towards
 * white, negative towards black, in sRGB. Step 600 IS the accent, because 600 is what
 * Untitled UI uses for a solid brand fill (`--color-bg-brand-solid`).
 */
export const BRAND_RAMP = {
  50: 0.92,
  100: 0.84,
  200: 0.68,
  300: 0.48,
  400: 0.28,
  500: 0.12,
  600: 0,
  700: -0.16,
  800: -0.32,
  900: -0.46,
  950: -0.62,
} as const;

/** `--color-brand-50..950` for an accent, or nothing when the accent does not parse. */
export function brandRamp(accent: string): Record<string, string> {
  if (!isValidHex(accent) || accent.length !== 7) return {};
  const out: Record<string, string> = {};
  for (const [step, t] of Object.entries(BRAND_RAMP)) out[`--color-brand-${step}`] = mixHex(accent, t);
  return out;
}

/**
 * Untitled UI's radius scale as multiples of the user's radius. At the default radius of
 * 8px these reproduce Untitled UI's own values exactly (xs 2px ... 3xl 24px), so the
 * default look does not move; the slider then scales every step together.
 */
export const RADIUS_SCALE = {
  xs: 0.25,
  sm: 0.5,
  DEFAULT: 0.5,
  md: 0.75,
  lg: 1,
  xl: 1.5,
  '2xl': 2,
  '3xl': 3,
} as const;

/** `--radius-xs..3xl` in px for a user radius in px. `none` and `full` are not scaled. */
export function radiusScale(radius: number): Record<string, string> {
  const r = Number.isFinite(radius) && radius > 0 ? radius : 0;
  const out: Record<string, string> = {};
  for (const [step, k] of Object.entries(RADIUS_SCALE)) out[`--radius-${step}`] = `${+(r * k).toFixed(2)}px`;
  return out;
}

/**
 * Every theme variable a mount writes for an accent, its readable text variant, a theme
 * and a radius. The keys are the contract shared by `rootStyle` and the `<html>` mirror.
 */
/**
 * The surfaces brand text and glyphs paint on, per theme, in the warm "paper and ink"
 * neutral ramp both UI packages ship (`styles/ichava-theme.css`): the sheet (`--bg`), the
 * muted fill (neutral 50 / 900) and the frame (`--canvas`, neutral 100 / 800). Each is
 * also measured with `--accent-soft` composited over it, since icons, eyebrows, badges
 * and selected rows paint on that tint. These were Untitled UI's achromatic greys until
 * the restyle; on the warmer frame the default teal measured 4.19:1 against them.
 */
export const SURFACES = {
  light: ['#ffffff', '#f6f4ee', '#ece8de'],
  dark: ['#14120e', '#1f1c17', '#2f2b24'],
} as const satisfies Record<Theme, readonly string[]>;

/**
 * The softest surface brand text sits on in each theme: the accent's own `--accent-soft`
 * tint over the darkest (light theme) or lightest (dark theme) surface a badge or a
 * selected row can land on. Measuring against the page background alone was not enough:
 * the detail dialog's pack badge is `text-brand-secondary` on `--accent-soft`, and the
 * page-background variant of `#7c3aed` measured 3.72:1 there in dark.
 */
const TINT_BASE = { light: SURFACES.light[2], dark: SURFACES.dark[2] } as const;

/** The opacity of `--accent-soft`, the accent's tint, per theme. */
export const SOFT_ALPHA = { light: 0.1, dark: 0.16 } as const;

/**
 * The surfaces the landing page paints accent text and glyphs on (`--bg`, `--surface`,
 * `--muted2`): the same warm ramp as `SURFACES`, kept under its own name for the
 * landing's callers.
 */
export const LANDING_SURFACES = SURFACES;

/** The page background each surface's text is first measured against. */
export const PAGE_BG = { light: SURFACES.light[0], dark: SURFACES.dark[0] } as const satisfies Record<Theme, string>;

export interface BrandTextOptions {
  /**
   * Surfaces the text must clear 4.5:1 on, each with and without the soft tint over it.
   * Omitted: the browser's rule, readable on the accent's tint over the softest surface.
   */
  readonly surfaces?: readonly string[];
}

/**
 * Brand TEXT colour for an accent in a theme.
 *
 * Without `surfaces` it is readable on the accent's soft tint (the browser's rule). With
 * `surfaces` it clears every listed surface and its tinted version (the landing's rule,
 * `LANDING_SURFACES`); an accent that does not parse falls back to the default accent.
 * `readableOn()` only ever moves one way per theme, so a later surface never undoes an
 * earlier one.
 */
export function brandText(accent: string, theme: Theme, options: BrandTextOptions = {}): string {
  if (!options.surfaces) {
    const tint = compositeHex(accent, SOFT_ALPHA[theme], TINT_BASE[theme]);
    return readableOn(accent, tint);
  }
  const hex = /^#[0-9a-f]{6}$/i.test(accent.trim()) ? accent.trim() : DEFAULT_ACCENT;
  let out = hex;
  for (const bg of options.surfaces) {
    out = readableOn(out, bg);
    out = readableOn(out, compositeHex(hex, SOFT_ALPHA[theme], bg));
  }
  return out;
}

export function themeVars(accent: string, accentText: string, theme: Theme, radius: number): Record<string, string> {
  const text = brandText(accent, theme, { surfaces: SURFACES[theme] });
  return {
    '--accent': accent,
    '--accent-text': accentText,
    '--accent-soft': hexToRgba(accent, theme === 'dark' ? 0.16 : 0.1),
    '--ring': hexToRgba(accent, 0.35),
    '--radius': `${radius}px`,
    ...brandRamp(accent),
    ...radiusScale(radius),
    // Fills keep the picked colour exactly: a solid fill is measured against the white
    // text ON it, not against the page.
    '--color-bg-brand-solid': accent,
    '--color-bg-brand-solid_hover': hexToRgba(accent, 0.88),
    '--color-bg-brand-primary': hexToRgba(accent, theme === 'dark' ? 0.16 : 0.1),
    '--color-border-brand': hexToRgba(accent, 0.5),
    // TEXT roles take the variant that clears AA on every surface in `SURFACES` and on the
    // accent's own tint over each (`brandText` with the surfaces), so a consumer needs no
    // override of its own. In light, Untitled UI points
    // text-brand-tertiary at step 600 -- the raw accent -- which fails for any light
    // accent; text-brand-primary (900) is dark enough to keep.
    '--color-fg-brand-primary': text,
    '--color-text-brand-secondary': text,
    '--color-text-brand-tertiary': text,
  };
}

/** The variable names `themeVars` writes, for removing them again on unmount. */
export const THEME_VAR_NAMES = Object.keys(themeVars('#000000', '#000000', 'light', 8));
