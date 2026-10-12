import { EnvironmentProviders, isDevMode, makeEnvironmentProviders } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';

import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LANGUAGE_LOCALES,
  LANGUAGE_STORAGE_KEY,
  detectLanguage,
} from './i18n.model';
import { TranslatedTitleStrategy } from './translated-title.strategy';
import { TranslocoHttpLoader } from './transloco-http.loader';

function initialLanguage(): string {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    // Storage unavailable: fall back to the browser language.
  }
  const browser = typeof navigator === 'undefined' ? undefined : navigator.languages;
  return detectLanguage(saved, browser);
}

export function provideI18n(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideTransloco({
      config: {
        availableLangs: [...LANGUAGES],
        defaultLang: initialLanguage(),
        fallbackLang: DEFAULT_LANGUAGE,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { useFallbackTranslation: true, logMissingKey: isDevMode() },
        scopes: { autoPrefixKeys: false },
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoLocale({
      langToLocaleMapping: LANGUAGE_LOCALES,
      // The store sells in Brazil: only the formatting follows the language.
      localeToCurrencyMapping: { 'pt-BR': 'BRL', 'en-US': 'BRL' },
      defaultCurrency: 'BRL',
    }),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
  ]);
}
