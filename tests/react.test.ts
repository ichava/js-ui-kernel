import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as react from '../src/react/index.ts';

/**
 * `@ichava/js-ui-kernel/react`: each export the landing and the icon browser import resolves to
 * a real value, and the package map points at files the build writes. The list is the subpath's
 * public surface; adding or removing an export is a change to this test on purpose.
 */
const EXPORTS = [
  'AvatarCount',
  'AvatarOnlineIndicator',
  'FeaturedIcon',
  'RadioButton',
  'RadioButtonBase',
  'RadioGroup',
  'Toggle',
  'ToggleBase',
  'VerifiedTick',
  'cx',
  'isClassComponent',
  'isForwardRefComponent',
  'isFunctionComponent',
  'isReactComponent',
  'sortCx',
];

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as {
  exports: Record<string, string | Record<string, string>>;
  peerDependenciesMeta: Record<string, { optional?: boolean }>;
  sideEffects: unknown;
};

describe('react subpath', () => {
  it('exports exactly the shared surface, each a function', () => {
    expect(Object.keys(react).sort()).toEqual(EXPORTS);
    for (const name of EXPORTS) expect(typeof (react as Record<string, unknown>)[name], name).toBe('function');
  });

  it('merges Tailwind classes the way both apps rely on', () => {
    expect(react.cx('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
    expect(react.cx('text-display-xs', 'text-sm')).toBe('text-sm');
  });

  it('maps ./react and its stylesheet to source files the build emits from', () => {
    const entry = pkg.exports['./react'] as Record<string, string>;
    expect(entry).toEqual({ types: './dist/react/index.d.ts', import: './dist/react/index.js' });
    expect(pkg.exports['./react/uui-theme.css']).toBe('./dist/react/styles/uui-theme.css');
    expect(existsSync(fileURLToPath(new URL('src/react/styles/uui-theme.css', root)))).toBe(true);
    expect(existsSync(fileURLToPath(new URL('src/react/LICENSE-untitledui', root)))).toBe(true);
  });

  it('keeps React and its companions optional, and marks only the stylesheet as a side effect', () => {
    for (const peer of ['react', 'react-aria-components', 'tailwind-merge']) {
      expect(pkg.peerDependenciesMeta[peer]?.optional, peer).toBe(true);
    }
    expect(pkg.sideEffects).toEqual(['*.css']);
  });

  it("keeps the kernel's own entry points free of React", () => {
    const core = readFileSync(fileURLToPath(new URL('src/index.ts', root)), 'utf8');
    expect(core).not.toMatch(/from ['"](react|\.\/react)/);
  });
});
