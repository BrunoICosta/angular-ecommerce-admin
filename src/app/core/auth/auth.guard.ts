import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Lets authenticated users through; everyone else goes to the login page. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;

  // A user that is known but not authenticated means the token expired.
  const expired = auth.user() !== null;
  return inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url, ...(expired ? { expired: 1 } : {}) },
  });
};

/** Keeps signed-in users away from the login page. */
export const guestGuard: CanActivateFn = () =>
  inject(AuthService).isAuthenticated() ? inject(Router).createUrlTree(['/dashboard']) : true;
