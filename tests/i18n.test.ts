import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES, Translator, interpolate, isLocale, localeDir, type Catalogs } from '../src/i18n.js';

const MESSAGES = {
  en: { 'greet': 'Hello {name}', 'only.en': 'English only', 'count': '{n} icons' },
  sw: { 'greet': 'Habari {name}' },
  ar: { 'greet': 'مرحبا {name}' },
} as const satisfies Catalogs<'greet' | 'only.en' | 'count'>;

describe('locales', () => {
  it('advertises seven locales, Arabic right-to-left', () => {
    expect(LOCALES.map((l) => l.code)).toEqual(['en', 'es', 'fr', 'de', 'pt', 'sw', 'ar']);
    expect(localeDir('ar')).toBe('rtl');
    expect(localeDir('sw')).toBe('ltr');
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('recognises only advertised codes', () => {
    expect(isLocale('sw')).toBe(true);
    expect(isLocale('xx')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe('interpolate', () => {
  it('fills placeholders and leaves an unfilled one as written', () => {
    expect(interpolate('{n} of {total}', { n: 3 })).toBe('3 of {total}');
    expect(interpolate('plain')).toBe('plain');
  });
});

describe('Translator', () => {
  const t = Translator.of(MESSAGES);

  it('falls back to English, then to the key', () => {
    expect(t.locale('sw').t('greet', { name: 'Ada' })).toBe('Habari Ada');
    expect(t.locale('sw').t('only.en')).toBe('English only');
    expect(t.locale('sw').t('missing.key')).toBe('missing.key');
  });

  it('applies overrides over the bundled strings, later layers winning', () => {
    const o = t.withMessages('sw', { greet: 'Jambo {name}' }).withOverrides({ sw: { greet: 'Shikamoo {name}' } });
    expect(o.locale('sw').t('greet', { name: 'Ada' })).toBe('Shikamoo Ada');
  });

  it('falls back to an English override before the bundled English', () => {
    const o = t.withMessages('en', { count: '{n} glyphs' });
    expect(o.locale('ar').t('count', { n: 2 })).toBe('2 glyphs');
  });

  it('keeps every translator immutable, so one mount never sees another mount\'s overrides', () => {
    const a = t.withMessages('en', { greet: 'Hi {name}' });
    expect(a.t('greet', { name: 'A' })).toBe('Hi A');
    expect(t.t('greet', { name: 'A' })).toBe('Hello A');
    expect(Object.isFrozen(a)).toBe(true);
  });

  it('reports its locale and direction', () => {
    expect(t.locale('ar').currentLocale).toBe('ar');
    expect(t.locale('ar').dir).toBe('rtl');
    expect(t.currentLocale).toBe('en');
  });

  it('reproduces react-icon-browser translate() for its own catalogs', () => {
    // translate(locale, key, vars): MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key.
    const legacy = (locale: 'en' | 'sw' | 'ar', key: string, vars?: Record<string, string | number>) => {
      const cat = MESSAGES as unknown as Record<string, Record<string, string> | undefined>;
      return interpolate(cat[locale]?.[key] ?? cat.en?.[key] ?? key, vars);
    };
    for (const locale of ['en', 'sw', 'ar'] as const) {
      for (const key of ['greet', 'only.en', 'count', 'nope']) {
        expect(t.locale(locale).t(key, { name: 'Ada', n: 4 })).toBe(legacy(locale, key, { name: 'Ada', n: 4 }));
      }
    }
  });
});
