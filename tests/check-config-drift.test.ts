import { describe, expect, it } from 'vitest';
// @ts-expect-error -- a plain .mjs script with no declaration file; it is copied, not imported, by consumers.
import { checkDrift, parsePairs, DEFAULT_RAW } from '../config/check-config-drift.mjs';

type Reply = { status: number; body: string };

/** A fetch stand-in serving canonical files by URL, recording what was asked for. */
function fakeFetch(files: Record<string, Reply>) {
  const asked: string[] = [];
  const impl = async (url: string) => {
    asked.push(url);
    const reply = files[url] ?? { status: 404, body: '404: Not Found' };
    return {
      status: reply.status,
      arrayBuffer: async () => new TextEncoder().encode(reply.body).buffer,
    };
  };
  return { impl, asked };
}

const local = (files: Record<string, string>) => async (path: string) => {
  const text = files[path];
  if (text === undefined) throw new Error(`ENOENT: ${path}`);
  return Buffer.from(text);
};

const BASE = '{ "compilerOptions": { "strict": true } }\n';
const url = (path: string, ref = 'main') => `${DEFAULT_RAW}/${ref}/${path}`;

describe('parsePairs', () => {
  it('splits local=canonical', () => {
    expect(parsePairs(['tsconfig.base.json=config/tsconfig.base.json'])).toEqual([
      { local: 'tsconfig.base.json', canonical: 'config/tsconfig.base.json' },
    ]);
  });

  it.each(['tsconfig.base.json', '=config/x', 'x='])('rejects "%s"', (arg) => {
    expect(() => parsePairs([arg])).toThrow(/expected <local>=<canonical>/);
  });
});

describe('checkDrift', () => {
  const pairs = [{ local: 'tsconfig.base.json', canonical: 'config/tsconfig.base.json' }];

  it('passes when the copy is byte-identical, and counts what it compared', async () => {
    const { impl, asked } = fakeFetch({ [url('config/tsconfig.base.json')]: { status: 200, body: BASE } });
    const result = await checkDrift({ pairs, fetchImpl: impl, readImpl: local({ 'tsconfig.base.json': BASE }) });
    expect(result).toEqual({ checked: 1, failures: [] });
    expect(asked).toEqual([url('config/tsconfig.base.json')]);
  });

  it('fails on a one-byte change', async () => {
    const { impl } = fakeFetch({ [url('config/tsconfig.base.json')]: { status: 200, body: BASE } });
    const drifted = BASE.replace('true', 'false');
    const result = await checkDrift({ pairs, fetchImpl: impl, readImpl: local({ 'tsconfig.base.json': drifted }) });
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toMatch(/differs from config\/tsconfig\.base\.json at main/);
  });

  it('fails on a trailing-newline difference, which a text comparison could normalise away', async () => {
    const { impl } = fakeFetch({ [url('config/tsconfig.base.json')]: { status: 200, body: BASE } });
    const result = await checkDrift({
      pairs,
      fetchImpl: impl,
      readImpl: local({ 'tsconfig.base.json': BASE.trimEnd() }),
    });
    expect(result.failures).toHaveLength(1);
  });

  it('fails on a non-200 answer rather than treating it as a match', async () => {
    const { impl } = fakeFetch({});
    const result = await checkDrift({ pairs, fetchImpl: impl, readImpl: local({ 'tsconfig.base.json': BASE }) });
    expect(result.checked).toBe(0);
    expect(result.failures[0]).toMatch(/answered 404, expected 200/);
  });

  it('fails on an empty body, even when the local copy is empty too', async () => {
    const { impl } = fakeFetch({ [url('config/tsconfig.base.json')]: { status: 200, body: '' } });
    const result = await checkDrift({ pairs, fetchImpl: impl, readImpl: local({ 'tsconfig.base.json': '' }) });
    expect(result.checked).toBe(0);
    expect(result.failures[0]).toMatch(/empty body/);
  });

  it('fails when the local copy is missing', async () => {
    const { impl } = fakeFetch({ [url('config/tsconfig.base.json')]: { status: 200, body: BASE } });
    const result = await checkDrift({ pairs, fetchImpl: impl, readImpl: local({}) });
    expect(result.failures[0]).toMatch(/cannot read the local copy/);
  });

  it('fails when the network call throws', async () => {
    const result = await checkDrift({
      pairs,
      fetchImpl: async () => {
        throw new Error('getaddrinfo ENOTFOUND');
      },
      readImpl: local({ 'tsconfig.base.json': BASE }),
    });
    expect(result.failures[0]).toMatch(/cannot fetch .*ENOTFOUND/);
  });

  it('fails on an empty pair list, so it cannot pass by comparing nothing', async () => {
    const result = await checkDrift({ pairs: [], fetchImpl: fakeFetch({}).impl, readImpl: local({}) });
    expect(result).toEqual({
      checked: 0,
      failures: ['no files to compare: pass at least one <local>=<canonical> pair'],
    });
  });

  it('reads the canonical at the ref it is given', async () => {
    const { impl, asked } = fakeFetch({ [url('config/tsconfig.base.json', 'v0.1.0')]: { status: 200, body: BASE } });
    const result = await checkDrift({
      pairs,
      ref: 'v0.1.0',
      fetchImpl: impl,
      readImpl: local({ 'tsconfig.base.json': BASE }),
    });
    expect(result.failures).toEqual([]);
    expect(asked).toEqual([url('config/tsconfig.base.json', 'v0.1.0')]);
  });
});
