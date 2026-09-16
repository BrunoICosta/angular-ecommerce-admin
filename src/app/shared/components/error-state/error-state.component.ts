import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Centered illustration-like block for empty, error and "not found" states. */
@Component({
  selector: 'app-error-state',
  imports: [MatIconModule],
  template: `
    <span class="icon" aria-hidden="true"
      ><mat-icon>{{ icon() }}</mat-icon></span
    >
    <h2>{{ title() }}</h2>
    @if (message()) {
      <p>{{ message() }}</p>
    }
    <div class="actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: 8px;
      padding: 48px 16px;
      text-align: center;
    }
    .icon {
      display: grid;
      place-items: center;
      width: 64px;
      height: 64px;
      margin-bottom: 8px;
      border-radius: 50%;
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-primary);
    }
    .icon mat-icon {
      width: 32px;
      height: 32px;
      font-size: 32px;
    }
    h2 {
      margin: 0;
      font: var(--mat-sys-title-large);
    }
    p {
      max-width: 48ch;
      margin: 0;
      color: var(--app-muted);
    }
    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .actions:empty {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  readonly icon = input('info');
  readonly title = input.required<string>();
  readonly message = input<string>();
}
