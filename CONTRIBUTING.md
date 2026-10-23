# Contributing

## Before you start

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

All five must be clean before a pull request is opened. CI runs the same commands.

## What belongs here

The kernel is the contract the Ichava UI packages share: the catalog model, colour maths, theme
tokens, the i18n engine, the locale handoff between surfaces, and the shared configuration under
`config/`. It stays small and framework-free:

- **No framework imports.** No React, no Vue, no zustand. A module that needs one belongs in the
  package that uses it.
- **No runtime dependencies.** A pull request that adds one has to argue for it.
- **No Untitled UI code, free or PRO.** This repository is public and MIT. Untitled UI PRO's
  licence forbids exposing its source in a public repository, so a PRO file here is a licence
  breach, not a style problem.

## Changing a file under `config/`

Every consumer keeps a byte-identical copy, and its drift check fails the moment the canonical
changes. So a change here is a change in every consumer:

1. Merge the change here.
2. Copy the new file into each consumer in the same sweep (react-icon-browser,
   react-landingpage, js-motion), one pull request per repository.

Say in the pull request which repositories need the new copy.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `ci:`, `test:`). Subject 72
  characters or fewer, imperative mood. The body explains why.
- No AI attribution anywhere: commits, pull request titles and bodies, code comments or docs.
- Test credentials, if a test ever needs one, are generated at run time, never written down.
- No lock files. This is a library; `package-lock.json` is gitignored.

## Versioning

SemVer on 0.x: a breaking change bumps the minor, everything else bumps the patch. The minor
moves in lockstep with the other coupled Ichava packages. Do not bump the version in a feature
pull request; releases are cut separately.

## Security

See [`SECURITY.md`](SECURITY.md).
