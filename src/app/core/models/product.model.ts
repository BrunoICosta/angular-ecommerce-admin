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

export const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock'] as const;

export type StockStatus = (typeof STOCK_STATUSES)[number];

export function stockStatus(product: Pick<Product, 'stock' | 'minStock'>): StockStatus {
  if (product.stock <= 0) return 'out_of_stock';
  if (product.stock <= product.minStock) return 'low_stock';
  return 'in_stock';
}

/**
 * Categories are stored in pt-BR (that is how the API returns them); this maps
 * each one to its translation key under `enums.category`.
 */
const CATEGORY_KEYS: Record<ProductCategory, string> = {
  Eletrônicos: 'electronics',
  Informática: 'computers',
  'Casa e Cozinha': 'home',
  Moda: 'fashion',
  Esportes: 'sports',
  Beleza: 'beauty',
  Livros: 'books',
  Brinquedos: 'toys',
};

export function categoryKey(category: ProductCategory): string {
  return `enums.category.${CATEGORY_KEYS[category]}`;
}
