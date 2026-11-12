import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The size ceiling stated in docs/architecture.md, for the whole kernel: every `.ts` file under
 * `src/`, tests excluded, counted the way `wc -l` counts (newline characters). Measured at 1,014
 * lines on 2026-11-02. Raise it only together with the sentence in docs/architecture.md, and only
 * for code that every consumer shares.
 */
const KERNEL_LINE_CEILING = 1100;

/** Fewer files than this means the walk stopped matching, not that the kernel shrank. */
const MIN_FILES = 5;

const SRC = fileURLToPath(new URL('../src', import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    // src/react/ is the opt-in React subpath, with its own ceiling below: not every consumer
    // shares it, so it does not count against the kernel's.
    if (entry.isDirectory()) return entry.name === 'react' && dir === SRC ? [] : sourceFiles(path);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

const lineCount = (text: string): number => (text.match(/\n/g) ?? []).length;

/** The opt-in React subpath's own ceiling, stated in docs/architecture.md (measured 1,463). */
const REACT_LINE_CEILING = 1550;
const REACT = fileURLToPath(new URL('../src/react', import.meta.url));

function reactFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return reactFiles(path);
    return /\.(ts|tsx|css)$/.test(entry.name) ? [path] : [];
  });
}

describe('react subpath size', () => {
  const files = reactFiles(REACT);

  it('reads the subpath', () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  it(`stays at or under ${REACT_LINE_CEILING} lines`, () => {
    const total = files.reduce((sum, path) => sum + lineCount(readFileSync(path, 'utf8')), 0);
    expect(total, `src/react holds ${total} lines across ${files.length} files`).toBeLessThanOrEqual(REACT_LINE_CEILING);
  });

  it('matches the ceiling stated in docs/architecture.md', () => {
    const doc = readFileSync(fileURLToPath(new URL('../docs/architecture.md', import.meta.url)), 'utf8');
    expect(doc).toContain(`${REACT_LINE_CEILING.toLocaleString('en-US')} lines`);
  });
});

describe('kernel size', () => {
  const files = sourceFiles(SRC);

  it('reads the source tree', () => {
    expect(files.length).toBeGreaterThanOrEqual(MIN_FILES);
  });

  it(`stays at or under ${KERNEL_LINE_CEILING} lines`, () => {
    const total = files.reduce((sum, path) => sum + lineCount(readFileSync(path, 'utf8')), 0);
    expect(total).toBeGreaterThan(0);
    expect(total, `src/ holds ${total} lines across ${files.length} files`).toBeLessThanOrEqual(
      KERNEL_LINE_CEILING,
    );
  });

  it('matches the ceiling stated in docs/architecture.md', () => {
    const doc = readFileSync(fileURLToPath(new URL('../docs/architecture.md', import.meta.url)), 'utf8');
    const stated = KERNEL_LINE_CEILING.toLocaleString('en-US');
    expect(doc).toContain(`${stated} lines`);
  });
});
