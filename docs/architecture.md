# Architecture

What the kernel holds, what it refuses, and why it is a separate public repository.

## What belongs here

The kernel is the published language between the Ichava UI surfaces. The browser and the landing
page run on one origin and must agree on a few things exactly: the catalog model, the locale list
and the shared locale key, the accent-to-token maths, and the theme-scope attribute. Every
divergence measured between the two packages sat in that set, so that set is the kernel.

Planned modules, landing in later releases:

| Module | Contents |
|---|---|
| `catalog-model` | The icon, package and catalog types that mirror the Laravel API |
| `color` | Contrast and colour mixing |
| `theme` | Token derivation from an accent, theme resolution, the theme-scope attribute |
| `i18n` | The translation engine and the locale list. Message catalogs stay in each package |
| `locale-handoff` | The shared `ichava.locale` key |
| `treatment` | One vocabulary for icon treatments |

## What does not

- **Framework code.** React, hooks, components and stores stay in the packages.
- **Untitled UI, free or PRO.** Vendored per package by design, and PRO source may not appear in
  a public repository at all.
- **Anything one package uses alone.** The kernel stays under about 700 lines.

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
