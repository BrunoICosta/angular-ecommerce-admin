import { Page, SortDirection } from '../core/models';

export interface ListQuery {
  page: number;
  pageSize: number;
  sort: string | null;
  direction: SortDirection;
  search: string;
  params: Map<string, string[]>;
}

export type ItemFilter<T> = (item: T, value: string) => boolean;

export interface ListOptions<T> {
  /** Fields matched (case and accent insensitive) against the `q` parameter. */
  searchFields: (keyof T & string)[];
  /** Extra filters, keyed by query parameter name. Empty values are ignored. */
  filters?: Record<string, ItemFilter<T>>;
  /** Fields that may be used to sort. Anything else is ignored. */
  sortable: (keyof T & string)[];
  defaultSort?: { field: keyof T & string; direction: SortDirection };
}

const MAX_PAGE_SIZE = 100;

function first(params: Map<string, string[]>, key: string): string {
  return params.get(key)?.[0]?.trim() ?? '';
}

export function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function parseListQuery(params: Map<string, string[]>): ListQuery {
  const page = Number.parseInt(first(params, 'page'), 10);
  const pageSize = Number.parseInt(first(params, 'pageSize'), 10);
  return {
    page: Number.isFinite(page) && page >= 0 ? page : 0,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? Math.min(pageSize, MAX_PAGE_SIZE) : 10,
    sort: first(params, 'sort') || null,
    direction: first(params, 'dir') === 'desc' ? 'desc' : 'asc',
    search: normalize(first(params, 'q')),
    params,
  };
}

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/**
 * Filters, sorts and paginates a collection the way a REST API would, so the UI
 * can be written against "server-side" pagination even with a fake backend.
 */
export function applyListQuery<T extends object>(
  items: readonly T[],
  query: ListQuery,
  options: ListOptions<T>,
): Page<T> {
  let result = [...items];

  if (query.search) {
    result = result.filter((item) =>
      options.searchFields.some((field) =>
        normalize(String(item[field] ?? '')).includes(query.search),
      ),
    );
  }

  for (const [param, filter] of Object.entries(options.filters ?? {})) {
    const value = first(query.params, param);
    if (value) result = result.filter((item) => filter(item, value));
  }

  const requested = (options.sortable as string[]).includes(query.sort ?? '');
  const sortField = requested ? (query.sort as keyof T & string) : options.defaultSort?.field;
  const direction = requested ? query.direction : (options.defaultSort?.direction ?? 'asc');

  if (sortField) {
    const factor = direction === 'desc' ? -1 : 1;
    result.sort((a, b) => {
      const left = a[sortField];
      const right = b[sortField];
      // Missing values always go last, regardless of the direction.
      if (left == null || right == null) return compareValues(left, right);
      return factor * compareValues(left, right);
    });
  }

  const start = query.page * query.pageSize;
  return {
    items: result.slice(start, start + query.pageSize),
    total: result.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}
