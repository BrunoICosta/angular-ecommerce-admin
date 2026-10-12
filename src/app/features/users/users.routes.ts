import { Routes } from '@angular/router';

import { UsersService } from './data-access/users.service';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.users',
    providers: [UsersService],
    loadComponent: () =>
      import('./pages/user-list-page/user-list-page.component').then(
        (m) => m.UserListPageComponent,
      ),
  },
];
