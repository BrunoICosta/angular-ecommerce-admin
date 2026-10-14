import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { Product, StockStatus, stockStatus } from '@core/models';
import {
  ChipTone,
  StatusChipComponent,
} from '@shared/components/status-chip/status-chip.component';

const APPEARANCE: Record<StockStatus, { tone: ChipTone; icon: string }> = {
  in_stock: { tone: 'success', icon: 'check_circle' },
  low_stock: { tone: 'warning', icon: 'warning' },
  out_of_stock: { tone: 'danger', icon: 'block' },
};

@Component({
  selector: 'app-stock-status-chip',
  imports: [StatusChipComponent, TranslocoPipe],
  template: `
    <app-status-chip [tone]="appearance().tone" [icon]="appearance().icon">
      {{ 'enums.stockStatus.' + status() | transloco }}
    </app-status-chip>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockStatusChipComponent {
  readonly product = input.required<Pick<Product, 'stock' | 'minStock'>>();

  protected readonly status = computed(() => stockStatus(this.product()));
  protected readonly appearance = computed(() => APPEARANCE[this.status()]);
}
