# Configuration

The three canonical files under `config/`, and the drift check that keeps their copies honest.

## `tsconfig.base.json`

The strict compiler options every Ichava UI package shares: ES2022 output, bundler resolution,
`verbatimModuleSyntax`, and `strict` plus these additions:

| Option | Why |
|---|---|
| `noUncheckedIndexedAccess` | An index read may be `undefined`; measured at 0 errors in both React packages |
| `noImplicitOverride` | Required once domain classes extend each other |
| `noImplicitReturns` | Free, measured at 0 errors |
| `erasableSyntaxOnly` | Every file stays strippable by Node, esbuild and TypeScript 7 alike; no parameter properties, enums or namespaces |

Two options are deliberately **not** in the base:

- `exactOptionalPropertyTypes`, which fires on vendored Untitled UI files that must not be hand
  edited. The React packages turn it on in a stricter overlay for their domain code only.
- `isolatedDeclarations`, which TypeScript 7.0.2 crashes on.

`ESNext.Disposable` is in `lib` for `Symbol.dispose` typing; nothing requires `using`.

## `eslint.base.js`

Three exports, composed by each consumer:

| Export | What it is |
|---|---|
| `ignores` | Build output, dependencies, static assets and tool configs |
| `typescript` | `@eslint/js` and `typescript-eslint` recommended, plus the shared rule overrides |
| `react({ reactHooks, reactRefresh })` | The hooks and fast-refresh rules. The plugins are passed in, so the file loads where React tooling is not installed |

## `check-config-drift.mjs`

```bash
node scripts/check-config-drift.mjs <local>=<canonical> [...]
```

Fetches each canonical file from `raw.githubusercontent.com` and compares bytes. It fails on a
mismatch, a non-200 answer, an empty body, an unreadable local copy, a network error, or an empty
pair list, and it reports how many files it compared.

| Variable | Default | Use |
|---|---|---|
| `ICHAVA_KERNEL_REF` | `main` | Compare against another ref, such as a pull request's head commit |
| `ICHAVA_KERNEL_RAW` | `https://raw.githubusercontent.com/ichava/js-ui-kernel` | A mirror |

---

[← Docs index](../README.md#documentation)
