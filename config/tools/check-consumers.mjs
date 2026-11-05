#!/usr/bin/env node
// Every place this package is used must carry its latest release before another one is cut.
//
//   node scripts/check-consumers.mjs              compare against the newest vX.Y.Z tag
//   node scripts/check-consumers.mjs --version X  compare against X instead
//   node scripts/check-consumers.mjs --self-test  prove the comparison can fail
//
// The consumers and the command that updates each are listed in scripts/consumers.json. A
// consumer's version is the `version` in its vendored vendored.json on its default branch, read
// through `gh api` (GH_TOKEN must be able to read the consumer). release-please.yml runs this
// before it opens a release pull request or tags one, so a release cannot stack on one that never
// reached icon-browser, ichava.com, the demo and the docs (the rule in CONTRIBUTING.md).
//
// A consumer's version only says which release it meant to vendor; its `commit` (vendored.json) must also be the
// release commit or a descendant of it, checked with `git merge-base --is-ancestor`, which needs the tag and history.
//
// Byte-identical in react-icon-browser and react-landingpage; only consumers.json differs.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/;

/** -1, 0 or 1. Throws on anything that is not a plain X.Y.Z. */
export function compareVersions(a, b) {
  const pa = SEMVER.exec(a);
  const pb = SEMVER.exec(b);
  if (!pa || !pb) throw new Error(`not a release version: ${!pa ? a : b}`);
  for (let i = 1; i <= 3; i++) {
    const d = Number(pa[i]) - Number(pb[i]);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

/**
 * The consumers whose vendored copy is not `target` or newer, with what to tell the reader.
 *
 * The version alone is not enough: a copy built before the release commit can carry the release's
 * version number, so a consumer one commit behind passes a version check. When `contains` is given
 * it is asked whether the consumer's vendored commit is the release commit or a descendant of it
 * (`true`), is not (`false`), or cannot be seen in this checkout (`null`). Anything but `true`, and
 * a manifest that names no commit, is reported: a copy that cannot be shown current is not current.
 * Without `contains` only the version is compared.
 */
export function behind(target, consumers, contains) {
  const problems = [];
  for (const c of consumers) {
    const update = `\n  Update it: ${c.update.replaceAll('{version}', target)}`;
    if (c.version === null || compareVersions(c.version, target) < 0) {
      problems.push(`${c.repo} vendors ${c.version ?? 'nothing readable'} at ${c.manifest}, not ${target}.${update}`);
    } else if (contains && compareVersions(c.version, target) === 0) {
      // A newer version is judged by the version; only an equal one can hide a stale commit.
      const verdict = c.commit ? contains(c.commit) : null;
      if (verdict !== true) {
        const named = c.commit ? c.commit.slice(0, 12) : 'no commit';
        const why = verdict === false ? `which is not v${target} or a descendant of it` : 'which this checkout cannot confirm descends from the release (fetch tags and history, or the manifest names none)';
        problems.push(`${c.repo} vendors version ${c.version} at ${named}, ${why} (${c.manifest}).${update}`);
      }
    }
  }
  return problems;
}

/** Whether `commit` is the commit `v<target>` points at or descends from it; null when unknown here. */
function descendsFromTag(target) {
  return (commit) => {
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', `v${target}`, commit], { stdio: 'ignore' });
      return true;
    } catch (e) {
      // Exit 1 is a definite "no"; any other status (unknown object, no tag) is "cannot tell".
      return e.status === 1 ? false : null;
    }
  };
}

function latestTag() {
  const tags = execFileSync('git', ['tag', '--list', 'v*'], { encoding: 'utf8' })
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => SEMVER.test(t));
  if (tags.length === 0) throw new Error('no vX.Y.Z tag in this checkout; fetch tags first (actions/checkout fetch-depth: 0)');
  return tags.sort(compareVersions).at(-1).replace(/^v/, '');
}

function vendoredManifest({ repo, manifest }) {
  try {
    const raw = execFileSync('gh', ['api', `repos/${repo}/contents/${manifest}`, '-H', 'Accept: application/vnd.github.raw'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(raw);
    return { manifest, version: parsed.version ?? null, commit: typeof parsed.commit === 'string' ? parsed.commit : null };
  } catch (e) {
    throw new Error(`could not read ${repo}:${manifest} (${String(e.stderr || e.message).trim()}). The token needs read access to ${repo}.`);
  }
}

function selfTest() {
  const c = (version) => [{ repo: 'o/consumer', manifest: 'vendored.json', version, update: 'sync {version}' }];
  const cases = [
    [behind('0.1.3', c('0.1.2')).length === 1, 'an older consumer is reported'],
    [behind('0.1.3', c('0.1.3')).length === 0, 'a current consumer passes'],
    [behind('0.1.3', c('0.2.0')).length === 0, 'a newer consumer passes'],
    [behind('0.10.0', c('0.9.9')).length === 1, 'versions compare numerically, not as strings'],
    [behind('0.1.3', c(null)).length === 1, 'an unreadable version is reported'],
    [(behind('0.1.3', c('0.1.2'))[0] ?? '').includes('sync 0.1.3'), 'the message names the target in the update command'],
    [behind('0.1.3', [{ ...c('0.1.3')[0], commit: 'x' }], () => false).length === 1, 'the right version at a stale commit is reported'],
    [behind('0.1.3', [{ ...c('0.1.3')[0], commit: 'x' }], () => true).length === 0, 'the right version at the release commit or later passes'],
    [behind('0.1.3', [{ ...c('0.1.3')[0], commit: 'x' }], () => null).length === 1, 'a commit that cannot be confirmed is reported'],
    [behind('0.1.3', c('0.1.3'), () => true).length === 1, 'a manifest naming no commit is reported when commits are checked'],
  ];
  const failed = cases.filter(([ok]) => !ok).map(([, name]) => name);
  if (failed.length) {
    console.error(`check-consumers self-test failed:\n- ${failed.join('\n- ')}`);
    process.exit(1);
  }
  console.log(`check-consumers self-test: ${cases.length} cases pass`);
}

function main(argv) {
  if (argv.includes('--self-test')) return selfTest();
  const at = argv.indexOf('--version');
  const target = at >= 0 ? argv[at + 1].replace(/^v/, '') : latestTag();
  const listed = JSON.parse(readFileSync(new URL('./consumers.json', import.meta.url), 'utf8'));
  if (!Array.isArray(listed) || listed.length === 0) throw new Error('scripts/consumers.json lists no consumers');
  const consumers = listed.map((c) => ({ ...c, ...vendoredManifest(c) }));
  for (const c of consumers) console.log(`${c.repo}: vendors ${c.version ?? '?'} at ${c.commit?.slice(0, 12) ?? '?'} (target ${target})`);
  const problems = behind(target, consumers, descendsFromTag(target));
  if (problems.length) {
    console.error(`\n${problems.length} consumer(s) behind ${target}. A release must reach every consumer before the next one:\n`);
    for (const p of problems) console.error(`- ${p}`);
    process.exit(1);
  }
  console.log(`all ${consumers.length} consumer(s) carry ${target} or newer`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main(process.argv.slice(2));
  } catch (e) {
    console.error(`check-consumers: ${e.message}`);
    process.exit(1);
  }
}
