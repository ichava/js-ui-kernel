# Getting started

Adopting the shared TypeScript and ESLint configuration in a repository, step by step.

## Copy the canonical files

The configuration is shared by copy. Each consumer keeps byte-identical copies:

| Canonical file | Copy it to |
|---|---|
| `config/tsconfig.base.json` | `tsconfig.base.json` |
| `config/eslint.base.js` | `eslint.base.js` (repositories that run ESLint) |
| `config/check-config-drift.mjs` | `scripts/check-config-drift.mjs` |

## Extend the base

Each tsconfig in the repository extends the base and adds only what is local to it. `paths` stays
local, because paths resolve relative to the file that declares them:

```jsonc
// tsconfig.app.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": { "jsx": "react-jsx", "paths": { "@/*": ["./src/*"] } },
  "include": ["src"]
}
```

## Compose the ESLint config

```js
// eslint.config.js
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { ignores, react, typescript } from './eslint.base.js';

export default tseslint.config(ignores, typescript, react({ reactHooks, reactRefresh }));
```

Repository-specific blocks (vendored paths, import restrictions) follow these.

## Add the drift check

```json
{
  "scripts": {
    "check:config-drift": "node scripts/check-config-drift.mjs tsconfig.base.json=config/tsconfig.base.json eslint.base.js=config/eslint.base.js scripts/check-config-drift.mjs=config/check-config-drift.mjs"
  }
}
```

Run it as a CI step. It fetches each canonical file from `main` and fails on any difference, so a
change to the canonical turns every stale copy red until it is updated.

---

[← Docs index](../README.md#documentation)
