import { BRAZILIAN_STATES, SortDirection } from '@core/models';

export interface CustomerQuery {
  /** 0-based, as expected by the API. */
  page: number;
  pageSize: number;
  sort: string;
  dir: SortDirection;
  q: string;
  state: string;
}

export function asState(value: string | undefined): string {
  const upper = value?.toUpperCase() ?? '';
  return (BRAZILIAN_STATES as readonly string[]).includes(upper) ? upper : '';
}
