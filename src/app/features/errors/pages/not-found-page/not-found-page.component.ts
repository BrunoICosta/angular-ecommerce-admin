import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';

@Component({
  selector: 'app-not-found-page',
  imports: [ErrorStateComponent, MatButtonModule, RouterLink, TranslocoDirective],
  template: `
    <app-error-state
      *transloco="let t; prefix: 'errorPages'"
      icon="explore_off"
      [title]="t('notFoundTitle')"
      [message]="t('notFoundMessage')"
    >
      <a mat-flat-button routerLink="/dashboard">{{ t('backToDashboard') }}</a>
    </app-error-state>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent {}
