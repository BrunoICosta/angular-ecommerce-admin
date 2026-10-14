export type Role = 'admin' | 'manager';

export const ROLES: readonly Role[] = ['admin', 'manager'];

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt: string | null;
}
