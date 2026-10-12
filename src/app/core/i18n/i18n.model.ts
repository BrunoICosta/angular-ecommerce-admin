export const LANGUAGES = ['pt-BR', 'en'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'pt-BR';

/** Locale used by Intl for each UI language. Prices stay in BRL in both. */
export const LANGUAGE_LOCALES: Record<Language, string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
};

export const LANGUAGE_STORAGE_KEY = 'loja-admin.lang';

/** Lazy translation scopes, one per feature (files under `public/i18n/<scope>/`). */
export const I18N_SCOPES = [
  'auth',
  'dashboard',
  'products',
  'orders',
  'customers',
  'users',
] as const;

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/**
 * Initial language: saved choice > browser language (pt* -> pt-BR, anything
 * else -> en) > pt-BR. Pure, so it is unit tested without a browser.
 */
export function detectLanguage(
  saved: string | null,
  browserLanguages: readonly string[] | undefined,
): Language {
  if (isLanguage(saved)) return saved;
  const first = browserLanguages?.find(Boolean);
  if (!first) return DEFAULT_LANGUAGE;
  return first.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

/** Interpolation params of a translation key. */
export type TranslationParams = Record<string, unknown>;
