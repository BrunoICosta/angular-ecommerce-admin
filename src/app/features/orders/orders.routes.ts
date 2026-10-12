import { Routes } from '@angular/router';

import { Order } from '@core/models';
import { provideI18nPaginatorIntl } from '@shared/i18n/paginator-intl';

import { orderResolver } from './data-access/order.resolver';
import { OrdersService } from './data-access/orders.service';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    providers: [OrdersService, provideI18nPaginatorIntl()],
    children: [
      {
        path: '',
        title: 'titles.orders',
        loadComponent: () =>
          import('./pages/order-list-page/order-list-page.component').then(
            (m) => m.OrderListPageComponent,
          ),
      },
      {
        path: ':id',
        title: 'titles.orderDetail',
        resolve: { order: orderResolver },
        data: { breadcrumb: (data: { order?: Order }) => data.order?.number ?? '' },
        loadComponent: () =>
          import('./pages/order-detail-page/order-detail-page.component').then(
            (m) => m.OrderDetailPageComponent,
          ),
      },
    ],
  },
];
