import { SortDirection } from '@core/models';

/** Pagination/sort state as kept in the URL (page is 1-based for humans). */
export interface UrlListState {
  page: number;
  pageSize: number;
  sort: string;
  direction: SortDirection;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function toPageSize(value: string | undefined, fallback = PAGE_SIZE_OPTIONS[0]): number {
  const size = toPositiveInt(value, fallback);
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(size) ? size : fallback;
}

export function toDirection(value: string | undefined, fallback: SortDirection): SortDirection {
  return value === 'asc' || value === 'desc' ? value : fallback;
}

/**
 * Converts a partial state patch into query params for `router.navigate` with
 * `queryParamsHandling: 'merge'`. Default values become `null`, which removes
 * them from the URL.
 */
export function toQueryParams(
  patch: Record<string, string | number | null | undefined>,
  defaults: Record<string, string | number>,
): Record<string, string | number | null> {
  const params: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(patch)) {
    params[key] = value === undefined || value === '' || value === defaults[key] ? null : value;
  }
  return params;
}
