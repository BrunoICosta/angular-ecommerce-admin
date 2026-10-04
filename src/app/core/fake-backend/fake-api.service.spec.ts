import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { DEMO_PASSWORD, LoginResponse } from '../auth/auth.model';
import { Order, Page, Product } from '../models';
import { FAKE_BACKEND_CONFIG, provideFakeBackend } from './fake-backend.provider';

/** Integration test: real HttpClient against the in-memory API (no latency). */
describe('FakeApiService', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideFakeBackend({ ...FAKE_BACKEND_CONFIG, delay: 0 }),
      ],
    });
    http = TestBed.inject(HttpClient);
  });

  async function login(email: string): Promise<string> {
    const res = await firstValueFrom(
      http.post<LoginResponse>('api/auth/login', { email, password: DEMO_PASSWORD }),
    );
    return res.token;
  }

  const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

  async function statusOf(promise: Promise<unknown>): Promise<number> {
    try {
      await promise;
      return 200;
    } catch (error) {
      return error instanceof HttpErrorResponse ? error.status : -1;
    }
  }

  it('rejects wrong credentials with a 401 HttpErrorResponse', async () => {
    const request = firstValueFrom(
      http.post('api/auth/login', { email: 'admin@loja.com', password: 'wrong' }),
    );
    await expectAsync(request).toBeRejectedWith(jasmine.any(HttpErrorResponse));
    expect(await statusOf(request)).toBe(401);
  });

  it('requires a token for data endpoints', async () => {
    expect(await statusOf(firstValueFrom(http.get('api/products')))).toBe(401);
  });

  it('returns paginated, sorted and filtered products', async () => {
    const token = await login('admin@loja.com');
    const page = await firstValueFrom(
      http.get<Page<Product>>('api/products?pageSize=5&sort=price&dir=desc', auth(token)),
    );
    expect(page.items.length).toBe(5);
    expect(page.total).toBe(60);
    const prices = page.items.map((p) => p.price);
    expect([...prices].sort((a, b) => b - a)).toEqual(prices);

    const filtered = await firstValueFrom(
      http.get<Page<Product>>('api/products?stock=out_of_stock&pageSize=100', auth(token)),
    );
    expect(filtered.items.every((p) => p.stock === 0)).toBeTrue();
  });

  it('only lets admins delete and manage users', async () => {
    const manager = await login('manager@loja.com');
    expect(await statusOf(firstValueFrom(http.delete('api/products/1', auth(manager))))).toBe(403);
    expect(await statusOf(firstValueFrom(http.get('api/users', auth(manager))))).toBe(403);

    const admin = await login('admin@loja.com');
    expect(await statusOf(firstValueFrom(http.delete('api/products/1', auth(admin))))).toBe(200);
  });

  it('validates order status transitions and records them in the history', async () => {
    const token = await login('admin@loja.com');
    const page = await firstValueFrom(
      http.get<Page<Order>>('api/orders?status=delivered&pageSize=1', auth(token)),
    );
    const delivered = page.items[0];
    const invalid = firstValueFrom(
      http.put(`api/orders/${delivered.id}`, { status: 'pending' }, auth(token)),
    );
    expect(await statusOf(invalid)).toBe(422);

    const pending = await firstValueFrom(
      http.get<Page<Order>>('api/orders?status=pending&pageSize=1', auth(token)),
    );
    if (pending.total > 0) {
      const updated = await firstValueFrom(
        http.put<Order>(`api/orders/${pending.items[0].id}`, { status: 'paid' }, auth(token)),
      );
      expect(updated.status).toBe('paid');
      expect(updated.history.at(-1)?.status).toBe('paid');
    }
  });
});
