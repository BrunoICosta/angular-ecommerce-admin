export type Role = 'admin' | 'manager';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt: string | null;
}
