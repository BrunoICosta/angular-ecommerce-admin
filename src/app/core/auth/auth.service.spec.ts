import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { SKIP_ERROR_TOAST } from '../http/http-context.tokens';
import { LoginResponse } from './auth.model';
import { AuthService, TOKEN_STORAGE_KEY } from './auth.service';
import { createMockToken } from './jwt.util';

describe('AuthService', () => {
  let http: HttpTestingController;
  const user = { id: 1, name: 'Bruno Costa', email: 'admin@loja.com', role: 'admin' as const };

  function setup(): AuthService {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    return TestBed.inject(AuthService);
  }

  beforeEach(() => localStorage.removeItem(TOKEN_STORAGE_KEY));
  afterEach(() => {
    http.verify();
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  });

  it('starts signed out without a stored token', () => {
    const auth = setup();
    expect(auth.user()).toBeNull();
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('stores the token and exposes the user after login', () => {
    const auth = setup();
    const token = createMockToken(
      { sub: 1, name: user.name, email: user.email, role: 'admin' },
      60,
    );
    let result: unknown;

    auth.login({ email: user.email, password: 'demo123' }).subscribe((u) => (result = u));
    const req = http.expectOne('api/auth/login');
    expect(req.request.context.get(SKIP_ERROR_TOAST)).toBeTrue();
    req.flush({ token, user } satisfies LoginResponse);

    expect(result).toEqual(user);
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(token);
    expect(auth.user()).toEqual(user);
    expect(auth.isAdmin()).toBeTrue();
    expect(auth.hasRole('manager')).toBeFalse();
  });

  it('restores the session from storage', () => {
    const token = createMockToken(
      { sub: 2, name: 'Marina', email: 'm@loja.com', role: 'manager' },
      60,
    );
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    const auth = setup();
    expect(auth.isAuthenticated()).toBeTrue();
    expect(auth.role()).toBe('manager');
  });

  it('treats an expired token as signed out', () => {
    const token = createMockToken(
      { sub: 2, name: 'Marina', email: 'm@loja.com', role: 'manager' },
      60,
      Date.now() - 120_000,
    );
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    expect(setup().isAuthenticated()).toBeFalse();
  });

  it('clears the session and goes to the login page on logout', () => {
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      createMockToken({ sub: 1, name: user.name, email: user.email, role: 'admin' }, 60),
    );
    const auth = setup();
    auth.logout('expired');

    expect(auth.user()).toBeNull();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { expired: 1, returnUrl: '/' },
    });
  });
});
