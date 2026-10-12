import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { DashboardService } from './data-access/dashboard.service';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.dashboard',
    // Chart.js is registered here, so it only ships with the dashboard chunk.
    providers: [DashboardService, provideCharts(withDefaultRegisterables())],
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
];
