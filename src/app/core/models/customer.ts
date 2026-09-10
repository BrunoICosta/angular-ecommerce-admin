export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  createdAt: string;
}

/** Customer enriched by the API with aggregates computed from its orders. */
export interface CustomerWithStats extends Customer {
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}
