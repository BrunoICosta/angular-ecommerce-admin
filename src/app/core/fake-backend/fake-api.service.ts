import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions, STATUS } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';

import {
  DEMO_PASSWORD,
  LoginRequest,
  LoginResponse,
  SessionUser,
  TOKEN_TTL_SECONDS,
} from '../auth/auth.model';
import { createMockToken, decodeToken, isExpired } from '../auth/jwt.util';
import { SeedData, generateSeedData } from './seed/seed-data';
import {
  ApiError,
  ApiErrorCode,
  CustomerWithStats,
  Order,
  OrderStatus,
  Product,
  ProductDraft,
  StockStatus,
  canTransition,
  stockStatus,
} from '../models';
import { buildDashboardSummary } from './dashboard-summary';
import { ListOptions, applyListQuery, parseListQuery } from './list-query';

const productListOptions: ListOptions<Product> = {
  searchFields: ['name', 'sku', 'category'],
  sortable: ['name', 'sku', 'category', 'price', 'stock', 'createdAt'],
  defaultSort: { field: 'name', direction: 'asc' },
  filters: {
    category: (product, value) => product.category === value,
    stock: (product, value) => stockStatus(product) === (value as StockStatus),
  },
};

const orderListOptions: ListOptions<Order> = {
  searchFields: ['number', 'customerName', 'city'],
  sortable: ['number', 'customerName', 'total', 'status', 'createdAt'],
  defaultSort: { field: 'createdAt', direction: 'desc' },
  filters: {
    status: (order, value) => order.status === (value as OrderStatus),
    customerId: (order, value) => order.customerId === Number(value),
  },
};

const customerListOptions: ListOptions<CustomerWithStats> = {
  searchFields: ['name', 'email', 'city'],
  sortable: ['name', 'email', 'city', 'createdAt', 'ordersCount', 'totalSpent', 'lastOrderAt'],
  defaultSort: { field: 'name', direction: 'asc' },
  filters: {
    state: (customer, value) => customer.state === value,
  },
};

/**
 * Fake REST API backed by angular-in-memory-web-api. It only runs in the
 * browser, which keeps the demo deployable to GitHub Pages. Endpoints that need
 * more than plain CRUD (pagination, aggregates, business rules) are handled here;
 * everything else falls through to the library's default behaviour.
 */
@Injectable()
export class FakeApiService implements InMemoryDbService {
  createDb(): SeedData {
    return generateSeedData(new Date());
  }

  // HTTP method hooks called by angular-in-memory-web-api. Returning
  // `undefined` lets the library handle the request with its default CRUD logic.

  get(reqInfo: RequestInfo): Observable<unknown> | undefined {
    return this.authorize(reqInfo) ?? this.handleGet(reqInfo);
  }

  post(reqInfo: RequestInfo): Observable<unknown> | undefined {
    if (reqInfo.collectionName === 'auth' && reqInfo.id === 'login') return this.login(reqInfo);
    return this.authorize(reqInfo) ?? this.handlePost(reqInfo);
  }

  put(reqInfo: RequestInfo): Observable<unknown> | undefined {
    return this.authorize(reqInfo) ?? this.handlePut(reqInfo);
  }

  delete(reqInfo: RequestInfo): Observable<unknown> | undefined {
    return this.authorize(reqInfo) ?? undefined;
  }

  /**
   * Mimics what an API gateway would do: every endpoint needs a valid bearer
   * token, deletions and user management are restricted to admins.
   */
  private authorize(reqInfo: RequestInfo): Observable<unknown> | null {
    const header = (reqInfo.req as HttpRequest<unknown>).headers.get('Authorization') ?? '';
    const claims = header.startsWith('Bearer ') ? decodeToken(header.slice(7)) : null;
    if (!claims) {
      return this.error(
        reqInfo,
        STATUS.UNAUTHORIZED,
        'unauthenticated',
        'Autenticação necessária.',
      );
    }
    if (isExpired(claims)) {
      return this.error(reqInfo, STATUS.UNAUTHORIZED, 'session_expired', 'Sua sessão expirou.');
    }
    const adminOnly = reqInfo.method === 'delete' || reqInfo.collectionName === 'users';
    if (adminOnly && claims.role !== 'admin') {
      return this.error(
        reqInfo,
        STATUS.FORBIDDEN,
        'forbidden',
        'Você não tem permissão para esta ação.',
      );
    }
    return null;
  }

  private handleGet(reqInfo: RequestInfo): Observable<unknown> | undefined {
    const db = this.db(reqInfo);
    const query = parseListQuery(reqInfo.query);

    switch (reqInfo.collectionName) {
      case 'dashboard':
        return this.ok(reqInfo, buildDashboardSummary(db));
      case 'products':
        return reqInfo.id
          ? undefined
          : this.ok(reqInfo, applyListQuery(db.products, query, productListOptions));
      case 'orders':
        return reqInfo.id
          ? undefined
          : this.ok(reqInfo, applyListQuery(db.orders, query, orderListOptions));
      case 'customers': {
        const customers = withStats(db);
        if (reqInfo.id) {
          const customer = customers.find((c) => c.id === Number(reqInfo.id));
          return customer
            ? this.ok(reqInfo, customer)
            : this.error(
                reqInfo,
                STATUS.NOT_FOUND,
                'customer_not_found',
                'Cliente não encontrado.',
              );
        }
        return this.ok(reqInfo, applyListQuery(customers, query, customerListOptions));
      }
      default:
        return undefined;
    }
  }

  private handlePost(reqInfo: RequestInfo): Observable<unknown> | undefined {
    return reqInfo.collectionName === 'products' ? this.createProduct(reqInfo) : undefined;
  }

  private login(reqInfo: RequestInfo): Observable<unknown> {
    const { email, password } = reqInfo.utils.getJsonBody(reqInfo.req) as LoginRequest;
    const user = this.db(reqInfo).users.find(
      (u) => u.email.toLowerCase() === email?.trim().toLowerCase(),
    );
    if (!user || password !== DEMO_PASSWORD) {
      return this.error(
        reqInfo,
        STATUS.UNAUTHORIZED,
        'invalid_credentials',
        'E-mail ou senha inválidos.',
      );
    }
    if (!user.active) {
      return this.error(
        reqInfo,
        STATUS.FORBIDDEN,
        'user_inactive',
        'Este usuário está desativado.',
      );
    }
    user.lastLoginAt = new Date().toISOString();
    const session: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const body: LoginResponse = {
      token: createMockToken(
        { sub: user.id, name: user.name, email: user.email, role: user.role },
        TOKEN_TTL_SECONDS,
      ),
      user: session,
    };
    return this.ok(reqInfo, body);
  }

  private createProduct(reqInfo: RequestInfo): Observable<unknown> {
    const db = this.db(reqInfo);
    const draft = reqInfo.utils.getJsonBody(reqInfo.req) as ProductDraft;
    if (db.products.some((p) => p.sku.toLowerCase() === draft.sku.toLowerCase())) {
      return this.error(
        reqInfo,
        STATUS.CONFLICT,
        'duplicate_sku',
        `Já existe um produto com o SKU ${draft.sku}.`,
        { sku: draft.sku },
      );
    }
    const product: Product = {
      ...draft,
      id: Math.max(0, ...db.products.map((p) => p.id)) + 1,
      createdAt: new Date().toISOString(),
    };
    db.products.push(product);
    return this.ok(reqInfo, product, STATUS.CREATED);
  }

  private handlePut(reqInfo: RequestInfo): Observable<unknown> | undefined {
    if (reqInfo.collectionName !== 'orders') return undefined;

    // Orders only accept status changes, validated against the workflow.
    const db = this.db(reqInfo);
    const order = db.orders.find((o) => o.id === Number(reqInfo.id));
    if (!order)
      return this.error(reqInfo, STATUS.NOT_FOUND, 'order_not_found', 'Pedido não encontrado.');

    const { status } = reqInfo.utils.getJsonBody(reqInfo.req) as Pick<Order, 'status'>;
    if (status === order.status) return this.ok(reqInfo, order);
    if (!canTransition(order.status, status)) {
      return this.error(
        reqInfo,
        STATUS.UNPROCESSABLE_ENTRY,
        'invalid_transition',
        'Esta mudança de status não é permitida para o pedido.',
      );
    }
    order.status = status;
    order.history = [...order.history, { status, at: new Date().toISOString() }];
    return this.ok(reqInfo, order);
  }

  private db(reqInfo: RequestInfo): SeedData {
    return reqInfo.utils.getDb() as SeedData;
  }

  private ok(reqInfo: RequestInfo, body: object, status = STATUS.OK): Observable<unknown> {
    return reqInfo.utils.createResponse$((): ResponseOptions => ({
      status,
      // Cloned so callers never hold references to the in-memory records.
      body: structuredClone(body),
      headers: reqInfo.headers,
      url: reqInfo.url,
    }));
  }

  /**
   * Errors carry a stable `code` (translated by the UI) plus a pt-BR message
   * for clients that do not know the code.
   */
  private error(
    reqInfo: RequestInfo,
    status: number,
    code: ApiErrorCode,
    message: string,
    params?: ApiError['params'],
  ): Observable<unknown> {
    const body: ApiError = { error: message, code, params };
    return reqInfo.utils.createResponse$((): ResponseOptions => ({
      status,
      body,
      headers: reqInfo.headers,
      url: reqInfo.url,
    }));
  }
}

/** Joins every customer with aggregates computed from its orders. */
export function withStats(db: Pick<SeedData, 'customers' | 'orders'>): CustomerWithStats[] {
  const stats = new Map<number, { count: number; spent: number; last: string | null }>();
  for (const order of db.orders) {
    const entry = stats.get(order.customerId) ?? { count: 0, spent: 0, last: null };
    entry.count += 1;
    if (order.status !== 'cancelled') entry.spent += order.total;
    if (!entry.last || order.createdAt > entry.last) entry.last = order.createdAt;
    stats.set(order.customerId, entry);
  }
  return db.customers.map((customer) => {
    const entry = stats.get(customer.id);
    return {
      ...customer,
      ordersCount: entry?.count ?? 0,
      totalSpent: Math.round((entry?.spent ?? 0) * 100) / 100,
      lastOrderAt: entry?.last ?? null,
    };
  });
}
