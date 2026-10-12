import { Role } from '../models';

export interface NavItem {
  /** Translation key. */
  label: string;
  icon: string;
  path: string;
  /** Roles allowed to see the item. Omitted means every signed-in user. */
  roles?: Role[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'nav.dashboard', icon: 'space_dashboard', path: '/dashboard' },
  { label: 'nav.products', icon: 'inventory_2', path: '/products' },
  { label: 'nav.orders', icon: 'receipt_long', path: '/orders' },
  { label: 'nav.customers', icon: 'group', path: '/customers' },
  { label: 'nav.users', icon: 'manage_accounts', path: '/users', roles: ['admin'] },
];
