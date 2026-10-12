import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` is used for destructive actions such as deletions. */
  tone?: 'primary' | 'danger';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, TranslocoPipe],
  template: `
    <h2 mat-dialog-title>
      <mat-icon aria-hidden="true" [class.danger]="data.tone === 'danger'">
        {{ data.icon ?? (data.tone === 'danger' ? 'warning' : 'help') }}
      </mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">
        {{ data.cancelLabel ?? ('common.cancel' | transloco) }}
      </button>
      <button
        mat-flat-button
        type="button"
        cdkFocusInitial
        [class.danger-button]="data.tone === 'danger'"
        [mat-dialog-close]="true"
      >
        {{ data.confirmLabel ?? ('common.confirm' | transloco) }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    mat-icon {
      color: var(--mat-sys-primary);
    }
    mat-icon.danger {
      color: var(--mat-sys-error);
    }
    p {
      margin: 0;
    }
    .danger-button {
      --mat-button-filled-container-color: var(--mat-sys-error);
      --mat-button-filled-label-text-color: var(--mat-sys-on-error);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
