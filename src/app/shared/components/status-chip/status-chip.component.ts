import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type ChipTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** Small colored pill used for statuses (stock, orders, users). */
@Component({
  selector: 'app-status-chip',
  imports: [MatIconModule],
  host: {
    '[class]': "'status-chip status-chip--' + tone()",
  },
  template: `
    @if (icon()) {
      <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
    }
    <span><ng-content /></span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px 2px 8px;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.6;
      white-space: nowrap;
    }
    mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
    }
    :host(.status-chip--success) {
      color: var(--app-success);
      background: var(--app-success-bg);
    }
    :host(.status-chip--warning) {
      color: var(--app-warning);
      background: var(--app-warning-bg);
    }
    :host(.status-chip--danger) {
      color: var(--app-danger);
      background: var(--app-danger-bg);
    }
    :host(.status-chip--info) {
      color: var(--app-info);
      background: var(--app-info-bg);
    }
    :host(.status-chip--neutral) {
      color: var(--mat-sys-on-surface-variant);
      background: var(--mat-sys-surface-container-highest);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  readonly tone = input<ChipTone>('neutral');
  readonly icon = input<string>();
}
