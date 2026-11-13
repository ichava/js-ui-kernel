// The translation engine both Ichava UI surfaces use. The message catalogs stay in each
// package (the browser's ~555 keys, the landing's 81); only the engine, the locale list
// and text direction are shared. Lookup falls back through the requested locale, then
// English, then the key itself, exactly as react-icon-browser's `translate()` does.

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'sw' | 'ar';

export interface LocaleMeta {
  readonly code: Locale;
  /** The endonym. */
  readonly label: string;
  readonly dir: 'ltr' | 'rtl';
}

/** Advertised locales (endonyms + text direction). */
export const LOCALES: readonly LocaleMeta[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
  { code: 'pt', label: 'Português', dir: 'ltr' },
  { code: 'sw', label: 'Kiswahili', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && LOCALES.some((l) => l.code === v);
}

export function localeDir(locale: Locale): 'ltr' | 'rtl' {
  return LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr';
}

export type Vars = Readonly<Record<string, string | number>>;

/** Fill `{name}` placeholders; a placeholder with no value is left as written. */
export function interpolate(raw: string, vars?: Vars): string {
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_m, name: string) => String(vars[name] ?? `{${name}}`));
}

/** English is complete; every other locale may be partial. */
export type Catalogs<K extends string = string> = { readonly en: Readonly<Record<K, string>> } & {
  readonly [L in Exclude<Locale, 'en'>]?: Readonly<Partial<Record<K, string>>>;
};

type Layer = Readonly<Partial<Record<Locale, Readonly<Record<string, string>>>>>;

/**
 * An immutable translator: bundled catalogs, optional override layers (server-supplied
 * strings), and a current locale. Every `with*` call returns a new translator, so one
 * mount's overrides never reach another's.
 *
 *   const t = Translator.of(MESSAGES).withOverrides(serverDict).locale('sw');
 *   t.t('toolbar.exportedToast', { n: 12, label: 'ZIP' });
 */
export class Translator<K extends string = string> {
  readonly #catalogs: Catalogs<K>;
  readonly #overrides: readonly Layer[];
  readonly #locale: Locale;

  private constructor(catalogs: Catalogs<K>, overrides: readonly Layer[], locale: Locale) {
    this.#catalogs = catalogs;
    this.#overrides = overrides;
    this.#locale = locale;
    Object.freeze(this);
  }

  static of<K extends string>(catalogs: Catalogs<K>, locale: Locale = DEFAULT_LOCALE): Translator<K> {
    return new Translator(catalogs, [], locale);
  }

  /** The same catalogs and overrides in another locale. */
  locale(locale: Locale): Translator<K> {
    return new Translator(this.#catalogs, this.#overrides, locale);
  }

  /** Another override layer on top of the existing ones; later layers win. */
  withOverrides(overrides: Layer): Translator<K> {
    return new Translator(this.#catalogs, [...this.#overrides, overrides], this.#locale);
  }

  /** Overrides for one locale, as react-icon-browser's `registerTranslations` takes them. */
  withMessages(locale: Locale, dict: Readonly<Record<string, string>>): Translator<K> {
    return this.withOverrides({ [locale]: dict });
  }

  get currentLocale(): Locale {
    return this.#locale;
  }

  get dir(): 'ltr' | 'rtl' {
    return localeDir(this.#locale);
  }

  /** The raw string for a key: requested locale, then English, then undefined. */
  lookup(key: K | (string & Record<never, never>), locale: Locale = this.#locale): string | undefined {
    for (const loc of locale === 'en' ? (['en'] as const) : ([locale, 'en'] as const)) {
      for (let i = this.#overrides.length - 1; i >= 0; i -= 1) {
        const hit = this.#overrides[i]?.[loc]?.[key];
        if (hit !== undefined) return hit;
      }
      const bundled = (this.#catalogs[loc] as Readonly<Partial<Record<string, string>>> | undefined)?.[key];
      if (bundled !== undefined) return bundled;
    }
    return undefined;
  }

  /** Translate a key, falling back to English, then to the key itself. */
  t(key: K | (string & Record<never, never>), vars?: Vars): string {
    return interpolate(this.lookup(key) ?? key, vars);
  }
}
