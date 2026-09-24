import { Routes } from '@angular/router';

import { OrdersService } from './data-access/orders.service';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    providers: [OrdersService],
    children: [
      {
        path: '',
        title: 'Pedidos · Loja Admin',
        loadComponent: () =>
          import('./pages/order-list-page/order-list-page.component').then(
            (m) => m.OrderListPageComponent,
          ),
      },
    ],
  },
];
