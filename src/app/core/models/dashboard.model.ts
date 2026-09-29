/** A metric for the last 30 days and for the 30 days before, to compute trends. */
export interface PeriodMetric {
  current: number;
  previous: number;
}

export interface MonthlyRevenue {
  /** `YYYY-MM`, local time. */
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: number;
  name: string;
  quantity: number;
  revenue: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
}

export interface DashboardSummary {
  generatedAt: string;
  revenue: PeriodMetric;
  orders: PeriodMetric;
  averageTicket: PeriodMetric;
  newCustomers: PeriodMetric;
  revenueByMonth: MonthlyRevenue[];
  /** Best sellers by revenue in the last 90 days. */
  topProducts: TopProduct[];
  /** Active products at or below their minimum stock, most critical first. */
  lowStock: LowStockProduct[];
  lowStockTotal: number;
}

/** Percentage change from `previous` to `current`; `null` when there is no baseline. */
export function percentChange({ current, previous }: PeriodMetric): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
