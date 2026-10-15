import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LANGUAGES, Language } from '../i18n.model';
import { LanguageService } from '../language.service';
import { FlagIconComponent } from './flag-icon.component';

/** Each option is named in its own language, so it is recognisable whatever is active. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
};

const ARROW_STEPS: Record<string, number | undefined> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * Flag buttons following the WAI-ARIA radio group pattern: Tab enters the
 * group on the checked option, arrow keys move and select.
 */
@Component({
  selector: 'app-language-switcher',
  imports: [FlagIconComponent, TranslocoPipe],
  template: `
    <div class="group" role="radiogroup" [attr.aria-label]="'language.label' | transloco">
      @for (lang of languages; track lang) {
        <button
          type="button"
          role="radio"
          class="option"
          [class.option--active]="lang === current()"
          [attr.aria-checked]="lang === current()"
          [attr.aria-label]="names[lang]"
          [attr.title]="names[lang]"
          [attr.lang]="lang"
          [attr.data-lang]="lang"
          [tabIndex]="lang === current() ? 0 : -1"
          (click)="select(lang)"
          (keydown)="onKeydown($event)"
        >
          <app-flag-icon [lang]="lang" />
        </button>
      }
    </div>
  `,
  styles: `
    .group {
      display: inline-flex;
      gap: 2px;
      padding: 2px;
      border-radius: 999px;
      background: var(--mat-sys-surface-container-high);
    }
    .option {
      display: grid;
      place-items: center;
      width: 44px;
      height: 40px;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: transparent;
      cursor: pointer;
      opacity: 0.55;
      filter: grayscale(0.7);
      transition:
        opacity 150ms ease,
        filter 150ms ease,
        background-color 150ms ease;
    }
    .option:hover,
    .option:focus-visible {
      opacity: 1;
      filter: none;
    }
    .option:focus-visible {
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: 1px;
    }
    .option--active {
      opacity: 1;
      filter: none;
      background: var(--mat-sys-surface-container-lowest);
      box-shadow: inset 0 0 0 2px var(--mat-sys-primary);
    }
    @media (prefers-reduced-motion: reduce) {
      .option {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  private readonly i18n = inject(LanguageService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly languages = LANGUAGES;
  protected readonly names = LANGUAGE_NAMES;
  protected readonly current = this.i18n.lang;

  protected select(lang: Language): void {
    if (lang !== this.current()) this.i18n.setLanguage(lang);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const step = ARROW_STEPS[event.key];
    if (!step) return;
    event.preventDefault();
    const index = LANGUAGES.indexOf(this.current());
    const next = LANGUAGES[(index + step + LANGUAGES.length) % LANGUAGES.length];
    this.select(next);
    this.host.nativeElement.querySelector<HTMLButtonElement>(`[data-lang="${next}"]`)?.focus();
  }
}
