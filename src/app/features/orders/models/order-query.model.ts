import { ORDER_STATUSES, OrderStatus, SortDirection } from '@core/models';

export interface OrderQuery {
  /** 0-based, as expected by the API. */
  page: number;
  pageSize: number;
  sort: string;
  dir: SortDirection;
  q: string;
  status: OrderStatus | '';
}

export function asOrderStatus(value: string | undefined): OrderStatus | '' {
  return (ORDER_STATUSES as readonly string[]).includes(value ?? '') ? (value as OrderStatus) : '';
}
