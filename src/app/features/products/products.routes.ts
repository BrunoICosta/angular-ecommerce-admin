import { Routes } from '@angular/router';

import { pendingChangesGuard } from '@core/guards/pending-changes.guard';
import { Product } from '@core/models';
import { providePtBrPaginatorIntl } from '@shared/i18n/paginator-intl';

import { productResolver } from './data-access/product.resolver';
import { ProductsService } from './data-access/products.service';

const loadFormPage = () =>
  import('./pages/product-form-page/product-form-page.component').then(
    (m) => m.ProductFormPageComponent,
  );

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [ProductsService, providePtBrPaginatorIntl()],
    children: [
      {
        path: '',
        title: 'Produtos · Loja Admin',
        loadComponent: () =>
          import('./pages/product-list-page/product-list-page.component').then(
            (m) => m.ProductListPageComponent,
          ),
      },
      {
        path: 'new',
        title: 'Novo produto · Loja Admin',
        data: { breadcrumb: 'Novo produto' },
        canDeactivate: [pendingChangesGuard],
        loadComponent: loadFormPage,
      },
      {
        path: ':id/edit',
        title: 'Editar produto · Loja Admin',
        resolve: { product: productResolver },
        canDeactivate: [pendingChangesGuard],
        data: { breadcrumb: (data: { product?: Product }) => data.product?.name ?? 'Editar' },
        loadComponent: loadFormPage,
      },
    ],
  },
];
