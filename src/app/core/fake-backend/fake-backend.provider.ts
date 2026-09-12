import { XhrFactory } from '@angular/common';
import {
  HttpBackend,
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { EnvironmentProviders, Injectable, inject, makeEnvironmentProviders } from '@angular/core';
import {
  HttpClientBackendService,
  InMemoryBackendConfig,
  InMemoryBackendConfigArgs,
  InMemoryDbService,
  ResponseOptions,
} from 'angular-in-memory-web-api';
import { Observable, catchError, throwError } from 'rxjs';

import { FakeApiService } from './fake-api.service';

export const FAKE_BACKEND_CONFIG: InMemoryBackendConfigArgs = {
  apiBase: 'api/',
  delay: 350,
  post204: false,
  put204: false,
  passThruUnknownUrl: false,
};

function isResponseOptions(value: unknown): value is ResponseOptions {
  return typeof value === 'object' && value !== null && 'status' in value;
}

/**
 * The in-memory backend rejects with plain `ResponseOptions` objects. A real
 * `HttpBackend` rejects with `HttpErrorResponse`, so we normalise errors here
 * and the rest of the app (interceptors, components) stays backend-agnostic.
 */
@Injectable()
export class FakeHttpBackend extends HttpClientBackendService {
  constructor() {
    super(inject(InMemoryDbService), inject(InMemoryBackendConfig), inject(XhrFactory));
  }

  override handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    return super.handle(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) return throwError(() => error);
        const options: ResponseOptions = isResponseOptions(error)
          ? error
          : { status: 500, body: { error: String(error) } };
        return throwError(
          () =>
            new HttpErrorResponse({
              status: options.status,
              statusText: options.statusText,
              error: options.body,
              headers: options.headers instanceof HttpHeaders ? options.headers : undefined,
              url: options.url ?? req.urlWithParams,
            }),
        );
      }),
    );
  }
}

export function provideFakeBackend(
  config: InMemoryBackendConfigArgs = FAKE_BACKEND_CONFIG,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: InMemoryDbService, useClass: FakeApiService },
    { provide: InMemoryBackendConfig, useValue: config },
    { provide: HttpBackend, useClass: FakeHttpBackend },
  ]);
}
