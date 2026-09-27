import { DatePipe, formatCurrency, formatNumber } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '@core/auth/auth.service';
import { DashboardSummary, PeriodMetric, percentChange } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatTileComponent } from '@shared/components/stat-tile/stat-tile.component';
import { latestValue } from '@shared/utils/resource.util';

import { RevenueChartComponent } from '../../components/revenue-chart/revenue-chart.component';
import { DashboardService } from '../../data-access/dashboard.service';

interface KpiView {
  label: string;
  value: string;
  icon: string;
  trend: number | null;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    ErrorStateComponent,
    PageHeaderComponent,
    RevenueChartComponent,
    StatTileComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly auth = inject(AuthService);
  private readonly locale = inject(LOCALE_ID);

  private readonly dashboardApi = inject(DashboardService);

  protected readonly summary = rxResource({ stream: () => this.dashboardApi.summary() });
  protected readonly data = latestValue(this.summary);

  protected readonly greeting = computed(() => {
    const firstName = this.auth.user()?.name.split(' ')[0] ?? '';
    return `Olá, ${firstName}`;
  });

  protected readonly kpis = computed<KpiView[]>(() => {
    const data = this.data();
    return data ? this.toKpis(data) : [];
  });

  private toKpis(data: DashboardSummary): KpiView[] {
    const brl = (value: number) => formatCurrency(value, this.locale, 'R$', 'BRL');
    const int = (value: number) => formatNumber(value, this.locale, '1.0-0');
    const kpi = (
      label: string,
      icon: string,
      metric: PeriodMetric,
      format: (v: number) => string,
    ) => ({
      label,
      icon,
      value: format(metric.current),
      trend: percentChange(metric),
    });
    return [
      kpi('Receita', 'payments', data.revenue, brl),
      kpi('Pedidos', 'receipt_long', data.orders, int),
      kpi('Ticket médio', 'shopping_cart', data.averageTicket, brl),
      kpi('Novos clientes', 'person_add', data.newCustomers, int),
    ];
  }
}
