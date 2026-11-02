import { HttpClient, HttpXhrBackend } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';

/**
 * Loads `public/i18n/<lang>.json` and, for scopes, `public/i18n/<scope>/<lang>.json`.
 *
 * It uses its own HttpClient on top of the real XHR backend: translation files
 * are static assets, so they must skip the in-memory API (which replaces the
 * default HttpBackend) and the auth/error/loading interceptors.
 */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = new HttpClient(inject(HttpXhrBackend));

  getTranslation(path: string): Observable<Translation> {
    // Relative URL, so it works under the /angular-ecommerce-admin/ base href.
    return this.http.get<Translation>(`i18n/${path}.json`);
  }
}
