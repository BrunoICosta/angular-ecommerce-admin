import { Routes } from '@angular/router';

export const FORBIDDEN_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.forbidden',
    loadComponent: () =>
      import('./pages/forbidden-page/forbidden-page.component').then(
        (m) => m.ForbiddenPageComponent,
      ),
  },
];

export const NOT_FOUND_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.notFound',
    loadComponent: () =>
      import('./pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
];
