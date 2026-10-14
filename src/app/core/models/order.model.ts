export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

// Display labels live in the translation files: `enums.orderStatus.*`, `enums.paymentMethod.*`.

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
  by?: string;
}

export interface Order {
  id: number;
  number: string;
  customerId: number;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  city: string;
  state: string;
  createdAt: string;
  history: OrderEvent[];
}

/** Allowed transitions of the order workflow. Final states have no successors. */
const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function nextStatuses(status: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[status];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
