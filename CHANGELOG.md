# Changelog

All notable changes to `@ichava/js-ui-kernel` follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

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
