import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

import { pendingChangesGuard } from '@core/guards/pending-changes.guard';
import { Product } from '@core/models';
import { provideI18nPaginatorIntl } from '@shared/i18n/paginator-intl';

import { productResolver } from './data-access/product.resolver';
import { ProductsService } from './data-access/products.service';

const loadFormPage = () =>
  import('./pages/product-form-page/product-form-page.component').then(
    (m) => m.ProductFormPageComponent,
  );

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [ProductsService, provideI18nPaginatorIntl(), provideTranslocoScope('products')],
    children: [
      {
        path: '',
        title: 'titles.products',
        loadComponent: () =>
          import('./pages/product-list-page/product-list-page.component').then(
            (m) => m.ProductListPageComponent,
          ),
      },
      {
        path: 'new',
        title: 'titles.productNew',
        data: { breadcrumb: 'nav.newProduct' },
        canDeactivate: [pendingChangesGuard],
        loadComponent: loadFormPage,
      },
      {
        path: ':id/edit',
        title: 'titles.productEdit',
        resolve: { product: productResolver },
        canDeactivate: [pendingChangesGuard],
        data: { breadcrumb: (data: { product?: Product }) => data.product?.name ?? '' },
        loadComponent: loadFormPage,
      },
    ],
  },
];
