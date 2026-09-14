import { Injectable, computed, signal } from '@angular/core';

/** Counts in-flight HTTP requests; the shell shows a progress bar while > 0. */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pending = signal(0);

  readonly pendingRequests = this.pending.asReadonly();
  readonly isLoading = computed(() => this.pending() > 0);

  start(): void {
    this.pending.update((count) => count + 1);
  }

  stop(): void {
    this.pending.update((count) => Math.max(0, count - 1));
  }
}
