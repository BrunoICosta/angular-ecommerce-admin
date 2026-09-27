import { DashboardSummary, MonthlyRevenue, Order, PeriodMetric } from '../models';
import { SeedData } from './seed/seed-data';

const DAY = 86_400_000;
const PERIOD_DAYS = 30;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Keys of the last `count` months, oldest first, ending at the month of `now`. */
export function lastMonths(now: Date, count = 12): string[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return monthKey(date);
  });
}

function metric(
  items: readonly { at: number }[],
  now: number,
  value: (index: number) => number,
): PeriodMetric {
  const result = { current: 0, previous: 0 };
  items.forEach((item, index) => {
    const age = now - item.at;
    if (age < 0) return;
    if (age < PERIOD_DAYS * DAY) result.current += value(index);
    else if (age < 2 * PERIOD_DAYS * DAY) result.previous += value(index);
  });
  return { current: round2(result.current), previous: round2(result.previous) };
}

/**
 * Aggregates shown on the dashboard. Cancelled orders never count as revenue
 * nor as orders. Pure function of the data and the clock, so it is unit tested.
 */
export function buildDashboardSummary(
  db: Pick<SeedData, 'orders' | 'customers' | 'products'>,
  now: Date = new Date(),
): DashboardSummary {
  const time = now.getTime();
  const valid: Order[] = db.orders.filter((order) => order.status !== 'cancelled');
  const orderTimes = valid.map((order) => ({ at: new Date(order.createdAt).getTime() }));

  const revenue = metric(orderTimes, time, (i) => valid[i].total);
  const orders = metric(orderTimes, time, () => 1);
  const averageTicket: PeriodMetric = {
    current: orders.current ? round2(revenue.current / orders.current) : 0,
    previous: orders.previous ? round2(revenue.previous / orders.previous) : 0,
  };
  const newCustomers = metric(
    db.customers.map((customer) => ({ at: new Date(customer.createdAt).getTime() })),
    time,
    () => 1,
  );

  const months = new Map<string, MonthlyRevenue>(
    lastMonths(now).map((month) => [month, { month, revenue: 0, orders: 0 }]),
  );
  for (const order of valid) {
    const bucket = months.get(monthKey(new Date(order.createdAt)));
    if (!bucket) continue;
    bucket.revenue = round2(bucket.revenue + order.total);
    bucket.orders += 1;
  }

  return {
    generatedAt: now.toISOString(),
    revenue,
    orders,
    averageTicket,
    newCustomers,
    revenueByMonth: [...months.values()],
  };
}
