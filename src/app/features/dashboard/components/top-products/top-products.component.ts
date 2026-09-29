import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopProduct } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';

/** Ranked list with a proportional bar: a single series reads better as a list than as a chart. */
@Component({
  selector: 'app-top-products',
  imports: [CurrencyPipe, RouterLink, ErrorStateComponent],
  template: `
    @if (rows().length === 0) {
      <app-error-state icon="sell" title="Sem vendas no período" />
    } @else {
      <ol>
        @for (row of rows(); track row.productId; let i = $index) {
          <li>
            <span class="rank" aria-hidden="true">{{ i + 1 }}</span>
            <div class="body">
              <div class="line">
                <a [routerLink]="['/products', row.productId, 'edit']">{{ row.name }}</a>
                <strong>{{ row.revenue | currency }}</strong>
              </div>
              <div class="bar" aria-hidden="true"><span [style.width.%]="row.share"></span></div>
              <small>{{ row.quantity }} {{ row.quantity === 1 ? 'unidade' : 'unidades' }}</small>
            </div>
          </li>
        }
      </ol>
    }
  `,
  styles: `
    ol {
      display: grid;
      gap: 14px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      gap: 12px;
    }
    .rank {
      display: grid;
      flex: none;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--mat-sys-surface-container-high);
      font-weight: 700;
      font-size: 0.8125rem;
    }
    .body {
      display: grid;
      flex: 1;
      gap: 4px;
      min-width: 0;
    }
    .line {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .line a {
      overflow: hidden;
      color: inherit;
      font-weight: 500;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-decoration: none;
    }
    .line a:hover {
      color: var(--mat-sys-primary);
      text-decoration: underline;
    }
    .line strong {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .bar {
      height: 6px;
      border-radius: 3px;
      background: var(--mat-sys-surface-container-high);
    }
    .bar span {
      display: block;
      height: 100%;
      border-radius: 3px;
      background: var(--mat-sys-primary);
    }
    small {
      color: var(--app-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopProductsComponent {
  readonly products = input.required<readonly TopProduct[]>();

  protected readonly rows = computed(() => {
    const products = this.products();
    const max = Math.max(1, ...products.map((p) => p.revenue));
    return products.map((p) => ({ ...p, share: Math.round((p.revenue / max) * 100) }));
  });
}
