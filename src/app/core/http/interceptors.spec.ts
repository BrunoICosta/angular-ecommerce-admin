import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { authInterceptor } from '../auth/auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notifications/notification.service';
import { errorInterceptor } from './error.interceptor';
import { SKIP_LOADING, silentErrors } from './http-context.tokens';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from './loading.service';

describe('HTTP interceptors', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let loading: LoadingService;
  const token = signal<string | null>('abc.def.ghi');
  const auth = { accessToken: token, logout: jasmine.createSpy('logout') };
  const notifications = jasmine.createSpyObj<NotificationService>('NotificationService', [
    'error',
    'info',
    'success',
  ]);

  beforeEach(() => {
    token.set('abc.def.ghi');
    auth.logout.calls.reset();
    notifications.error.calls.reset();
    notifications.info.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(
          withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor]),
        ),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
  });

  afterEach(() => backend.verify());

  it('adds the bearer token to API calls only', () => {
    http.get('api/products').subscribe();
    http.get('https://example.com/image.png').subscribe();

    expect(backend.expectOne('api/products').request.headers.get('Authorization')).toBe(
      'Bearer abc.def.ghi',
    );
    expect(
      backend.expectOne('https://example.com/image.png').request.headers.has('Authorization'),
    ).toBeFalse();
  });

  it('counts in-flight requests for the loading bar', () => {
    http.get('api/a').subscribe();
    http.get('api/b').subscribe({ error: () => undefined });
    http.get('api/c', { context: new HttpContext().set(SKIP_LOADING, true) }).subscribe();
    expect(loading.pendingRequests()).toBe(2);
    expect(loading.isLoading()).toBeTrue();

    backend.expectOne('api/a').flush({});
    backend.expectOne('api/b').flush('boom', { status: 500, statusText: 'Server Error' });
    backend.expectOne('api/c').flush({});
    expect(loading.pendingRequests()).toBe(0);
  });

  it('shows the API error message in a snackbar and re-throws', () => {
    let failed = false;
    http.delete('api/products/1').subscribe({ error: () => (failed = true) });
    backend
      .expectOne('api/products/1')
      .flush(
        { error: 'Você não tem permissão para esta ação.' },
        { status: 403, statusText: 'Forbidden' },
      );

    expect(failed).toBeTrue();
    expect(notifications.error).toHaveBeenCalledWith('Você não tem permissão para esta ação.');
  });

  it('logs out when the session expires', () => {
    http.get('api/orders').subscribe({ error: () => undefined });
    backend.expectOne('api/orders').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalledWith('expired');
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('stays silent when the caller handles the error', () => {
    token.set(null);
    http
      .post('api/auth/login', {}, { context: silentErrors() })
      .subscribe({ error: () => undefined });
    backend.expectOne('api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).not.toHaveBeenCalled();
    expect(notifications.error).not.toHaveBeenCalled();
  });
});
