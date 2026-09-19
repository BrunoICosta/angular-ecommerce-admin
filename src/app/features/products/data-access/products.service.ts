import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Page, Product } from '@core/models';
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
}
