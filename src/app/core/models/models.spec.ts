import { percentChange } from './dashboard.model';
import { canTransition, nextStatuses } from './order.model';
import { stockStatus } from './product.model';

describe('domain rules', () => {
  describe('order workflow', () => {
    it('allows the regular path and cancellation before shipping', () => {
      expect(nextStatuses('pending')).toEqual(['paid', 'cancelled']);
      expect(nextStatuses('paid')).toEqual(['shipped', 'cancelled']);
      expect(nextStatuses('shipped')).toEqual(['delivered']);
    });

    it('treats delivered and cancelled as final', () => {
      expect(nextStatuses('delivered')).toEqual([]);
      expect(nextStatuses('cancelled')).toEqual([]);
    });

    it('rejects skipping steps or going back', () => {
      expect(canTransition('pending', 'shipped')).toBeFalse();
      expect(canTransition('shipped', 'paid')).toBeFalse();
      expect(canTransition('shipped', 'cancelled')).toBeFalse();
      expect(canTransition('paid', 'shipped')).toBeTrue();
    });
  });

  describe('stockStatus', () => {
    it('classifies stock levels against the minimum', () => {
      expect(stockStatus({ stock: 0, minStock: 10 })).toBe('out_of_stock');
      expect(stockStatus({ stock: 10, minStock: 10 })).toBe('low_stock');
      expect(stockStatus({ stock: 11, minStock: 10 })).toBe('in_stock');
    });
  });

  describe('percentChange', () => {
    it('computes the change and handles a zero baseline', () => {
      expect(percentChange({ current: 150, previous: 100 })).toBe(50);
      expect(percentChange({ current: 50, previous: 100 })).toBe(-50);
      expect(percentChange({ current: 10, previous: 0 })).toBeNull();
    });
  });
});
