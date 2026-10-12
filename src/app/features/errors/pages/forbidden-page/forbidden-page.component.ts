import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';

@Component({
  selector: 'app-forbidden-page',
  imports: [ErrorStateComponent, MatButtonModule, RouterLink, TranslocoDirective],
  template: `
    <app-error-state
      *transloco="let t; prefix: 'errorPages'"
      icon="lock"
      [title]="t('forbiddenTitle')"
      [message]="t('forbiddenMessage')"
    >
      <a mat-flat-button routerLink="/dashboard">{{ t('backToDashboard') }}</a>
    </app-error-state>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPageComponent {}
