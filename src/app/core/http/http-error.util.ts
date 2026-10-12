import { HttpErrorResponse } from '@angular/common/http';
import { TranslationParams } from '../i18n/i18n.model';

import { ApiError } from '../models';

export type Translate = (key: string, params?: TranslationParams) => string;

const KNOWN_STATUSES = [0, 400, 401, 403, 404, 409, 422];

function isApiError(body: unknown): body is ApiError {
  return typeof body === 'object' && body !== null && 'error' in body;
}

/**
 * Turns any HTTP failure into a message for the user, in the active language:
 * a known API error code wins, then the HTTP status, then a generic message.
 */
export function httpErrorMessage(error: unknown, translate: Translate): string {
  if (!(error instanceof HttpErrorResponse)) return translate('httpErrors.unexpected');

  const body: unknown = error.error;
  if (isApiError(body)) {
    if (body.code) {
      const key = `apiErrors.${body.code}`;
      const translated = translate(key, body.params);
      if (translated !== key) return translated;
    }
    if (typeof body.error === 'string') return body.error;
  }
  if (error.status >= 500) return translate('httpErrors.500');
  return KNOWN_STATUSES.includes(error.status)
    ? translate(`httpErrors.${error.status}`)
    : translate('httpErrors.unexpected');
}
