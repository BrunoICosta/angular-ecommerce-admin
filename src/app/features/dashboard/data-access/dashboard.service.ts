import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardSummary } from '@core/models';

/** Provided by DASHBOARD_ROUTES, so it ships with the dashboard chunk. */
@Injectable()
export class DashboardService {
  private readonly http = inject(HttpClient);

  summary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>('api/dashboard');
  }
}
