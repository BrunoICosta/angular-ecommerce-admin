import { User } from '../models';

export type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: SessionUser;
}

/** Demo accounts are public on purpose: they are shown on the login page. */
export const DEMO_PASSWORD = 'demo123';

export const DEMO_ACCOUNTS: readonly { email: string; descriptionKey: string }[] = [
  { email: 'admin@loja.com', descriptionKey: 'demoAdmin' },
  { email: 'manager@loja.com', descriptionKey: 'demoManager' },
];

/** Session length of the mocked token (8 hours). */
export const TOKEN_TTL_SECONDS = 8 * 60 * 60;
