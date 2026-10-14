import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import { finalize } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { LanguageService } from '@core/i18n/language.service';
import { ROLES, Role, User } from '@core/models';
import { NotificationService } from '@core/notifications/notification.service';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

import { UsersService } from '../../data-access/users.service';

@Component({
  selector: 'app-user-list-page',
  imports: [
    TranslocoDatePipe,
    TranslocoDirective,
    TranslocoPipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    ErrorStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './user-list-page.component.html',
  styleUrl: './user-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListPageComponent {
  private readonly usersApi = inject(UsersService);
  private readonly notifications = inject(NotificationService);

  private readonly auth = inject(AuthService);

  protected readonly currentUserId = computed(() => this.auth.user()?.id);
  private readonly i18n = inject(LanguageService);
  protected readonly roles = ROLES;
  protected readonly columns = ['user', 'role', 'active', 'lastLoginAt'];

  protected readonly users = rxResource({ stream: () => this.usersApi.list() });
  /** Id of the row being saved, to disable its controls meanwhile. */
  protected readonly savingId = signal<number | null>(null);

  protected readonly activeCount = computed(() =>
    this.users.hasValue() ? this.users.value().filter((u) => u.active).length : 0,
  );

  protected changeRole(user: User, role: Role): void {
    this.save(
      { ...user, role },
      this.i18n.t('users.roleChanged', {
        name: user.name,
        role: this.i18n.t(`enums.role.${role}`).toLowerCase(),
      }),
    );
  }

  protected toggleActive(user: User, active: boolean): void {
    this.save(
      { ...user, active },
      this.i18n.t(active ? 'users.activated' : 'users.deactivated', { name: user.name }),
    );
  }

  private save(changed: User, message: string): void {
    this.savingId.set(changed.id);
    this.usersApi
      .update(changed)
      .pipe(finalize(() => this.savingId.set(null)))
      .subscribe({
        next: (saved) => {
          this.users.update((list) => list?.map((u) => (u.id === saved.id ? saved : u)));
          this.notifications.success(message);
        },
        // The error itself is reported by the global interceptor; reload to undo the UI change.
        error: () => this.users.reload(),
      });
  }
}
