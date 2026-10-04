import { buildTimeline } from './timeline.util';

describe('buildTimeline', () => {
  it('shows past, current and upcoming steps', () => {
    const steps = buildTimeline(
      [
        { status: 'pending', at: '2026-09-01T10:00:00Z' },
        { status: 'paid', at: '2026-09-01T12:00:00Z' },
      ],
      'paid',
    );
    expect(steps.map((s) => [s.status, s.state])).toEqual([
      ['pending', 'done'],
      ['paid', 'current'],
      ['shipped', 'upcoming'],
      ['delivered', 'upcoming'],
    ]);
    expect(steps[2].at).toBeNull();
  });

  it('marks every step as done once delivered', () => {
    const steps = buildTimeline([], 'delivered');
    expect(steps.every((s) => s.state === 'done')).toBeTrue();
  });

  it('stops at the cancellation', () => {
    const steps = buildTimeline(
      [
        { status: 'pending', at: '2026-09-01T10:00:00Z' },
        { status: 'cancelled', at: '2026-09-02T10:00:00Z' },
      ],
      'cancelled',
    );
    expect(steps.map((s) => [s.status, s.state])).toEqual([
      ['pending', 'done'],
      ['cancelled', 'cancelled'],
    ]);
  });
});
