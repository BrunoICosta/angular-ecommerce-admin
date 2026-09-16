import { Routes } from '@angular/router';

export const FORBIDDEN_ROUTES: Routes = [
  {
    path: '',
    title: 'Acesso negado · Loja Admin',
    loadComponent: () =>
      import('./pages/forbidden-page/forbidden-page.component').then(
        (m) => m.ForbiddenPageComponent,
      ),
  },
];

export const NOT_FOUND_ROUTES: Routes = [
  {
    path: '',
    title: 'Página não encontrada · Loja Admin',
    loadComponent: () =>
      import('./pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
];
