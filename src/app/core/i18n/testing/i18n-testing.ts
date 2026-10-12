import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { Translation, TranslocoTestingModule } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';

import en from '../../../../../public/i18n/en.json';
import ptBR from '../../../../../public/i18n/pt-BR.json';
import authEn from '../../../../../public/i18n/auth/en.json';
import authPt from '../../../../../public/i18n/auth/pt-BR.json';
import { LANGUAGES, LANGUAGE_LOCALES, Language } from '../i18n.model';

/** Scope files, keyed the way TranslocoTestingModule expects (`scope/lang`). */
const SCOPES: Record<string, Translation> = {
  'auth/pt-BR': authPt,
  'auth/en': authEn,
};

/**
 * Real translation files, preloaded synchronously, so component tests assert
 * on the same texts users see.
 */
export function provideI18nTesting(lang: Language = 'pt-BR'): EnvironmentProviders[] {
  return [
    importProvidersFrom(
      TranslocoTestingModule.forRoot({
        langs: { 'pt-BR': ptBR, en, ...SCOPES },
        translocoConfig: {
          availableLangs: [...LANGUAGES],
          defaultLang: lang,
          fallbackLang: 'pt-BR',
          reRenderOnLangChange: true,
          scopes: { autoPrefixKeys: false },
          missingHandler: { logMissingKey: false },
        },
        preloadLangs: true,
      }),
    ),
    ...provideTranslocoLocale({
      langToLocaleMapping: LANGUAGE_LOCALES,
      localeToCurrencyMapping: { 'pt-BR': 'BRL', 'en-US': 'BRL' },
      defaultCurrency: 'BRL',
    }),
  ];
}
