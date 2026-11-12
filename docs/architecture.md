# Architecture

What the kernel holds, what it refuses, and why it is a separate public repository.

## What belongs here

The kernel is the published language between the Ichava UI surfaces. The browser and the landing
page run on one origin and must agree on a few things exactly: the catalog model, the locale list
and the shared locale key, the accent-to-token maths, and the theme-scope attribute. Every
divergence measured between the two packages sat in that set, so that set is the kernel.

The modules, one page each under [Reference](../README.md#documentation):

| Module | Contents |
|---|---|
| `catalog-model` | The icon, package and catalog types that mirror the Laravel API |
| `color` | Contrast and colour mixing |
| `theme` | Token derivation from an accent, theme resolution, the theme-scope attribute |
| `i18n` | The translation engine and the locale list. Message catalogs stay in each package |
| `locale-handoff` | The shared `ichava.locale` key |
| `consent` | The site-wide `ichava.consent` answer and the single consent notice |
| `treatment` | One vocabulary for icon treatments |
| `build` | The CSS token-scope step, at `@ichava/js-ui-kernel/build` |

## What does not

- **Framework code.** React, hooks, components and stores stay in the packages, with one exception:
  the opt-in `./react` subpath below.
- **Untitled UI PRO.** Its licence forbids publishing the source, so it never appears in this public
  repository. Free Untitled UI components stay in the packages too, except the ten in `./react`.

## The `./react` subpath (2026-11-12)

The landing (ichava.com) and the icon browser (icon-browser) carried byte-identical copies of ten
free UI files, and two copies drift. The owner chose to move shared code into the kernel (react
consolidation, Q1, 2026-11-11), so `@ichava/js-ui-kernel/react` holds them:

- `cx` and `sortCx` (tailwind-merge with the Untitled UI text scale), and the `is*Component` checks;
- the Untitled UI free `Toggle`, `RadioButton`/`RadioGroup`, `FeaturedIcon`, `AvatarCount`,
  `AvatarOnlineIndicator` and `VerifiedTick`;
- `./react/uui-theme.css`, the Untitled UI theme those components are styled by.

The components are Untitled UI React's free components, MIT, Copyright (c) 2025 Untitled UI; the
licence travels beside them as `LICENSE-untitledui` in `src/` and `dist/`. None carries the PRO
header. The two other shared files, `tabs` and `dropdown`, import product-specific code (badges,
icons, avatar, checkbox) and stay duplicated in the two packages under their drift guard.

It is opt-in: the kernel's own entry points import no React, and React, react-aria-components and
tailwind-merge are optional peers. `tests/react.test.ts` pins the export list and that separation.
It has its own ceiling, 1,550 lines of `.ts`, `.tsx` and `.css` (measured 1,463), and does not count
against the core's.
- **Anything one package uses alone.** The kernel stays at or under 1,100 lines: every `.ts` file under
  `src/`, counted as `wc -l` counts. `tests/kernel-size.test.ts` enforces it.

## Why 1,100 lines

The first ceiling read "under about 700 lines" and was a whole-kernel figure, not a per-file one; no
source file has come near 700 on its own (the largest, `theme.ts`, is 216). By 2026-11-02 the kernel
measured 1,014 lines across nine files, and the growth was shared contract rather than one
package's code: the linear CSS scanner that replaced two ReDoS-prone regexes (`build`), the
site-wide consent answer (`consent`), the warm surface ramp the brand text roles are measured
against (`theme`), and `Icon.path` and `Icon.snippets` (`catalog-model`). Each is something the
surfaces on one origin must agree on (a storage key, a token rule, a wire shape), which is the
test at the top of this page, so none is a candidate to move out.

The ceiling is the measurement plus a margin of under 10%, so it still forces the question on the
next module. Raising it means changing this section and the constant in the test together.

## Why a separate public repository

The canonical configuration has to be readable by every consumer's CI without a credential. Two
consumers are private and one (js-motion) is public; a public repository is the only place all
three can read. It holds no PRO code, so it can be public and MIT.

## Why copies and not a config package

A config package would be a fourth release cadence for three small files, and `extends` from a
git dependency adds an install to every typecheck. A copied file with a byte-level drift check
gives the same guarantee with less machinery.

---

[← Docs index](../README.md#documentation)
