import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { PRODUCT_CATEGORIES, Product, STOCK_STATUS_LABELS, StockStatus } from '@core/models';
import { NotificationService } from '@core/notifications/notification.service';
import { ConfirmService } from '@shared/components/confirm-dialog/confirm.service';
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

import { StockStatusChipComponent } from '../../components/stock-status-chip/stock-status-chip.component';
import { ProductsService } from '../../data-access/products.service';
import { ProductQuery, asCategory, asStockStatus } from '../../models/product-query.model';

const BASE_COLUMNS = ['product', 'category', 'price', 'stock', 'status', 'actions'];
const SORTABLE = ['name', 'sku', 'category', 'price', 'stock', 'createdAt'];
const DEFAULTS = { page: 1, size: PAGE_SIZE_OPTIONS[0], sort: 'name', dir: 'asc' };

@Component({
  selector: 'app-product-list-page',
  imports: [
    CurrencyPipe,
    MatCheckboxModule,
    StockStatusChipComponent,
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
  private readonly confirm = inject(ConfirmService);
  private readonly notifications = inject(NotificationService);

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
  protected readonly isAdmin = inject(AuthService).isAdmin;
  protected readonly columns = computed(() =>
    this.isAdmin() ? ['select', ...BASE_COLUMNS] : BASE_COLUMNS,
  );

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

  /** Selected ids on the current page; cleared whenever the query changes. */
  protected readonly selected = linkedSignal<ProductQuery, ReadonlySet<number>>({
    source: this.query,
    computation: () => new Set<number>(),
  });
  private readonly pageIds = computed(() => this.result()?.items.map((p) => p.id) ?? []);
  protected readonly allSelected = computed(
    () => this.pageIds().length > 0 && this.pageIds().every((id) => this.selected().has(id)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.pageIds().some((id) => this.selected().has(id)),
  );
  protected readonly deleting = signal(false);

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

  protected toggle(id: number): void {
    this.selected.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.pageIds()));
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected deleteProduct(product: Product): void {
    this.confirmAndDelete([product.id], `O produto "${product.name}" será excluído.`);
  }

  protected deleteSelected(): void {
    const ids = [...this.selected()];
    this.confirmAndDelete(ids, `${ids.length} produto(s) selecionado(s) serão excluídos.`);
  }

  private confirmAndDelete(ids: number[], message: string): void {
    this.confirm
      .confirm({
        title: ids.length === 1 ? 'Excluir produto?' : 'Excluir produtos?',
        message: `${message} Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        tone: 'danger',
        icon: 'delete',
      })
      .pipe(
        filter(Boolean),
        tap(() => this.deleting.set(true)),
        switchMap(() => this.productsApi.deleteMany(ids)),
        finalize(() => this.deleting.set(false)),
      )
      .subscribe(() => {
        this.notifications.success(
          ids.length === 1 ? 'Produto excluído.' : `${ids.length} produtos excluídos.`,
        );
        this.clearSelection();
        // If the whole page was removed, step back instead of showing an empty page.
        const { page } = this.query();
        if (page > 0 && ids.length >= this.pageIds().length) {
          this.navigate({ page });
        } else {
          this.products.reload();
        }
      });
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
