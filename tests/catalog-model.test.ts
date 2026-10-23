import { describe, expect, it } from 'vitest';

import { svgHasOwnColors, toIcon, type RawIcon } from '../src/catalog-model.js';

describe('toIcon', () => {
  const raw: RawIcon = { id: 7, package: 'ichava/icon-sets-tabler', name: 'home', category: 'buildings', variant: 'outline' };

  it('maps the wire shape and fills the defaults', () => {
    expect(toIcon(raw)).toEqual({
      id: 7,
      package: 'ichava/icon-sets-tabler',
      name: 'home',
      category: 'buildings',
      sub: undefined,
      variant: 'outline',
      kind: 'icon',
      svgContent: null,
      svgUrl: null,
      viewBox: '0 0 24 24',
      bladeClean: '',
      bladeGeneric: '',
      helper: '',
      tags: [],
      keywords: [],
      ownColor: false,
    });
  });

  it('flags own-colour SVGs and not monochrome ones', () => {
    expect(svgHasOwnColors('<svg><path fill="#ff0000"/></svg>')).toBe(true);
    expect(svgHasOwnColors('<svg><path fill="currentColor" stroke="none"/></svg>')).toBe(false);
    expect(toIcon({ ...raw, svg_content: '<svg><rect fill="#00f"/></svg>' }).ownColor).toBe(true);
  });
});
