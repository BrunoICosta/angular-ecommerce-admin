import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

import { UsersService } from './data-access/users.service';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.users',
    providers: [UsersService, provideTranslocoScope('users')],
    loadComponent: () =>
      import('./pages/user-list-page/user-list-page.component').then(
        (m) => m.UserListPageComponent,
      ),
  },
];
