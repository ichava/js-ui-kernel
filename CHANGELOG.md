# Changelog

All notable changes to `@ichava/js-ui-kernel` follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

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
