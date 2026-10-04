import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Route,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { Role } from '../models';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('route guards', () => {
  let auth: { isAuthenticated: jasmine.Spy; user: jasmine.Spy; hasRole: jasmine.Spy };

  beforeEach(() => {
    auth = {
      isAuthenticated: jasmine.createSpy().and.returnValue(false),
      user: jasmine.createSpy().and.returnValue(null),
      hasRole: jasmine.createSpy().and.returnValue(false),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  const state = { url: '/orders?status=paid' } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  const run = <T>(fn: () => T) => TestBed.runInInjectionContext(fn);
  const serialize = (tree: unknown) => (tree as UrlTree).toString();

  it('authGuard lets authenticated users in', () => {
    auth.isAuthenticated.and.returnValue(true);
    expect(run(() => authGuard(route, state))).toBeTrue();
  });

  it('authGuard redirects guests to login keeping the return url', () => {
    const result = run(() => authGuard(route, state));
    expect(serialize(result)).toBe('/login?returnUrl=%2Forders%3Fstatus%3Dpaid');
  });

  it('authGuard flags an expired session', () => {
    auth.user.and.returnValue({ id: 1 });
    const result = run(() => authGuard(route, state));
    expect(serialize(result)).toContain('expired=1');
  });

  it('guestGuard sends signed-in users to the dashboard', () => {
    auth.isAuthenticated.and.returnValue(true);
    expect(serialize(run(() => guestGuard(route, state)))).toBe('/dashboard');
  });

  it('roleGuard only matches the allowed roles', () => {
    const guard = roleGuard('admin');
    auth.hasRole.and.callFake((...roles: Role[]) => roles.includes('admin'));
    expect(run(() => guard({} as Route, [] as UrlSegment[]))).toBeTrue();

    auth.hasRole.and.returnValue(false);
    expect(serialize(run(() => guard({} as Route, [] as UrlSegment[])))).toBe('/forbidden');
  });
});
