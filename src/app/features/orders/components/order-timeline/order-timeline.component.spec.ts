import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideI18nTesting } from '@core/i18n/testing/i18n-testing';

import { OrderTimelineComponent } from './order-timeline.component';

describe('OrderTimelineComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrderTimelineComponent],
      providers: [provideZonelessChangeDetection(), provideI18nTesting()],
    });
  });

  it('renders the workflow and marks the current step', async () => {
    const fixture = TestBed.createComponent(OrderTimelineComponent);
    fixture.componentRef.setInput('status', 'shipped');
    fixture.componentRef.setInput('history', [
      { status: 'pending', at: '2026-09-01T10:00:00' },
      { status: 'paid', at: '2026-09-01T12:30:00' },
      { status: 'shipped', at: '2026-09-02T09:15:00' },
    ]);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    const steps = element.querySelectorAll('li');
    expect(steps.length).toBe(4);
    expect(element.querySelector('[aria-current="step"]')?.textContent).toContain('Enviado');
    expect(steps[1].textContent).toContain('01/09/2026, 12:30');
    expect(steps[3].textContent).toContain('Pendente');
  });
});
