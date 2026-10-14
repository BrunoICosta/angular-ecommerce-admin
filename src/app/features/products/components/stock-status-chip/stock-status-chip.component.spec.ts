import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideI18nTesting } from '@core/i18n/testing/i18n-testing';

import { StockStatusChipComponent } from './stock-status-chip.component';

describe('StockStatusChipComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideI18nTesting()],
    });
  });

  for (const [stock, label, tone] of [
    [40, 'Em estoque', 'success'],
    [2, 'Estoque baixo', 'warning'],
    [0, 'Esgotado', 'danger'],
  ] as const) {
    it(`shows "${label}" for ${stock} units`, async () => {
      const fixture = TestBed.createComponent(StockStatusChipComponent);
      fixture.componentRef.setInput('product', { stock, minStock: 5 });
      await fixture.whenStable();

      const chip: HTMLElement = fixture.nativeElement.querySelector('app-status-chip');
      expect(chip.querySelector('span')?.textContent?.trim()).toBe(label);
      expect(chip.classList).toContain(`status-chip--${tone}`);
    });
  }
});
