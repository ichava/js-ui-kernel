import { describe, expect, it } from 'vitest';

import {
  FALLBACK_ACCENT_RGB,
  compositeHex,
  contrastRatio,
  hexToRgba,
  hexWithAlpha,
  isValidHex,
  mixHex,
  readableOn,
} from '../src/color.js';

// Moved from react-icon-browser's core/format.test.ts and core/contrast.test.ts.

const ACCENTS = ['#7c3aed', '#2563eb', '#059669', '#e11d48', '#ea580c'];
const LIGHT_BG = '#ffffff';
const DARK_BG = '#0a0a0a';
const AA_BODY = 4.5;

describe('hex helpers', () => {
  it('validates hex', () => {
    expect(isValidHex('#7c3aed')).toBe(true);
    expect(isValidHex('#abc')).toBe(true);
    expect(isValidHex('#12345678')).toBe(true);
    expect(isValidHex('nope')).toBe(false);
  });

  it('appends an 0-100 alpha as an 8-digit hex', () => {
    expect(hexWithAlpha('#7c3aed', 100)).toBe('#7c3aedff');
    expect(hexWithAlpha('#7c3aed', 0)).toBe('#7c3aed00');
    expect(hexWithAlpha('#7c3aed', 50)).toBe('#7c3aed80');
  });

  it('converts hex to rgba at a given alpha, tolerating whitespace and case', () => {
    expect(hexToRgba('#7c3aed', 1)).toBe('rgba(124,58,237,1)');
    expect(hexToRgba('#000000', 0.5)).toBe('rgba(0,0,0,0.5)');
    expect(hexToRgba('  #7C3AED  ', 0.35)).toBe('rgba(124,58,237,0.35)');
  });

  it('falls back to the brand accent for anything that is not a 6-digit hex', () => {
    for (const bad of ['', 'nope', '#abc', '#12345678', 'rgb(1,2,3)']) {
      expect(hexToRgba(bad, 0.16)).toBe(`rgba(${FALLBACK_ACCENT_RGB},0.16)`);
    }
  });

  it('mixes towards white and black, and leaves an unparseable hex alone', () => {
    expect(mixHex('#7c3aed', 1)).toBe('#ffffff');
    expect(mixHex('#7c3aed', -1)).toBe('#000000');
    expect(mixHex('#7c3aed', 0)).toBe('#7c3aed');
    expect(mixHex('nope', 0.5)).toBe('nope');
  });

  it('composites a translucent colour over an opaque one', () => {
    expect(compositeHex('#ffffff', 0.5, '#000000')).toBe('#808080');
    expect(compositeHex('#7c3aed', 1, '#000000')).toBe('#7c3aed');
    expect(compositeHex('nope', 0.5, '#000000')).toBe('#000000');
  });
});

describe('contrastRatio', () => {
  it('matches known WCAG values, in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 3);
    expect(contrastRatio('#7c3aed', DARK_BG)).toBeCloseTo(contrastRatio(DARK_BG, '#7c3aed'), 6);
  });

  it('reproduces the failure the live audit found', () => {
    expect(contrastRatio('#7c3aed', DARK_BG)).toBeLessThan(AA_BODY);
  });

  it('returns 1 for unparseable input rather than throwing', () => {
    expect(contrastRatio('not-a-colour', '#fff')).toBe(1);
  });
});

describe('readableOn', () => {
  it.each(ACCENTS)('%s clears AA on both backgrounds', (accent) => {
    expect(contrastRatio(readableOn(accent, DARK_BG), DARK_BG)).toBeGreaterThanOrEqual(AA_BODY);
    expect(contrastRatio(readableOn(accent, LIGHT_BG), LIGHT_BG)).toBeGreaterThanOrEqual(AA_BODY);
  });

  it('returns a colour that already passes unchanged', () => {
    expect(readableOn('#000000', LIGHT_BG)).toBe('#000000');
  });

  it('returns an unparseable colour unchanged', () => {
    expect(readableOn('nope', DARK_BG)).toBe('nope');
  });
});
