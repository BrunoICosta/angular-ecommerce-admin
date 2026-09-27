import { Routes } from '@angular/router';

import { CustomerWithStats } from '@core/models';

import { customerResolver } from './data-access/customer.resolver';
import { CustomersService } from './data-access/customers.service';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    providers: [CustomersService],
    children: [
      {
        path: '',
        title: 'Clientes · Loja Admin',
        loadComponent: () =>
          import('./pages/customer-list-page/customer-list-page.component').then(
            (m) => m.CustomerListPageComponent,
          ),
      },
      {
        path: ':id',
        title: 'Cliente · Loja Admin',
        resolve: { customer: customerResolver },
        data: {
          breadcrumb: (data: { customer?: CustomerWithStats }) => data.customer?.name ?? 'Cliente',
        },
        loadComponent: () =>
          import('./pages/customer-detail-page/customer-detail-page.component').then(
            (m) => m.CustomerDetailPageComponent,
          ),
      },
    ],
  },
];
