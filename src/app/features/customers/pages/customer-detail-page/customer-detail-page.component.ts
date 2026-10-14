import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { TranslocoCurrencyPipe, TranslocoDatePipe } from '@jsverse/transloco-locale';

import { LanguageService } from '@core/i18n/language.service';
import { CustomerWithStats } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { OrderStatusChipComponent } from '@shared/components/order-status-chip/order-status-chip.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatTileComponent } from '@shared/components/stat-tile/stat-tile.component';
import { formatBrl, formatInteger } from '@shared/utils/format.util';

import { CustomersService } from '../../data-access/customers.service';

@Component({
  selector: 'app-customer-detail-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslocoCurrencyPipe,
    TranslocoDatePipe,
    TranslocoDirective,
    TranslocoPipe,
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
  private readonly locale = inject(LanguageService).locale;

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

  protected readonly ordersCount = computed(() =>
    formatInteger(this.customer().ordersCount, this.locale()),
  );
  protected readonly totalSpent = computed(() =>
    formatBrl(this.customer().totalSpent, this.locale()),
  );
  protected readonly averageTicket = computed(() => {
    const { totalSpent, ordersCount } = this.customer();
    return formatBrl(ordersCount ? totalSpent / ordersCount : 0, this.locale());
  });
}
