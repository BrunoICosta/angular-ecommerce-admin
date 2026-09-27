import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CustomerWithStats, Order, Page } from '@core/models';
import { toHttpParams } from '@shared/utils/http-params.util';

import { CustomerQuery } from '../models/customer-query.model';

/** Provided by CUSTOMERS_ROUTES, so it ships with the customers chunk. */
@Injectable()
export class CustomersService {
  private readonly http = inject(HttpClient);

  list(query: CustomerQuery): Observable<Page<CustomerWithStats>> {
    return this.http.get<Page<CustomerWithStats>>('api/customers', {
      params: toHttpParams({ ...query }),
    });
  }

  get(id: number): Observable<CustomerWithStats> {
    return this.http.get<CustomerWithStats>(`api/customers/${id}`);
  }

  /** Full order history of a customer, newest first. */
  orders(customerId: number): Observable<Order[]> {
    const params = toHttpParams({ customerId, pageSize: 100, sort: 'createdAt', dir: 'desc' });
    return this.http.get<Page<Order>>('api/orders', { params }).pipe(map((page) => page.items));
  }
}
