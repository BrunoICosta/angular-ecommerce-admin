import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { filter, map } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { LoadingService } from '../../http/loading.service';
import { ThemeService } from '../../theme/theme.service';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { NAV_ITEMS } from '../nav-items';

const COLLAPSED_KEY = 'loja-admin.sidenav-collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

@Component({
  selector: 'app-shell',
  imports: [
    TranslocoDirective,
    BreadcrumbComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  protected readonly loading = inject(LoadingService);
  protected readonly theme = inject(ThemeService);

  protected readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 959.98px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  /** Desktop only: icons-only rail. */
  protected readonly collapsed = signal(readCollapsed());
  /** Mobile only: drawer visibility. */
  protected readonly drawerOpen = signal(false);

  protected readonly user = this.auth.user;
  protected readonly initials = computed(() =>
    (this.user()?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );
  protected readonly navItems = computed(() => {
    const role = this.auth.role();
    return NAV_ITEMS.filter((item) => !item.roles || (role !== null && item.roles.includes(role)));
  });
  protected readonly railMode = computed(() => !this.isHandset() && this.collapsed());

  constructor() {
    // Close the mobile drawer after navigating.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.drawerOpen.set(false));
  }

  protected toggleMenu(): void {
    if (this.isHandset()) {
      this.drawerOpen.update((open) => !open);
      return;
    }
    this.collapsed.update((value) => !value);
    try {
      localStorage.setItem(COLLAPSED_KEY, this.collapsed() ? '1' : '0');
    } catch {
      // Preference is not persisted when storage is unavailable.
    }
  }

  protected logout(): void {
    this.auth.logout();
  }
}
