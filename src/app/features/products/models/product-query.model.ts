import { PRODUCT_CATEGORIES, ProductCategory, SortDirection, StockStatus } from '@core/models';

export interface ProductQuery {
  /** 0-based, as expected by the API. */
  page: number;
  pageSize: number;
  sort: string;
  dir: SortDirection;
  q: string;
  category: ProductCategory | '';
  stock: StockStatus | '';
}

export function asCategory(value: string | undefined): ProductCategory | '' {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value ?? '')
    ? (value as ProductCategory)
    : '';
}

export function asStockStatus(value: string | undefined): StockStatus | '' {
  return value === 'in_stock' || value === 'low_stock' || value === 'out_of_stock' ? value : '';
}
