import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { Page, Product, ProductDraft } from '@core/models';
import { toHttpParams } from '@shared/utils/http-params.util';

import { ProductQuery } from '../models/product-query.model';

/** Provided by PRODUCTS_ROUTES, so it ships with the products chunk. */
@Injectable()
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'api/products';

  list(query: ProductQuery): Observable<Page<Product>> {
    return this.http.get<Page<Product>>(this.baseUrl, { params: toHttpParams({ ...query }) });
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(draft: ProductDraft): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, draft);
  }

  update(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${product.id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** The API has no bulk endpoint, so deletions run in parallel. */
  deleteMany(ids: readonly number[]): Observable<void> {
    return forkJoin(ids.map((id) => this.delete(id))).pipe(map(() => undefined));
  }
}
