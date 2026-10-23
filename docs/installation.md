# Installation

How a repository installs the kernel, and what the install does.

## From a git tag

The kernel is not published to npm. Consumers install a tag directly:

```bash
npm install "git+https://github.com/ichava/js-ui-kernel.git#v0.1.2"
```

That writes a dependency such as
`"@ichava/js-ui-kernel": "git+https://github.com/ichava/js-ui-kernel.git#v0.1.2"` into
`package.json`. Pin a tag, never a branch: a branch moves under every install.

## What the install runs

`dist/` is not committed. npm runs the `prepare` script when it installs a git dependency, after
installing that dependency's dev toolchain, so the consumer receives a fresh `dist/index.js` and
`dist/index.d.ts` built by TypeScript 7.

## Requirements

- Node 22 or newer.
- A bundler or runtime that understands ES modules. The package is `"type": "module"` with a
  single `import` entry.

## No lock file

This repository commits no lock file, and neither do its consumers. CI resolves dependencies
fresh on every run and once a week on `main`.

---

[← Docs index](../README.md#documentation)
