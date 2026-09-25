import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { EMPTY, Observable, finalize, of, switchMap } from 'rxjs';

import {
  ORDER_STATUS_LABELS,
  Order,
  OrderStatus,
  PAYMENT_METHOD_LABELS,
  nextStatuses,
} from '@core/models';
import { NotificationService } from '@core/notifications/notification.service';
import { ConfirmService } from '@shared/components/confirm-dialog/confirm.service';
import { OrderStatusChipComponent } from '@shared/components/order-status-chip/order-status-chip.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { LabelPipe } from '@shared/pipes/label.pipe';

import { OrderTimelineComponent } from '../../components/order-timeline/order-timeline.component';
import { OrdersService } from '../../data-access/orders.service';

@Component({
  selector: 'app-order-detail-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    LabelPipe,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    OrderStatusChipComponent,
    OrderTimelineComponent,
    PageHeaderComponent,
  ],
  templateUrl: './order-detail-page.component.html',
  styleUrl: './order-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPageComponent {
  private readonly ordersApi = inject(OrdersService);
  private readonly confirm = inject(ConfirmService);
  private readonly notifications = inject(NotificationService);

  /** Resolved by `orderResolver`. */
  readonly order = input.required<Order>();

  /** Local copy, replaced by the API response after a status change. */
  protected readonly current = linkedSignal(() => this.order());
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly paymentLabels = PAYMENT_METHOD_LABELS;

  protected readonly options = computed(() => nextStatuses(this.current().status));
  protected readonly nextStatus = linkedSignal<readonly OrderStatus[], OrderStatus | null>({
    source: this.options,
    computation: (options) => options[0] ?? null,
  });
  protected readonly saving = signal(false);
  protected readonly itemsCount = computed(() =>
    this.current().items.reduce((sum, item) => sum + item.quantity, 0),
  );

  protected updateStatus(): void {
    const status = this.nextStatus();
    if (!status) return;
    const order = this.current();

    const confirmed$: Observable<boolean> =
      status === 'cancelled'
        ? this.confirm.confirm({
            title: `Cancelar o pedido ${order.number}?`,
            message: 'O cliente será notificado e o pedido não poderá ser reaberto.',
            confirmLabel: 'Cancelar pedido',
            cancelLabel: 'Voltar',
            tone: 'danger',
          })
        : of(true);

    confirmed$
      .pipe(
        switchMap((ok) => {
          if (!ok) return EMPTY;
          this.saving.set(true);
          return this.ordersApi
            .updateStatus(order.id, status)
            .pipe(finalize(() => this.saving.set(false)));
        }),
      )
      .subscribe((updated) => {
        this.current.set(updated);
        this.notifications.success(
          `Pedido ${updated.number}: ${ORDER_STATUS_LABELS[updated.status].toLowerCase()}.`,
        );
      });
  }
}
