import { DestroyRef, Injectable, Provider, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';
import { switchMap } from 'rxjs';

/** MatPaginator labels in the active language, updated live on language change. */
@Injectable()
export class I18nPaginatorIntl extends MatPaginatorIntl {
  private readonly transloco = inject(TranslocoService);

  constructor() {
    super();
    this.transloco.langChanges$
      .pipe(
        // Wait until the global translation of the new language is loaded.
        switchMap((lang) => this.transloco.selectTranslation(lang)),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        this.itemsPerPageLabel = this.transloco.translate('paginator.itemsPerPage');
        this.nextPageLabel = this.transloco.translate('paginator.next');
        this.previousPageLabel = this.transloco.translate('paginator.previous');
        this.firstPageLabel = this.transloco.translate('paginator.first');
        this.lastPageLabel = this.transloco.translate('paginator.last');
        this.changes.next();
      });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) return this.transloco.translate('paginator.empty');
    const start = page * pageSize + 1;
    const end = Math.min(length, (page + 1) * pageSize);
    return this.transloco.translate('paginator.range', { start, end, total: length });
  };
}

/**
 * Provided per list feature (route providers) instead of globally: importing
 * the paginator entry point from app.config pulled MatSelect and MatFormField
 * into the initial bundle.
 */
export function provideI18nPaginatorIntl(): Provider {
  return { provide: MatPaginatorIntl, useClass: I18nPaginatorIntl };
}
