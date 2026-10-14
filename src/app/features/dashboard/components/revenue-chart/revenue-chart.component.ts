import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { TranslocoDirective } from '@jsverse/transloco';
import { TranslocoCurrencyPipe, TranslocoDecimalPipe } from '@jsverse/transloco-locale';
import { BaseChartDirective } from 'ng2-charts';

import { MonthlyRevenue } from '@core/models';
import { LanguageService } from '@core/i18n/language.service';
import { ThemeService } from '@core/theme/theme.service';

import { formatCompactBrl, monthLabel } from './chart-format.util';

/** Bar color per theme, validated for contrast against the card surface. */
const BAR_COLOR = { light: '#005cbb', dark: '#4f8fe8' };
const INK = {
  light: { text: '#625b71', grid: '#e7e4ef' },
  dark: { text: '#b4aec2', grid: '#2b2935' },
};

@Component({
  selector: 'app-revenue-chart',
  imports: [BaseChartDirective, TranslocoCurrencyPipe, TranslocoDecimalPipe, TranslocoDirective],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueChartComponent {
  private readonly theme = inject(ThemeService);
  private readonly i18n = inject(LanguageService);

  readonly months = input.required<readonly MonthlyRevenue[]>();

  protected readonly labels = computed(() => {
    const locale = this.i18n.locale();
    return this.months().map((m) => monthLabel(m.month, locale));
  });

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => {
    const mode = this.theme.mode();
    return {
      labels: this.labels(),
      datasets: [
        {
          label: this.i18n.t('dashboard.chart.series'),
          data: this.months().map((m) => m.revenue),
          backgroundColor: BAR_COLOR[mode],
          hoverBackgroundColor: BAR_COLOR[mode],
          borderRadius: { topLeft: 4, topRight: 4 },
          borderSkipped: 'bottom',
          maxBarThickness: 36,
        },
      ],
    };
  });

  protected readonly options = computed<ChartConfiguration<'bar'>['options']>(() => {
    const ink = INK[this.theme.mode()];
    const months = this.months();
    const locale = this.i18n.locale();
    const ordersLabel = (count: number) => this.i18n.t('dashboard.chart.ordersTooltip', { count });
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` ${formatCompactBrl(item.parsed.y ?? 0, locale, false)}`,
            afterLabel: (item) => ` ${ordersLabel(months[item.dataIndex]?.orders ?? 0)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: ink.grid },
          ticks: { color: ink.text },
        },
        y: {
          beginAtZero: true,
          grid: { color: ink.grid },
          border: { display: false },
          ticks: {
            color: ink.text,
            maxTicksLimit: 5,
            callback: (value) => formatCompactBrl(Number(value), locale),
          },
        },
      },
    };
  });

  protected readonly total = computed(() => this.months().reduce((sum, m) => sum + m.revenue, 0));
  protected readonly summary = computed(() => {
    const months = this.months();
    if (months.length === 0) return this.i18n.t('dashboard.chart.noData');
    const locale = this.i18n.locale();
    const best = months.reduce((top, m) => (m.revenue > top.revenue ? m : top));
    return this.i18n.t('dashboard.chart.summary', {
      months: months.length,
      month: monthLabel(best.month, locale),
      value: formatCompactBrl(best.revenue, locale, false),
    });
  });
}
