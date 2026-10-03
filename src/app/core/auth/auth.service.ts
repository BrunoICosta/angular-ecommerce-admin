import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { silentErrors } from '../http/http-context.tokens';
import { Role } from '../models';
import { LoginRequest, LoginResponse, SessionUser } from './auth.model';
import { decodeToken, isExpired } from './jwt.util';

export const TOKEN_STORAGE_KEY = 'loja-admin.token';

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session then lives in memory only.
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly token = signal<string | null>(readStoredToken());

  readonly accessToken = this.token.asReadonly();

  private readonly claims = computed(() => {
    const token = this.token();
    return token ? decodeToken(token) : null;
  });

  readonly user = computed<SessionUser | null>(() => {
    const claims = this.claims();
    return claims
      ? { id: claims.sub, name: claims.name, email: claims.email, role: claims.role }
      : null;
  });

  readonly role = computed<Role | null>(() => this.user()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'admin');

  /** Checked on demand (not a signal) because expiration depends on the clock. */
  isAuthenticated(): boolean {
    const claims = this.claims();
    return claims !== null && !isExpired(claims);
  }

  hasRole(...roles: Role[]): boolean {
    const role = this.role();
    return role !== null && roles.includes(role);
  }

  login(credentials: LoginRequest): Observable<SessionUser> {
    return (
      this.http
        // The login page shows the error inline, so no global snackbar here.
        .post<LoginResponse>('api/auth/login', credentials, { context: silentErrors() })
        .pipe(
          tap(({ token }) => this.setToken(token)),
          map(({ user }) => user),
        )
    );
  }

  /**
   * Ends the session. When it expired, the current page is kept as `returnUrl`
   * so the user lands back where they were after signing in again.
   */
  logout(reason?: 'expired'): void {
    if (this.token() === null) return;
    const returnUrl = this.router.url;
    this.setToken(null);
    void this.router.navigate(['/login'], {
      queryParams:
        reason === 'expired' && !returnUrl.startsWith('/login') ? { expired: 1, returnUrl } : {},
    });
  }

  private setToken(token: string | null): void {
    storeToken(token);
    this.token.set(token);
  }
}
