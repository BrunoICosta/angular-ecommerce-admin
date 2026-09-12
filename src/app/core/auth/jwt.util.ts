import { Role } from '../models';

/** Claims carried by the (mocked) access token. */
export interface JwtPayload {
  sub: number;
  name: string;
  email: string;
  role: Role;
  /** Issued at, in seconds since epoch. */
  iat: number;
  /** Expiration, in seconds since epoch. */
  exp: number;
}

const HEADER = { alg: 'HS256', typ: 'JWT' };

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

/**
 * Creates a JWT-shaped token. The signature is a fixed marker: this is a demo
 * without a real server, so the token is never trusted for anything security
 * related; it only carries the session claims for the fake API and the UI.
 */
export function createMockToken(
  claims: Omit<JwtPayload, 'iat' | 'exp'>,
  ttlSeconds: number,
  now = Date.now(),
): string {
  const iat = Math.floor(now / 1000);
  const payload: JwtPayload = { ...claims, iat, exp: iat + ttlSeconds };
  return [
    base64UrlEncode(JSON.stringify(HEADER)),
    base64UrlEncode(JSON.stringify(payload)),
    base64UrlEncode('mock-signature'),
  ].join('.');
}

function isPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['sub'] === 'number' &&
    typeof candidate['email'] === 'string' &&
    (candidate['role'] === 'admin' || candidate['role'] === 'manager') &&
    typeof candidate['exp'] === 'number'
  );
}

/** Returns the token claims, or `null` when the token is malformed. */
export function decodeToken(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload: unknown = JSON.parse(base64UrlDecode(parts[1]));
    return isPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function isExpired(payload: Pick<JwtPayload, 'exp'>, now = Date.now()): boolean {
  return payload.exp * 1000 <= now;
}
