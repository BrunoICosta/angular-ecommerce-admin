import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { Order } from '@core/models';

import { OrdersService } from './orders.service';

export const orderResolver: ResolveFn<Order> = (route) => {
  const router = inject(Router);
  return inject(OrdersService)
    .get(Number(route.paramMap.get('id')))
    .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/orders')))));
};
