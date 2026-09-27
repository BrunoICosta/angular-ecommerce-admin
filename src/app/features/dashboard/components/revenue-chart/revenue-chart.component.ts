import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { MonthlyRevenue } from '@core/models';
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
  imports: [BaseChartDirective, CurrencyPipe],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueChartComponent {
  private readonly theme = inject(ThemeService);

  readonly months = input.required<readonly MonthlyRevenue[]>();

  protected readonly labels = computed(() => this.months().map((m) => monthLabel(m.month)));

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => {
    const mode = this.theme.mode();
    return {
      labels: this.labels(),
      datasets: [
        {
          label: 'Receita',
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
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` ${formatCompactBrl(item.parsed.y ?? 0, false)}`,
            afterLabel: (item) => ` ${months[item.dataIndex]?.orders ?? 0} pedidos`,
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
            callback: (value) => formatCompactBrl(Number(value)),
          },
        },
      },
    };
  });

  protected readonly total = computed(() => this.months().reduce((sum, m) => sum + m.revenue, 0));
  protected readonly summary = computed(() => {
    const months = this.months();
    if (months.length === 0) return 'Sem dados de receita.';
    const best = months.reduce((top, m) => (m.revenue > top.revenue ? m : top));
    return `Receita mensal dos últimos ${months.length} meses. Maior mês: ${monthLabel(best.month)}, ${formatCompactBrl(best.revenue, false)}.`;
  });
}
