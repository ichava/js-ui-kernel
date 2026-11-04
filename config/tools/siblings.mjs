// Where another ichava repository's file is on this machine, when it is.
//
// A file this repository takes from another one is never read from a sibling checkout at build
// time: that path exists on one machine only. The convention, for every cross-repository path:
//
//   - a COPY (content this repository builds or tests against) is vendored, with its
//     repository, path, commit and SHA-256 recorded beside it, and a test pins the digest;
//   - a LINK (prose or data pointing a reader at another repository's file) is the published
//     URL, https://github.com/ichava/<repo>/blob/main/<path>;
//   - a MANIFEST PATH (a file another repository keeps, read through the GitHub API) is the
//     repository name plus the repository-relative path.
//
// The sibling checkout is only ever a cross-check: when it is on disk, a test compares the copy
// with it, or asserts the linked path exists in it, and fails on drift. When it is not (CI), the
// test is skipped, and the digest pin still holds. The checkouts are expected side by side under
// one packages directory; ICHAVA_PACKAGES_DIR names another one.

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The directory holding the ichava checkouts side by side. */
export function packagesDir() {
  return resolve(process.env.ICHAVA_PACKAGES_DIR || join(root, '..'));
}

/**
 * The local path of `path` in the sibling checkout of `repository` (`ichava/icon-browser` or
 * `icon-browser`), or null when that checkout is not on disk.
 */
export function siblingPath(repository, path = '') {
  const name = repository.replace(/^ichava\//, '');
  const checkout = join(packagesDir(), name);
  if (!existsSync(join(checkout, '.git'))) return null;
  return join(checkout, path);
}

/** `https://github.com/ichava/<repo>/blob/main/<path>` split into its repository and path, or null. */
export function parseRepoUrl(url) {
  const m = /^https:\/\/github\.com\/(ichava\/[A-Za-z0-9._-]+)\/blob\/main\/([^\s#?)"']+)/.exec(url);
  return m ? { repository: m[1], path: decodeURIComponent(m[2]) } : null;
}
