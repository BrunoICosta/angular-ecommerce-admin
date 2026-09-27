import { CurrencyPipe, DatePipe } from '@angular/common';
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
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { BRAZILIAN_STATES } from '@core/models';
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

import { CustomersService } from '../../data-access/customers.service';
import { CustomerQuery, asState } from '../../models/customer-query.model';

const SORTABLE = ['name', 'city', 'createdAt', 'ordersCount', 'totalSpent', 'lastOrderAt'];
const DEFAULTS = { page: 1, size: PAGE_SIZE_OPTIONS[0], sort: 'name', dir: 'asc' };

@Component({
  selector: 'app-customer-list-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
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
  ],
  templateUrl: './customer-list-page.component.html',
  styleUrl: './customer-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListPageComponent {
  private readonly customersApi = inject(CustomersService);
  private readonly router = inject(Router);

  readonly page = input<string>();
  readonly size = input<string>();
  readonly sort = input<string>();
  readonly dir = input<string>();
  readonly q = input<string>();
  readonly state = input<string>();

  protected readonly states = BRAZILIAN_STATES;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly columns = [
    'name',
    'city',
    'ordersCount',
    'totalSpent',
    'lastOrderAt',
    'createdAt',
  ];

  protected readonly query = computed<CustomerQuery>(() => {
    const sort = this.sort();
    return {
      page: toPositiveInt(this.page(), 1) - 1,
      pageSize: toPageSize(this.size()),
      sort: sort !== undefined && SORTABLE.includes(sort) ? sort : DEFAULTS.sort,
      dir: toDirection(this.dir(), 'asc'),
      q: this.q()?.trim() ?? '',
      state: asState(this.state()),
    };
  });

  protected readonly customers = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.customersApi.list(params),
  });
  protected readonly result = latestValue(this.customers);
  protected readonly hasFilters = computed(() => Boolean(this.query().q || this.query().state));

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

  protected onState(state: string): void {
    this.navigate({ state, page: null });
  }

  protected onSort(sort: Sort): void {
    this.navigate({ sort: sort.active, dir: sort.direction || null, page: null });
  }

  protected onPage(event: PageEvent): void {
    this.navigate({ page: event.pageIndex + 1, size: event.pageSize });
  }

  protected clearFilters(): void {
    this.navigate({ q: null, state: null, page: null });
  }

  private navigate(patch: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      queryParams: toQueryParams(patch, DEFAULTS),
      queryParamsHandling: 'merge',
    });
  }
}
