import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ORDER_STATUS_LABELS, OrderEvent, OrderStatus } from '@core/models';
import { ORDER_STATUS_APPEARANCE } from '@shared/components/order-status-chip/order-status-chip.component';

import { buildTimeline } from './timeline.util';

@Component({
  selector: 'app-order-timeline',
  imports: [DatePipe, MatIconModule],
  templateUrl: './order-timeline.component.html',
  styleUrl: './order-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTimelineComponent {
  readonly history = input.required<readonly OrderEvent[]>();
  readonly status = input.required<OrderStatus>();

  protected readonly labels = ORDER_STATUS_LABELS;
  protected readonly appearance = ORDER_STATUS_APPEARANCE;
  protected readonly steps = computed(() => buildTimeline(this.history(), this.status()));
}
