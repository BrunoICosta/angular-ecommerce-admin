import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { Translation, TranslocoTestingModule } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';

import en from '../../../../../public/i18n/en.json';
import ptBR from '../../../../../public/i18n/pt-BR.json';
import authEn from '../../../../../public/i18n/auth/en.json';
import authPt from '../../../../../public/i18n/auth/pt-BR.json';
import customersEn from '../../../../../public/i18n/customers/en.json';
import customersPt from '../../../../../public/i18n/customers/pt-BR.json';
import dashboardEn from '../../../../../public/i18n/dashboard/en.json';
import dashboardPt from '../../../../../public/i18n/dashboard/pt-BR.json';
import ordersEn from '../../../../../public/i18n/orders/en.json';
import ordersPt from '../../../../../public/i18n/orders/pt-BR.json';
import productsEn from '../../../../../public/i18n/products/en.json';
import productsPt from '../../../../../public/i18n/products/pt-BR.json';
import usersEn from '../../../../../public/i18n/users/en.json';
import usersPt from '../../../../../public/i18n/users/pt-BR.json';
import { LANGUAGES, LANGUAGE_LOCALES, Language } from '../i18n.model';

/** Scope files, keyed the way TranslocoTestingModule expects (`scope/lang`). */
const SCOPES: Record<string, Translation> = {
  'auth/pt-BR': authPt,
  'auth/en': authEn,
  'customers/pt-BR': customersPt,
  'customers/en': customersEn,
  'dashboard/pt-BR': dashboardPt,
  'dashboard/en': dashboardEn,
  'orders/pt-BR': ordersPt,
  'orders/en': ordersEn,
  'products/pt-BR': productsPt,
  'products/en': productsEn,
  'users/pt-BR': usersPt,
  'users/en': usersEn,
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
