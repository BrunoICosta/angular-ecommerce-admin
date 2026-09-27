import { CurrencyPipe, DatePipe, formatCurrency } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  inject,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';

import { CustomerWithStats } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { OrderStatusChipComponent } from '@shared/components/order-status-chip/order-status-chip.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatTileComponent } from '@shared/components/stat-tile/stat-tile.component';

import { CustomersService } from '../../data-access/customers.service';

@Component({
  selector: 'app-customer-detail-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    ErrorStateComponent,
    OrderStatusChipComponent,
    PageHeaderComponent,
    StatTileComponent,
  ],
  templateUrl: './customer-detail-page.component.html',
  styleUrl: './customer-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailPageComponent {
  private readonly customersApi = inject(CustomersService);
  private readonly locale = inject(LOCALE_ID);

  /** Resolved by `customerResolver`. */
  readonly customer = input.required<CustomerWithStats>();

  protected readonly orders = rxResource({
    params: () => this.customer().id,
    stream: ({ params: id }) => this.customersApi.orders(id),
  });

  protected readonly initials = computed(() =>
    this.customer()
      .name.split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join(''),
  );

  protected readonly totalSpent = computed(() => this.brl(this.customer().totalSpent));
  protected readonly averageTicket = computed(() => {
    const { totalSpent, ordersCount } = this.customer();
    return this.brl(ordersCount ? totalSpent / ordersCount : 0);
  });

  private brl(value: number): string {
    return formatCurrency(value, this.locale, 'R$', 'BRL');
  }
}
