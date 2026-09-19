import { Routes } from '@angular/router';

import { ProductsService } from './data-access/products.service';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [ProductsService],
    children: [
      {
        path: '',
        title: 'Produtos · Loja Admin',
        loadComponent: () =>
          import('./pages/product-list-page/product-list-page.component').then(
            (m) => m.ProductListPageComponent,
          ),
      },
    ],
  },
];
