import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Page title + optional subtitle, with a slot for page-level actions. */
@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header__text">
      <h1>{{ title() }}</h1>
      @if (subtitle()) {
        <p>{{ subtitle() }}</p>
      }
    </div>
    <div class="page-header__actions">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0;
      font: var(--mat-sys-headline-small);
      font-weight: 600;
    }
    p {
      margin: 4px 0 0;
      color: var(--app-muted);
    }
    .page-header__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .page-header__actions:empty {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
