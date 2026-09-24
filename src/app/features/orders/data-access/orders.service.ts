import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Order, OrderStatus, Page } from '@core/models';
import { toHttpParams } from '@shared/utils/http-params.util';

import { OrderQuery } from '../models/order-query.model';

/** Provided by ORDERS_ROUTES, so it ships with the orders chunk. */
@Injectable()
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'api/orders';

  list(query: OrderQuery): Observable<Page<Order>> {
    return this.http.get<Page<Order>>(this.baseUrl, { params: toHttpParams({ ...query }) });
  }

  get(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  /** The API validates the transition and appends the event to the order history. */
  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}`, { id, status });
  }
}
