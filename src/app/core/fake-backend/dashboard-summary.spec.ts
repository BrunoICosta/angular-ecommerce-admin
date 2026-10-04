import { Customer, Order, Product } from '../models';
import { buildDashboardSummary, lastMonths } from './dashboard-summary';

const now = new Date(2026, 9, 1, 12); // 1 Oct 2026, local time
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

function order(
  id: number,
  total: number,
  age: number,
  status: Order['status'] = 'delivered',
): Order {
  return {
    id,
    number: `#${id}`,
    customerId: 1,
    customerName: 'Ana',
    items: [{ productId: id, productName: `P${id}`, unitPrice: total, quantity: 1 }],
    subtotal: total,
    shipping: 0,
    total,
    status,
    paymentMethod: 'pix',
    city: 'Recife',
    state: 'PE',
    createdAt: daysAgo(age),
    history: [],
  };
}

const product = (id: number, stock: number, minStock: number, active = true): Product => ({
  id,
  sku: `SKU-${id}`,
  name: `Produto ${id}`,
  description: '',
  category: 'Livros',
  price: 10,
  stock,
  minStock,
  imageUrl: '',
  active,
  createdAt: daysAgo(100),
});

const customer = (id: number, age: number): Customer => ({
  id,
  name: `C${id}`,
  email: `c${id}@x.com`,
  phone: '',
  city: 'Recife',
  state: 'PE',
  createdAt: daysAgo(age),
});

describe('buildDashboardSummary', () => {
  const summary = buildDashboardSummary(
    {
      orders: [
        order(1, 100, 1),
        order(2, 300, 10),
        order(3, 1000, 5, 'cancelled'),
        order(4, 200, 40),
        order(5, 50, 400),
      ],
      customers: [customer(1, 3), customer(2, 45), customer(3, 50)],
      products: [product(1, 0, 5), product(2, 3, 10), product(3, 50, 10), product(4, 0, 5, false)],
    },
    now,
  );

  it('compares the last 30 days with the previous 30, ignoring cancelled orders', () => {
    expect(summary.revenue).toEqual({ current: 400, previous: 200 });
    expect(summary.orders).toEqual({ current: 2, previous: 1 });
    expect(summary.averageTicket).toEqual({ current: 200, previous: 200 });
    expect(summary.newCustomers).toEqual({ current: 1, previous: 2 });
  });

  it('buckets revenue in the last 12 months, oldest first', () => {
    expect(summary.revenueByMonth.length).toBe(12);
    expect(summary.revenueByMonth[0].month).toBe('2025-11');
    expect(summary.revenueByMonth[11].month).toBe('2026-10');
    const september = summary.revenueByMonth.find((m) => m.month === '2026-09');
    expect(september).toEqual({ month: '2026-09', revenue: 400, orders: 2 });
  });

  it('ranks top products by revenue', () => {
    expect(summary.topProducts.map((p) => p.productId)).toEqual([2, 4, 1]);
  });

  it('lists active products below minimum stock, most critical first', () => {
    expect(summary.lowStock.map((p) => p.id)).toEqual([1, 2]);
    expect(summary.lowStockTotal).toBe(2);
  });
});

describe('lastMonths', () => {
  it('crosses year boundaries', () => {
    expect(lastMonths(new Date(2026, 1, 15), 3)).toEqual(['2025-12', '2026-01', '2026-02']);
  });
});
