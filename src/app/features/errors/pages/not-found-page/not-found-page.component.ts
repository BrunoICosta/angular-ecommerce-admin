import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';

@Component({
  selector: 'app-not-found-page',
  imports: [ErrorStateComponent, MatButtonModule, RouterLink],
  template: `
    <app-error-state
      icon="explore_off"
      title="Página não encontrada"
      message="O endereço acessado não existe ou foi removido."
    >
      <a mat-flat-button routerLink="/dashboard">Voltar ao dashboard</a>
    </app-error-state>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent {}
