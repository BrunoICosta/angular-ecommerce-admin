import { Routes } from '@angular/router';

import { CustomerWithStats } from '@core/models';
import { provideI18nPaginatorIntl } from '@shared/i18n/paginator-intl';

import { customerResolver } from './data-access/customer.resolver';
import { CustomersService } from './data-access/customers.service';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    providers: [CustomersService, provideI18nPaginatorIntl()],
    children: [
      {
        path: '',
        title: 'titles.customers',
        loadComponent: () =>
          import('./pages/customer-list-page/customer-list-page.component').then(
            (m) => m.CustomerListPageComponent,
          ),
      },
      {
        path: ':id',
        title: 'titles.customerDetail',
        resolve: { customer: customerResolver },
        data: {
          breadcrumb: (data: { customer?: CustomerWithStats }) => data.customer?.name ?? '',
        },
        loadComponent: () =>
          import('./pages/customer-detail-page/customer-detail-page.component').then(
            (m) => m.CustomerDetailPageComponent,
          ),
      },
    ],
  },
];
