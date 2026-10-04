import { CUSTOMER_COUNT, ORDER_COUNT, PRODUCT_COUNT, generateSeedData } from './seed-data';

describe('generateSeedData', () => {
  const referenceDate = new Date('2026-10-01T12:00:00Z');
  const data = generateSeedData(referenceDate);

  it('generates the expected amount of records', () => {
    expect(data.products.length).toBe(PRODUCT_COUNT);
    expect(data.customers.length).toBe(CUSTOMER_COUNT);
    expect(data.orders.length).toBe(ORDER_COUNT);
    expect(data.users.map((u) => u.email)).toContain('admin@loja.com');
    expect(data.users.map((u) => u.email)).toContain('manager@loja.com');
  });

  it('is deterministic for the same reference date', () => {
    expect(generateSeedData(referenceDate)).toEqual(data);
  });

  it('uses unique product SKUs and names', () => {
    expect(new Set(data.products.map((p) => p.sku)).size).toBe(PRODUCT_COUNT);
    expect(new Set(data.products.map((p) => p.name)).size).toBe(PRODUCT_COUNT);
  });

  it('numbers orders chronologically', () => {
    const dates = data.orders.map((o) => o.createdAt);
    expect([...dates].sort()).toEqual(dates);
    expect(data.orders[0].number).toBe('#10001');
  });

  it('keeps order totals consistent with their items', () => {
    for (const order of data.orders) {
      const subtotal = order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      expect(order.subtotal).toBeCloseTo(subtotal, 2);
      expect(order.total).toBeCloseTo(order.subtotal + order.shipping, 2);
    }
  });

  it('records a history that ends with the current status, never in the future', () => {
    for (const order of data.orders) {
      expect(order.history[0].status).toBe('pending');
      expect(order.history.at(-1)?.status).toBe(order.status);
      for (const event of order.history) {
        expect(new Date(event.at).getTime()).toBeLessThanOrEqual(referenceDate.getTime());
      }
    }
  });

  it('includes products in every stock situation', () => {
    expect(data.products.some((p) => p.stock === 0)).toBeTrue();
    expect(data.products.some((p) => p.stock > 0 && p.stock <= p.minStock)).toBeTrue();
  });
});
