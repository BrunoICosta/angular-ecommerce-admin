import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { BRAZILIAN_STATES } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  PAGE_SIZE_OPTIONS,
  toDirection,
  toPageSize,
  toPositiveInt,
} from '@shared/utils/list-query.util';
import { injectQueryNavigator, syncedSearchControl } from '@shared/utils/list-page.util';
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
  private readonly navigate = injectQueryNavigator(DEFAULTS);

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

  protected readonly search = syncedSearchControl(this.q, (q) => this.navigate({ q, page: null }));

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
}
