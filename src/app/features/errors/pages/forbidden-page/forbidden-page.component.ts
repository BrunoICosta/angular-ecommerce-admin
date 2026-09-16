import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';

@Component({
  selector: 'app-forbidden-page',
  imports: [ErrorStateComponent, MatButtonModule, RouterLink],
  template: `
    <app-error-state
      icon="lock"
      title="Acesso negado"
      message="Seu perfil não tem permissão para acessar esta área. Fale com um administrador."
    >
      <a mat-flat-button routerLink="/dashboard">Voltar ao dashboard</a>
    </app-error-state>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPageComponent {}
