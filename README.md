# @ichava/js-ui-kernel

[![Tests](https://github.com/ichava/js-ui-kernel/actions/workflows/ci.yml/badge.svg)](https://github.com/ichava/js-ui-kernel/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Two badges, not four: the package is not on npm (it installs from a git tag), so there is no
registry version to show, and lint runs in the same CI workflow as the tests.

> Framework-agnostic domain kernel and shared TypeScript configuration for the Ichava UI packages.

Plain TypeScript, no runtime dependencies, no framework. Node 22 or newer for the tooling.

## Install

From a git tag, as the Ichava packages consume it:

```bash
npm install "git+https://github.com/ichava/js-ui-kernel.git#v0.1.0"
```

`prepare` builds `dist/` during the install.

## Quick start guide and usage

### Getting started

Nothing to configure for the runtime entry point. The shared configuration under `config/` is
consumed by copy, not by import: copy the files you use into your repository and add the drift
check, which fails when a copy stops matching the canonical file here.

```bash
curl -fsSLo tsconfig.base.json \
  https://raw.githubusercontent.com/ichava/js-ui-kernel/main/config/tsconfig.base.json
curl -fsSLo scripts/check-config-drift.mjs \
  https://raw.githubusercontent.com/ichava/js-ui-kernel/main/config/check-config-drift.mjs
```

### Usage

Extend the base from your own tsconfig, keeping `paths` local:

```jsonc
// tsconfig.app.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": { "jsx": "react-jsx", "paths": { "@/*": ["./src/*"] } },
  "include": ["src"]
}
```

Check the copies in CI:

```json
{
  "scripts": {
    "check:config-drift": "node scripts/check-config-drift.mjs tsconfig.base.json=config/tsconfig.base.json scripts/check-config-drift.mjs=config/check-config-drift.mjs"
  }
}
```

The full walkthrough is in [docs/getting-started.md](docs/getting-started.md); everything else is
under [Documentation](#documentation).

## <a name="documentation"></a>Documentation

The documentation lives in this repository's [`docs/`](https://github.com/ichava/js-ui-kernel/tree/main/docs)
folder until the hosted site exists.

### Guides

- [Installation](docs/installation.md) — the git-tag install and what `prepare` does
- [Getting started](docs/getting-started.md) — adopting the shared configuration in a repository
- [Configuration](docs/configuration.md) — the three canonical files and the drift check
- [Architecture](docs/architecture.md) — what belongs in the kernel, and what does not
- [Release](docs/release.md) — tagging, and how consumers move to a new tag

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). This project follows the
[Contributor Covenant](CODE_OF_CONDUCT.md).

## License

MIT. See [LICENSE](LICENSE).
