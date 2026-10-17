import { DOCUMENT } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { LANGUAGE_STORAGE_KEY } from '../i18n.model';
import { provideI18nTesting } from '../testing/i18n-testing';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let element: HTMLElement;

  const radio = (name: string) =>
    [...element.querySelectorAll<HTMLButtonElement>('[role="radio"]')].find(
      (button) => button.getAttribute('aria-label') === name,
    )!;

  beforeEach(async () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [provideZonelessChangeDetection(), provideI18nTesting('pt-BR')],
    });
    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY));

  it('renders a labelled radio group with one flag per language', () => {
    const group = element.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute('aria-label')).toBe('Idioma');

    const portuguese = radio('Português (Brasil)');
    const english = radio('English');
    expect(portuguese.getAttribute('aria-checked')).toBe('true');
    expect(english.getAttribute('aria-checked')).toBe('false');
    expect(english.getAttribute('lang')).toBe('en');
    expect(english.title).toBe('English');
    expect(english.querySelector('app-flag-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('switches the language, persists it and updates <html lang>', async () => {
    radio('English').click();
    await fixture.whenStable();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    expect(radio('English').getAttribute('aria-checked')).toBe('true');
    expect(element.querySelector('[role="radiogroup"]')?.getAttribute('aria-label')).toBe(
      'Language',
    );
  });

  it('moves the selection with the arrow keys (roving tabindex)', async () => {
    const portuguese = radio('Português (Brasil)');
    expect(portuguese.tabIndex).toBe(0);
    expect(radio('English').tabIndex).toBe(-1);

    portuguese.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(radio('English').tabIndex).toBe(0);
    expect(document.activeElement).toBe(radio('English'));
  });
});
