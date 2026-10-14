import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { provideFakeBackend } from './core/fake-backend/fake-backend.provider';
import { errorInterceptor } from './core/http/error.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { provideI18n } from './core/i18n/i18n.providers';

// Dates, numbers and currency are formatted with Intl through Transloco Locale,
// following the active language, so no Angular locale data is registered.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor])),
    // Must come after provideHttpClient(): it replaces the HttpBackend.
    provideFakeBackend(),
    provideI18n(),
  ],
};
