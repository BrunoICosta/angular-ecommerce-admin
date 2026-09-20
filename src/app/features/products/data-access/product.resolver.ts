import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { Product } from '@core/models';

import { ProductsService } from './products.service';

/** Loads the product before the edit page renders; unknown ids go back to the list. */
export const productResolver: ResolveFn<Product> = (route) => {
  const router = inject(Router);
  return inject(ProductsService)
    .get(Number(route.paramMap.get('id')))
    .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/products')))));
};
