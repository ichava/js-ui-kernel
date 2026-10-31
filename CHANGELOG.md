# Changelog

All notable changes to `@ichava/js-ui-kernel` follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - TBD

First release of `@ichava/js-ui-kernel`. The repository is published as a single commit; the 0.1.x tags cut between 2026-10-23 and 2026-10-27 (v0.1.0 to v0.1.4) are folded into this release, and their notes are kept below under *Archived history*.

### Added

- The framework-agnostic domain modules shared by the Ichava UI packages: `catalog-model`, `color`, `theme`, `i18n` (an immutable `Translator`), `locale-handoff`, `consent` and `treatment`, plus the `@ichava/js-ui-kernel/build` token-scope step (`scopeTokens`, `globalTokenRules`, `cssRules`, `stripCssComments`, `scopeThemeTokens`).
- The shared strict TypeScript base (`config/tsconfig.base.json`), the shared ESLint blocks (`config/eslint.base.js`) and the byte-for-byte drift check (`config/check-config-drift.mjs`).
- Releases prepared by release-please with hand-written notes; `release.yml` publishes this section as the release body.

### Changed

- Node 24 is now the minimum, up from 22. CI tests on Node 24 and 26 (the newest release), and the single-version jobs and the release run on 24, the active LTS. `engines.node` is `>=24`, and the README, installation guide and bug template say so.

## [Archived history]

> The 5 sections directly below (v0.1.0 to v0.1.4, 2026-10-23 to 2026-10-27) were released as tags that the 0.1.0 release replaces; everything they describe ships in 0.1.0.

### [0.1.4] - 2026-10-27

#### Added

- **`Icon.path` and `Icon.snippets`.** `toIcon()` now carries the wire's `icon_path` (falling back to `path`) as `Icon.path`, the `vendor/package::category/name` string Laravel resolves, and a server-rendered `snippets` map keyed by format. Both are optional and left off when the wire has none, so existing `Icon` producers keep compiling. The icon browser uses `path` to write snippets that Laravel can render, and shows a server snippet in place of its own when one is sent.

### [0.1.3] - 2026-10-26

#### Added

- **`consent`: the site-wide consent answer**, moved from react-icon-browser's `src/core/consentShare.ts` with the same key (`ichava.consent`), values (`essential | all`) and functions: `SITE_CONSENT_KEY`, `isConsent`, `loadSiteConsent`, `saveSiteConsent`, `subscribeSiteConsent`, `resolveConsent`, `claimConsentNotice`, `holdsConsentNotice`, `subscribeConsentNotice`, and the `Consent` type. Exported from the package root, so the browser, the landing page and a host's own pages share one answer and one notice. Plain TypeScript with no framework or Untitled UI code. Additive: no existing export changes.
- **Releases are prepared by release-please.** A *Release Please* workflow reads the Conventional Commit log, keeps one release pull request open that bumps `.release-please-manifest.json` and `package.json`, and tags the release when that pull request merges; the tag starts `release.yml` as before. On 0.x a breaking change bumps the minor and everything else bumps the patch. The minor moves in lockstep with the other coupled ichava packages: a breaking change anywhere in the family reaches every coupled repository as a `Release-As: 0.N.0` footer, so `^0.N` means the same line everywhere. Release notes stay hand-written: release-please is set to `skip-changelog`, and the workflow closes this `[Unreleased]` section under the new version on the release branch, failing if it is empty. It runs on `workflow_dispatch`, a weekly schedule, and the merge of a release pull request, so the only `push` trigger is still the tag. The pull request and the tag are made with a per-run Refresh Bot token, because ones made with `GITHUB_TOKEN` start no workflows. `release.yml` gains a `workflow_dispatch` recovery path for a tag push that started nothing; its first step refuses any ref that is not a `vX.Y.Z` tag.

### [0.1.2] - 2026-10-23

#### Added

- **`cssRules(css)` and `stripCssComments(css)` at `@ichava/js-ui-kernel/build`**: the linear scanner `scopeTokens` already used, exported so the React packages' library-build checks can drop the regexes CodeQL flags as polynomial. 50,000 random inputs give exactly the regexes' matches, and hostile inputs (100,000 repetitions of `a/`, `z` or `a/*`) finish in under 50 ms.

#### Fixed

- `package.json` says `0.1.1`, the version tagged, and the install lines in the README and `docs/installation.md` pin `#v0.1.1`. `docs/release.md` now makes the version field part of every release pull request.

### [0.1.1] - 2026-10-23

#### Added

- **The domain modules** (React UI architecture, step 1.1), moved from react-icon-browser's `src/core` and react-landingpage's copies, with no change to any output:
  - `catalog-model`: the icon, package, term, filter, page and catalog types, `toIcon` and `svgHasOwnColors`.
  - `color`: `isValidHex`, `hexToRgba`, `hexWithAlpha`, `contrastRatio`, `mixHex`, `compositeHex`, `readableOn`.
  - `theme`: `resolveTheme`, `systemTheme`, `brandRamp`, `radiusScale`, `themeVars`, `THEME_VAR_NAMES`, and `brandText`, which takes the landing page's multi-surface rule as an option (`{ surfaces: LANDING_SURFACES[theme] }`). `THEME_SCOPES` names each package's token scope.
  - `i18n`: an immutable `Translator` (`of`, `locale`, `withOverrides`, `withMessages`), `interpolate`, `LOCALES`, `localeDir`, `isLocale` and a `Catalogs` type that makes a key missing from English a compile error. Catalogs stay in each package.
  - `locale-handoff`: the shared `ichava.locale` key, with load, save and same-document subscription.
  - `treatment`: the canonical treatment ids and the landing page's mapped onto them (`stroke` is `default`, `dual` is `duotone`).
  - `@ichava/js-ui-kernel/build`: `globalTokenRules`, `scopeTokens` and the `scopeThemeTokens(scope)` Vite plugin, typed structurally so the kernel needs no Vite dependency. The rule and comment scanning is one linear pass instead of the two regexes the browser's script used, which CodeQL flagged as polynomial on hostile input (`js/polynomial-redos`): a 60,000-character brace-free string took 4.4 s and a run of `a/*` 10.3 s, and both now finish in milliseconds. 50,000 random fragments give the same output as the old regexes, and three planted scanner bugs each fail that comparison.
- **A parity table** (`tests/fixtures/theme-parity.json`): today's `themeVars` and the landing's accent text for every shipped accent in both themes, captured from the code the module replaces. The kernel must reproduce every value; changing one step of the landing rule fails 9 cases, nudging one token fails 10. `scopeTokens` and `globalTokenRules` were also compared with the browser's script on all seven stylesheets of both packages, for both scopes: identical.
- Reference pages for each module under `docs/tools/`.

### [0.1.0] - 2026-10-23

#### Added

- Repository scaffold: package manifest, strict TypeScript 7 build, ESLint, Vitest, CI on
  pull requests plus a weekly run, Dependabot, release workflow, and the community health files.
- `config/tsconfig.base.json`, the strict TypeScript base shared by react-icon-browser,
  react-landingpage and js-motion. It adds `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noImplicitReturns` and `erasableSyntaxOnly` to the setup those repositories had.
- `config/eslint.base.js`, the ESLint blocks the React packages share.
- `config/check-config-drift.mjs`, which compares a consumer's copies with the canonical files
  byte for byte and fails on a mismatch, a non-200 answer, an empty body or an empty file list.
  A CI job runs it against GitHub at the commit under test and proves it fails on a planted
  one-byte change.
- `LICENSE` names Simtabi LLC as the copyright holder.
