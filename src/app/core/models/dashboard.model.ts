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

export interface DashboardSummary {
  generatedAt: string;
  revenue: PeriodMetric;
  orders: PeriodMetric;
  averageTicket: PeriodMetric;
  newCustomers: PeriodMetric;
  revenueByMonth: MonthlyRevenue[];
}

/** Percentage change from `previous` to `current`; `null` when there is no baseline. */
export function percentChange({ current, previous }: PeriodMetric): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
