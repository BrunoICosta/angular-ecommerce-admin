import { Signal, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { toQueryParams } from './list-query.util';

export type QueryPatch = Record<string, string | number | null>;

/**
 * Returns a function that merges a patch into the current query string. List
 * pages never hold their own state: they navigate, and the new query params
 * flow back in through component input binding. Call in an injection context.
 */
export function injectQueryNavigator(
  defaults: Record<string, string | number>,
): (patch: QueryPatch) => void {
  const router = inject(Router);
  return (patch) =>
    void router.navigate([], {
      queryParams: toQueryParams(patch, defaults),
      queryParamsHandling: 'merge',
    });
}

/**
 * Search box bound to a query param: it follows the URL (back button, links)
 * and reports debounced user input. Call in an injection context.
 */
export function syncedSearchControl(
  query: Signal<string | undefined>,
  onSearch: (term: string) => void,
  debounceMs = 300,
): FormControl<string> {
  const control = new FormControl('', { nonNullable: true });

  effect(() => {
    const term = query() ?? '';
    if (control.value !== term) control.setValue(term, { emitEvent: false });
  });

  control.valueChanges
    .pipe(debounceTime(debounceMs), distinctUntilChanged(), takeUntilDestroyed())
    .subscribe((term) => onSearch(term.trim()));

  return control;
}
