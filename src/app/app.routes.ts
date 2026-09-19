import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';
import { ShellComponent } from './core/layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        data: { breadcrumb: 'Dashboard' },
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'products',
        data: { breadcrumb: 'Produtos' },
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: 'forbidden',
        data: { breadcrumb: 'Acesso negado' },
        loadChildren: () =>
          import('./features/errors/errors.routes').then((m) => m.FORBIDDEN_ROUTES),
      },
      {
        path: '**',
        loadChildren: () =>
          import('./features/errors/errors.routes').then((m) => m.NOT_FOUND_ROUTES),
      },
    ],
  },
];
