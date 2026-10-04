import { createMockToken, decodeToken, isExpired } from './jwt.util';

describe('jwt.util', () => {
  const claims = {
    sub: 7,
    name: 'Joana Araújo',
    email: 'joana@loja.com',
    role: 'manager' as const,
  };

  it('round-trips the claims, including non-ASCII characters', () => {
    const token = createMockToken(claims, 60, Date.UTC(2026, 0, 1));
    expect(token.split('.').length).toBe(3);
    expect(decodeToken(token)).toEqual({
      ...claims,
      iat: Date.UTC(2026, 0, 1) / 1000,
      exp: Date.UTC(2026, 0, 1) / 1000 + 60,
    });
  });

  it('produces URL-safe segments', () => {
    expect(createMockToken(claims, 60)).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  it('rejects malformed tokens', () => {
    expect(decodeToken('not-a-token')).toBeNull();
    expect(decodeToken('a.b.c')).toBeNull();
    expect(decodeToken(`x.${btoa(JSON.stringify({ sub: 1 }))}.y`)).toBeNull();
  });

  it('detects expiration', () => {
    const now = Date.UTC(2026, 0, 1);
    const payload = decodeToken(createMockToken(claims, 60, now));
    expect(payload).not.toBeNull();
    expect(isExpired(payload!, now + 59_000)).toBeFalse();
    expect(isExpired(payload!, now + 60_000)).toBeTrue();
  });
});
