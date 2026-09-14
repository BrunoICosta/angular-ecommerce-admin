import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Set on requests whose errors are handled (and shown) by the caller itself. */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Set on background requests that should not drive the global loading bar. */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export function silentErrors(context = new HttpContext()): HttpContext {
  return context.set(SKIP_ERROR_TOAST, true);
}
