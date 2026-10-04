import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { OrderStatusChipComponent } from './order-status-chip.component';

describe('OrderStatusChipComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('renders the status label with a tone class', async () => {
    const fixture = TestBed.createComponent(OrderStatusChipComponent);
    fixture.componentRef.setInput('status', 'cancelled');
    await fixture.whenStable();

    const chip: HTMLElement = fixture.nativeElement.querySelector('app-status-chip');
    expect(chip.querySelector('span')?.textContent?.trim()).toBe('Cancelado');
    expect(chip.classList).toContain('status-chip--danger');
  });
});
