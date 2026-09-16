import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AuthService } from '@core/auth/auth.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeaderComponent],
  template: `<app-page-header [title]="greeting()" subtitle="Visão geral da loja" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly auth = inject(AuthService);
  protected readonly greeting = computed(
    () => `Olá, ${this.auth.user()?.name.split(' ')[0] ?? ''}`,
  );
}
