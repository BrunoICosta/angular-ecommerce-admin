import { Routes } from '@angular/router';

import { Order } from '@core/models';
import { providePtBrPaginatorIntl } from '@shared/i18n/paginator-intl';

import { orderResolver } from './data-access/order.resolver';
import { OrdersService } from './data-access/orders.service';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    providers: [OrdersService, providePtBrPaginatorIntl()],
    children: [
      {
        path: '',
        title: 'Pedidos · Loja Admin',
        loadComponent: () =>
          import('./pages/order-list-page/order-list-page.component').then(
            (m) => m.OrderListPageComponent,
          ),
      },
      {
        path: ':id',
        title: 'Detalhes do pedido · Loja Admin',
        resolve: { order: orderResolver },
        data: { breadcrumb: (data: { order?: Order }) => data.order?.number ?? 'Pedido' },
        loadComponent: () =>
          import('./pages/order-detail-page/order-detail-page.component').then(
            (m) => m.OrderDetailPageComponent,
          ),
      },
    ],
  },
];
