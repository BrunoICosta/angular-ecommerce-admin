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
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import {
  TranslocoCurrencyPipe,
  TranslocoDatePipe,
  TranslocoDecimalPipe,
} from '@jsverse/transloco-locale';
import { EMPTY, Observable, finalize, of, switchMap } from 'rxjs';

import { Order, OrderStatus, nextStatuses } from '@core/models';
import { LanguageService } from '@core/i18n/language.service';
import { NotificationService } from '@core/notifications/notification.service';
import { ConfirmService } from '@shared/components/confirm-dialog/confirm.service';
import { OrderStatusChipComponent } from '@shared/components/order-status-chip/order-status-chip.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

import { OrderTimelineComponent } from '../../components/order-timeline/order-timeline.component';
import { OrdersService } from '../../data-access/orders.service';

@Component({
  selector: 'app-order-detail-page',
  imports: [
    TranslocoCurrencyPipe,
    TranslocoDatePipe,
    TranslocoDecimalPipe,
    TranslocoDirective,
    TranslocoPipe,
    FormsModule,
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
  private readonly i18n = inject(LanguageService);

  /** Resolved by `orderResolver`. */
  readonly order = input.required<Order>();

  /** Local copy, replaced by the API response after a status change. */
  protected readonly current = linkedSignal(() => this.order());

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
            title: this.i18n.t('orders.detail.cancelTitle', { number: order.number }),
            message: this.i18n.t('orders.detail.cancelMessage'),
            confirmLabel: this.i18n.t('orders.detail.cancelConfirm'),
            cancelLabel: this.i18n.t('orders.detail.cancelBack'),
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
          this.i18n.t('orders.detail.updated', {
            number: updated.number,
            status: this.i18n.t(`enums.orderStatus.${updated.status}`).toLowerCase(),
          }),
        );
      });
  }
}
