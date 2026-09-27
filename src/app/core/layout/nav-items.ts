import { Role } from '../models';

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  /** Roles allowed to see the item. Omitted means every signed-in user. */
  roles?: Role[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', icon: 'space_dashboard', path: '/dashboard' },
  { label: 'Produtos', icon: 'inventory_2', path: '/products' },
  { label: 'Pedidos', icon: 'receipt_long', path: '/orders' },
  { label: 'Clientes', icon: 'group', path: '/customers' },
];
