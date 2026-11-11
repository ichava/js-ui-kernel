/**
 * @ichava/js-ui-kernel
 *
 * The framework-agnostic contract shared by the Ichava UI packages: the catalog model,
 * colour maths, theme tokens, the translation engine, the locale handoff, the
 * site-wide consent answer and the treatment vocabulary. The CSS token-scope build step is the `./build` entry, and the
 * shared configuration under `config/` is consumed by copy.
 */

/** The package name, for diagnostics that need to say which kernel answered. */
export const KERNEL_PACKAGE = '@ichava/js-ui-kernel';

export * from './catalog-model.js';
export * from './color.js';
export * from './theme.js';
export * from './i18n.js';
export * from './locale-handoff.js';
export * from './consent.js';
export * from './treatment.js';
