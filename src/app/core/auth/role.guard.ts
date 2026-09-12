import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { Role } from '../models';
import { AuthService } from './auth.service';

/**
 * Restricts a route to the given roles. Used as `canMatch`, so the lazy chunk
 * of a forbidden feature is not even downloaded.
 */
export function roleGuard(...roles: Role[]): CanMatchFn {
  return () =>
    inject(AuthService).hasRole(...roles) ? true : inject(Router).createUrlTree(['/forbidden']);
}
