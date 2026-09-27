import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { CustomerWithStats } from '@core/models';

import { CustomersService } from './customers.service';

export const customerResolver: ResolveFn<CustomerWithStats> = (route) => {
  const router = inject(Router);
  return inject(CustomersService)
    .get(Number(route.paramMap.get('id')))
    .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/customers')))));
};
