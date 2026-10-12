import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

import {
  LANGUAGE_LOCALES,
  LANGUAGE_STORAGE_KEY,
  Language,
  TranslationParams,
  isLanguage,
} from './i18n.model';

/**
 * Signal facade over Transloco: the active language/locale as signals, plus a
 * `t()` helper that can be called inside `computed()` and re-runs whenever the
 * language changes or a translation file (global or scope) finishes loading.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  private readonly active = signal<Language>(this.currentLanguage());
  /** Bumped when translations arrive, so `t()` consumers recompute. */
  private readonly revision = signal(0);

  readonly lang = this.active.asReadonly();
  readonly locale = computed(() => LANGUAGE_LOCALES[this.active()]);

  constructor() {
    this.document.documentElement.lang = this.active();
    this.transloco.events$.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event.type === 'translationLoadSuccess') this.revision.update((n) => n + 1);
    });
    this.transloco.langChanges$.pipe(takeUntilDestroyed()).subscribe((lang) => {
      if (!isLanguage(lang)) return;
      this.active.set(lang);
      this.document.documentElement.lang = lang;
    });
  }

  setLanguage(lang: Language): void {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Not persisted when storage is unavailable.
    }
    this.transloco.setActiveLang(lang);
  }

  /** Reactive translate: safe to use inside `computed()`. */
  t(key: string, params?: TranslationParams): string {
    this.active();
    this.revision();
    return this.transloco.translate(key, params);
  }

  private currentLanguage(): Language {
    const lang = this.transloco.getActiveLang();
    return isLanguage(lang) ? lang : 'pt-BR';
  }
}
