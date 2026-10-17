import { HttpErrorResponse } from '@angular/common/http';
import { computed, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import en from '../../../../public/i18n/en.json';
import ptBR from '../../../../public/i18n/pt-BR.json';
import { httpErrorMessage } from '../http/http-error.util';
import { I18N_SCOPES } from './i18n.model';
import { LanguageService } from './language.service';
import { TEST_SCOPES, provideI18nTesting } from './testing/i18n-testing';

/** Flattens nested translation objects into dotted keys. */
function keys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? keys(child as object, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('translations', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideI18nTesting('pt-BR')],
    });
  });

  it('keeps pt-BR and en global files in sync', () => {
    expect(keys(en).sort()).toEqual(keys(ptBR).sort());
  });

  it('keeps every feature scope in sync between languages', () => {
    for (const scope of I18N_SCOPES) {
      const pt = TEST_SCOPES[`${scope}/pt-BR`];
      const english = TEST_SCOPES[`${scope}/en`];
      expect(pt).withContext(scope).toBeDefined();
      expect(keys(english).sort()).withContext(scope).toEqual(keys(pt).sort());
    }
  });

  it('LanguageService.t() recomputes when the language changes', () => {
    const i18n = TestBed.inject(LanguageService);
    const label = TestBed.runInInjectionContext(() =>
      computed(() => i18n.t('enums.orderStatus.shipped')),
    );
    expect(label()).toBe('Enviado');

    TestBed.inject(TranslocoService).setActiveLang('en');
    expect(i18n.lang()).toBe('en');
    expect(i18n.locale()).toBe('en-US');
    expect(label()).toBe('Shipped');
  });

  it('translates API error codes, then statuses, in the active language', () => {
    const transloco = TestBed.inject(TranslocoService);
    const translate = (key: string, params?: Record<string, unknown>) =>
      transloco.translate(key, params);
    const duplicate = new HttpErrorResponse({
      status: 409,
      error: { error: 'Já existe…', code: 'duplicate_sku', params: { sku: 'ELE-1001' } },
    });
    const offline = new HttpErrorResponse({ status: 0 });

    expect(httpErrorMessage(duplicate, translate)).toBe('Já existe um produto com o SKU ELE-1001.');
    transloco.setActiveLang('en');
    expect(httpErrorMessage(duplicate, translate)).toBe(
      'A product with SKU ELE-1001 already exists.',
    );
    expect(httpErrorMessage(offline, translate)).toBe(
      'Could not reach the server. Check your connection.',
    );
    expect(httpErrorMessage(new Error('x'), translate)).toBe('An unexpected error occurred.');
  });
});
