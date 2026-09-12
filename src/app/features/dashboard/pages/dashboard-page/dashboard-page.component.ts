import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatButtonModule],
  template: `
    <h1>Olá, {{ auth.user()?.name }}</h1>
    <button mat-stroked-button type="button" (click)="auth.logout()">Sair</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly auth = inject(AuthService);
}
