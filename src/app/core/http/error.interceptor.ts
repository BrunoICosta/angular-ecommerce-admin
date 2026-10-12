import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { TranslocoService } from '@jsverse/transloco';

import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notifications/notification.service';
import { SKIP_ERROR_TOAST } from './http-context.tokens';
import { httpErrorMessage } from './http-error.util';

/**
 * Global HTTP error handling: an expired session sends the user back to the
 * login page; any other failure is reported in a snackbar, unless the caller
 * opted out with the SKIP_ERROR_TOAST context token. Errors are re-thrown so
 * callers can still react (e.g. reset a loading flag).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);
  const transloco = inject(TranslocoService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const sessionExpired =
        error instanceof HttpErrorResponse && error.status === 401 && auth.accessToken() !== null;

      if (sessionExpired) {
        auth.logout('expired');
        notifications.info(transloco.translate('session.expired'));
      } else if (!req.context.get(SKIP_ERROR_TOAST)) {
        notifications.error(
          httpErrorMessage(error, (key, params) => transloco.translate(key, params)),
        );
      }
      return throwError(() => error);
    }),
  );
};
