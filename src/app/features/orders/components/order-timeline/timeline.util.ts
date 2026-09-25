import { OrderEvent, OrderStatus } from '@core/models';

export interface TimelineStep {
  status: OrderStatus;
  state: 'done' | 'current' | 'upcoming' | 'cancelled';
  at: string | null;
}

const HAPPY_PATH: readonly OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];

/**
 * Projects the order history onto the regular workflow, so the timeline also
 * shows the steps that have not happened yet. Cancelled orders stop at the
 * cancellation event.
 */
export function buildTimeline(history: readonly OrderEvent[], status: OrderStatus): TimelineStep[] {
  const reachedAt = new Map(history.map((event) => [event.status, event.at]));

  if (status === 'cancelled') {
    return [
      ...HAPPY_PATH.filter((step) => reachedAt.has(step)).map((step): TimelineStep => ({
        status: step,
        state: 'done',
        at: reachedAt.get(step) ?? null,
      })),
      { status: 'cancelled', state: 'cancelled', at: reachedAt.get('cancelled') ?? null },
    ];
  }

  // A delivered order is complete: every step is "done", none is "current".
  const currentIndex = status === 'delivered' ? HAPPY_PATH.length : HAPPY_PATH.indexOf(status);
  return HAPPY_PATH.map((step, index) => ({
    status: step,
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
    at: reachedAt.get(step) ?? null,
  }));
}
