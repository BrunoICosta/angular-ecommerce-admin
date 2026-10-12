import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

type Tone = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  success(message: string): void {
    this.open(message, 'success', 3500);
  }

  error(message: string): void {
    this.open(message, 'error', 6000);
  }

  info(message: string): void {
    this.open(message, 'info', 4000);
  }

  private open(message: string, tone: Tone, duration: number): void {
    this.snackBar.open(message, this.transloco.translate('common.close'), {
      duration,
      panelClass: ['app-snackbar', `app-snackbar--${tone}`],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      politeness: tone === 'error' ? 'assertive' : 'polite',
    });
  }
}
