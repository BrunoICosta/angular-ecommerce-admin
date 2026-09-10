export type SortDirection = 'asc' | 'desc';

export interface PageRequest {
  page: number;
  pageSize: number;
  sort?: string;
  direction?: SortDirection;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
