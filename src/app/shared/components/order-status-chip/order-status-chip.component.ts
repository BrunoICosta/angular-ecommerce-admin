import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ORDER_STATUS_LABELS, OrderStatus } from '@core/models';

import { ChipTone, StatusChipComponent } from '../status-chip/status-chip.component';

export const ORDER_STATUS_APPEARANCE: Record<OrderStatus, { tone: ChipTone; icon: string }> = {
  pending: { tone: 'warning', icon: 'schedule' },
  paid: { tone: 'info', icon: 'payments' },
  shipped: { tone: 'info', icon: 'local_shipping' },
  delivered: { tone: 'success', icon: 'check_circle' },
  cancelled: { tone: 'danger', icon: 'cancel' },
};

@Component({
  selector: 'app-order-status-chip',
  imports: [StatusChipComponent],
  template: `
    <app-status-chip [tone]="appearance().tone" [icon]="appearance().icon">
      {{ label() }}
    </app-status-chip>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusChipComponent {
  readonly status = input.required<OrderStatus>();

  protected readonly appearance = computed(() => ORDER_STATUS_APPEARANCE[this.status()]);
  protected readonly label = computed(() => ORDER_STATUS_LABELS[this.status()]);
}
