export const PRODUCT_CATEGORIES = [
  'Eletrônicos',
  'Informática',
  'Casa e Cozinha',
  'Moda',
  'Esportes',
  'Beleza',
  'Livros',
  'Brinquedos',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  /** Stock level at or below which the product is flagged as "low stock". */
  minStock: number;
  imageUrl: string;
  active: boolean;
  createdAt: string;
}

export type ProductDraft = Omit<Product, 'id' | 'createdAt'>;

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function stockStatus(product: Pick<Product, 'stock' | 'minStock'>): StockStatus {
  if (product.stock <= 0) return 'out_of_stock';
  if (product.stock <= product.minStock) return 'low_stock';
  return 'in_stock';
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: 'Em estoque',
  low_stock: 'Estoque baixo',
  out_of_stock: 'Esgotado',
};
