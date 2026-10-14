import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';

import { AuthService } from '@core/auth/auth.service';
import { LanguageService } from '@core/i18n/language.service';
import { DashboardSummary, PeriodMetric, percentChange } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatTileComponent } from '@shared/components/stat-tile/stat-tile.component';
import { formatBrl, formatInteger } from '@shared/utils/format.util';
import { latestValue } from '@shared/utils/resource.util';

import { LowStockAlertComponent } from '../../components/low-stock-alert/low-stock-alert.component';
import { RevenueChartComponent } from '../../components/revenue-chart/revenue-chart.component';
import { TopProductsComponent } from '../../components/top-products/top-products.component';
import { DashboardService } from '../../data-access/dashboard.service';

interface KpiView {
  /** Translation key (inside the dashboard scope). */
  key: string;
  value: string;
  icon: string;
  trend: number | null;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslocoDatePipe,
    TranslocoDirective,
    TranslocoPipe,
    ErrorStateComponent,
    PageHeaderComponent,
    LowStockAlertComponent,
    RevenueChartComponent,
    StatTileComponent,
    TopProductsComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly auth = inject(AuthService);
  private readonly locale = inject(LanguageService).locale;
  private readonly dashboardApi = inject(DashboardService);

  protected readonly summary = rxResource({ stream: () => this.dashboardApi.summary() });
  protected readonly data = latestValue(this.summary);

  protected readonly firstName = computed(() => this.auth.user()?.name.split(' ')[0] ?? '');

  /** Recomputed when the data or the active locale changes. */
  protected readonly kpis = computed<KpiView[]>(() => {
    const data = this.data();
    return data ? this.toKpis(data, this.locale()) : [];
  });

  private toKpis(data: DashboardSummary, locale: string): KpiView[] {
    const brl = (value: number) => formatBrl(value, locale);
    const int = (value: number) => formatInteger(value, locale);
    const kpi = (
      key: string,
      icon: string,
      metric: PeriodMetric,
      format: (v: number) => string,
    ) => ({
      key,
      icon,
      value: format(metric.current),
      trend: percentChange(metric),
    });
    return [
      kpi('revenue', 'payments', data.revenue, brl),
      kpi('orders', 'receipt_long', data.orders, int),
      kpi('averageTicket', 'shopping_cart', data.averageTicket, brl),
      kpi('newCustomers', 'person_add', data.newCustomers, int),
    ];
  }
}
