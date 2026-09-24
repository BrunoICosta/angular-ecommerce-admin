import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { OrderStatusChipComponent } from '@shared/components/order-status-chip/order-status-chip.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  PAGE_SIZE_OPTIONS,
  toDirection,
  toPageSize,
  toPositiveInt,
  toQueryParams,
} from '@shared/utils/list-query.util';
import { LabelPipe } from '@shared/pipes/label.pipe';
import { latestValue } from '@shared/utils/resource.util';

import { OrdersService } from '../../data-access/orders.service';
import { OrderQuery, asOrderStatus } from '../../models/order-query.model';

const SORTABLE = ['number', 'customerName', 'total', 'status', 'createdAt'];
const DEFAULTS = { page: 1, size: PAGE_SIZE_OPTIONS[0], sort: 'createdAt', dir: 'desc' };

@Component({
  selector: 'app-order-list-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    LabelPipe,
    ErrorStateComponent,
    OrderStatusChipComponent,
    PageHeaderComponent,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './order-list-page.component.html',
  styleUrl: './order-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListPageComponent {
  private readonly ordersApi = inject(OrdersService);
  private readonly router = inject(Router);

  readonly page = input<string>();
  readonly size = input<string>();
  readonly sort = input<string>();
  readonly dir = input<string>();
  readonly q = input<string>();
  readonly status = input<string>();

  protected readonly statuses = ORDER_STATUSES;
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly paymentLabels = PAYMENT_METHOD_LABELS;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly columns = ['number', 'createdAt', 'customer', 'payment', 'total', 'status'];

  protected readonly query = computed<OrderQuery>(() => {
    const sort = this.sort();
    const validSort = sort !== undefined && SORTABLE.includes(sort);
    return {
      page: toPositiveInt(this.page(), 1) - 1,
      pageSize: toPageSize(this.size()),
      sort: validSort ? sort : DEFAULTS.sort,
      dir: toDirection(this.dir(), 'desc'),
      q: this.q()?.trim() ?? '',
      status: asOrderStatus(this.status()),
    };
  });

  protected readonly orders = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.ordersApi.list(params),
  });
  protected readonly result = latestValue(this.orders);
  protected readonly hasFilters = computed(() => Boolean(this.query().q || this.query().status));

  protected readonly search = new FormControl('', { nonNullable: true });

  constructor() {
    effect(() => {
      const q = this.q() ?? '';
      if (this.search.value !== q) this.search.setValue(q, { emitEvent: false });
    });

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => this.navigate({ q: q.trim(), page: null }));
  }

  protected onStatus(change: MatChipListboxChange): void {
    this.navigate({ status: (change.value as string | undefined) ?? null, page: null });
  }

  protected onSort(sort: Sort): void {
    this.navigate({ sort: sort.active, dir: sort.direction || null, page: null });
  }

  protected onPage(event: PageEvent): void {
    this.navigate({ page: event.pageIndex + 1, size: event.pageSize });
  }

  protected clearFilters(): void {
    this.navigate({ q: null, status: null, page: null });
  }

  private navigate(patch: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      queryParams: toQueryParams(patch, DEFAULTS),
      queryParamsHandling: 'merge',
    });
  }
}
