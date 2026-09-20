import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PRODUCT_CATEGORIES, STOCK_STATUS_LABELS, StockStatus } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  PAGE_SIZE_OPTIONS,
  toDirection,
  toPageSize,
  toPositiveInt,
  toQueryParams,
} from '@shared/utils/list-query.util';
import { latestValue } from '@shared/utils/resource.util';

import { ProductsService } from '../../data-access/products.service';
import { ProductQuery, asCategory, asStockStatus } from '../../models/product-query.model';

const SORTABLE = ['name', 'sku', 'category', 'price', 'stock', 'createdAt'];
const DEFAULTS = { page: 1, size: PAGE_SIZE_OPTIONS[0], sort: 'name', dir: 'asc' };

@Component({
  selector: 'app-product-list-page',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    ErrorStateComponent,
    PageHeaderComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent {
  private readonly productsApi = inject(ProductsService);
  private readonly router = inject(Router);

  // Query params, bound by withComponentInputBinding(). The URL is the single
  // source of truth for the list state: links, refresh and back button work.
  readonly page = input<string>();
  readonly size = input<string>();
  readonly sort = input<string>();
  readonly dir = input<string>();
  readonly q = input<string>();
  readonly category = input<string>();
  readonly stock = input<string>();

  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly stockOptions = Object.entries(STOCK_STATUS_LABELS) as [StockStatus, string][];
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly columns = ['product', 'category', 'price', 'stock', 'actions'];

  protected readonly query = computed<ProductQuery>(() => {
    const sort = this.sort();
    return {
      page: toPositiveInt(this.page(), 1) - 1,
      pageSize: toPageSize(this.size()),
      sort: sort && SORTABLE.includes(sort) ? sort : DEFAULTS.sort,
      dir: toDirection(this.dir(), 'asc'),
      q: this.q()?.trim() ?? '',
      category: asCategory(this.category()),
      stock: asStockStatus(this.stock()),
    };
  });

  protected readonly products = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.productsApi.list(params),
  });
  protected readonly result = latestValue(this.products);
  protected readonly hasFilters = computed(() => {
    const { q, category, stock } = this.query();
    return Boolean(q || category || stock);
  });

  protected readonly search = new FormControl('', { nonNullable: true });

  constructor() {
    // Keep the search box in sync when the URL changes (e.g. back button).
    effect(() => {
      const q = this.q() ?? '';
      if (this.search.value !== q) this.search.setValue(q, { emitEvent: false });
    });

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => this.navigate({ q: q.trim(), page: null }));
  }

  protected onSort(sort: Sort): void {
    this.navigate({
      sort: sort.direction ? sort.active : null,
      dir: sort.direction || null,
      page: null,
    });
  }

  protected onPage(event: PageEvent): void {
    this.navigate({ page: event.pageIndex + 1, size: event.pageSize });
  }

  protected onCategory(category: string): void {
    this.navigate({ category, page: null });
  }

  protected onStock(stock: string): void {
    this.navigate({ stock, page: null });
  }

  protected clearFilters(): void {
    this.navigate({ q: null, category: null, stock: null, page: null });
  }

  private navigate(patch: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      queryParams: toQueryParams(patch, DEFAULTS),
      queryParamsHandling: 'merge',
    });
  }
}
