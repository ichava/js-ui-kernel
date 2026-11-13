#!/usr/bin/env node
// Fails on a link to a documentation-portal path that does not exist (A6-gaps G14).
//
// The documentation portal's /documentation/ichava/... and /products/ichava/... paths
// answer 404: it has no Ichava pages yet. Until it does, links point at the
// repository's GitHub docs/ folder. This walks every tracked text file and fails on the
// dead prefix, on either host name (oss.simtabi.com is an alias).
//
// CHANGELOG.md is exempt: it records what was true when each entry was written.
//
// It also resolves every relative link in a tracked Markdown file (`[text](docs/x.md#y)`) against
// that file's directory and fails when the target is not on disk: docs/architecture.md once
// linked docs/host-integration.md from inside docs/, which resolves to docs/docs/.
//
// The file walk asserts a floor on what it read, and the pattern is first run against a
// planted sample, so a walk that found nothing or a pattern that stopped matching fails
// here instead of passing everything.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DEAD = /https?:\/\/(?:opensource|oss)\.simtabi\.com\/(?:documentation|products)\/ichava\b/;
const EXEMPT = new Set(['CHANGELOG.md']);
const TEXT = /\.(?:[cm]?[jt]sx?|json|md|html|css|ya?ml|txt)$/;
const FLOOR = 20;

// Assembled from parts, so this file does not contain the prefix it forbids.
const planted = [
  'href="https://opensource.simtabi.com/' + 'documentation/ichava/icon-browser/"',
  'https://oss.simtabi.com/' + 'products/ichava/icon-browser',
];
const missed = planted.filter((s) => !DEAD.test(s));
if (DEAD.test('https://github.com/ichava/icon-browser/tree/main/docs')) missed.push('(matched a live link)');
if (missed.length) {
  console.error(`check-dead-links: self-test failed on ${missed.join(', ')}`);
  process.exit(1);
}

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && TEXT.test(f) && !EXEMPT.has(f));
if (files.length < FLOOR) {
  console.error(`check-dead-links: read ${files.length} files, expected at least ${FLOOR}`);
  process.exit(1);
}

// A relative Markdown link target: not a URL, not an in-page anchor, not an absolute path.
const RELATIVE_LINK = /\]\((?![a-z][a-z0-9+.-]*:|#|\/)([^)\s#]+)(?:#[^)\s]*)?\)/gi;
if ([...'[a](docs/x.md#y) [b](https://e.test) [c](#z)'.matchAll(RELATIVE_LINK)].map((m) => m[1]).join() !== 'docs/x.md') {
  console.error('check-dead-links: self-test failed on the relative-link pattern');
  process.exit(1);
}

const hits = [];
let relative = 0;
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (DEAD.test(line)) hits.push(`${file}:${i + 1}: ${line.trim().slice(0, 160)}`);
    if (!file.endsWith('.md')) return;
    for (const m of line.matchAll(RELATIVE_LINK)) {
      relative++;
      const target = join(dirname(file), decodeURIComponent(m[1]));
      if (!existsSync(target)) hits.push(`${file}:${i + 1}: relative link ${m[1]} resolves to ${target}, which does not exist`);
    }
  });
}
if (hits.length) {
  for (const h of hits) console.error(`check-dead-links: ${h}`);
  console.error(
    'check-dead-links: FAILED. The portal has no Ichava pages yet; link the GitHub docs/ folder ' +
      '(https://github.com/ichava/<repo>/tree/main/docs) instead, and point each relative link at a file that exists.',
  );
  process.exit(1);
}
console.log(`check-dead-links: ok -- ${files.length} tracked files, no dead portal links, ${relative} relative Markdown links resolve`);
