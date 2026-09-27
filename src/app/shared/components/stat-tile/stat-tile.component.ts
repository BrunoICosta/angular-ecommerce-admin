import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** KPI tile: label, formatted value and an optional trend versus a previous period. */
@Component({
  selector: 'app-stat-tile',
  imports: [DecimalPipe, MatIconModule],
  template: `
    <div class="top">
      <span class="label">{{ label() }}</span>
      <span class="icon" aria-hidden="true"
        ><mat-icon>{{ icon() }}</mat-icon></span
      >
    </div>
    <strong class="value">{{ value() }}</strong>
    @if (trend() !== null) {
      <span class="trend" [class.trend--up]="trendUp()" [class.trend--down]="!trendUp()">
        <mat-icon aria-hidden="true">{{ trendUp() ? 'trending_up' : 'trending_down' }}</mat-icon>
        <span class="visually-hidden">{{ trendUp() ? 'Alta de' : 'Queda de' }}</span>
        {{ absTrend() | number: '1.0-1' }}%
        <span class="hint">{{ hint() }}</span>
      </span>
    } @else if (hint()) {
      <span class="hint">{{ hint() }}</span>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 6px;
      padding: 20px;
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      background: var(--mat-sys-surface-container-lowest);
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .label {
      color: var(--app-muted);
      font-weight: 500;
    }
    .icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
    .value {
      font-size: clamp(1.375rem, 1rem + 1vw, 1.75rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }
    .trend {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-size: 0.8125rem;
    }
    .trend mat-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }
    .trend--up {
      color: var(--app-success);
    }
    .trend--down {
      color: var(--app-danger);
    }
    .hint {
      color: var(--app-muted);
      font-weight: 400;
      font-size: 0.8125rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatTileComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input('insights');
  readonly hint = input<string>();
  /** Percentage change, e.g. 12.5 for +12.5%. `null` hides the trend. */
  readonly trend = input<number | null>(null);

  protected readonly trendUp = computed(() => (this.trend() ?? 0) >= 0);
  protected readonly absTrend = computed(() => Math.abs(this.trend() ?? 0));
}
