import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { Language } from '@core/i18n/i18n.model';
import { provideI18nTesting } from '@core/i18n/testing/i18n-testing';
import { Product } from '@core/models';
import { provideI18nPaginatorIntl } from '@shared/i18n/paginator-intl';

import { ProductsService } from '../../data-access/products.service';
import { ProductListPageComponent } from './product-list-page.component';

const product: Product = {
  id: 1,
  sku: 'CAS-1017',
  name: 'Air Fryer 5L',
  description: '',
  category: 'Casa e Cozinha',
  price: 1479.9,
  stock: 3,
  minStock: 5,
  imageUrl: '',
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
};

async function render(lang: Language): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [ProductListPageComponent],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      provideI18nTesting(lang),
      provideI18nPaginatorIntl(),
      {
        provide: ProductsService,
        useValue: { list: () => of({ items: [product], total: 31, page: 0, pageSize: 10 }) },
      },
      { provide: AuthService, useValue: { isAdmin: signal(false) } },
    ],
  });
  const fixture = TestBed.createComponent(ProductListPageComponent);
  await fixture.whenStable();
  return fixture.nativeElement;
}

const text = (element: HTMLElement, selector: string) =>
  element.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

describe('ProductListPageComponent i18n', () => {
  it('renders in Portuguese with pt-BR formatting', async () => {
    const element = await render('pt-BR');
    expect(text(element, 'h1')).toBe('Produtos');
    expect(text(element, 'td.hide-sm')).toBe('Casa e Cozinha');
    expect(text(element, 'td.num')).toBe('R$ 1.479,90');
    expect(text(element, 'app-status-chip > span')).toBe('Estoque baixo');
    expect(text(element, '.mat-mdc-paginator-range-label')).toBe('1 – 10 de 31');
  });

  it('renders in English with en-US formatting, prices still in BRL', async () => {
    const element = await render('en');
    expect(text(element, 'h1')).toBe('Products');
    expect(text(element, 'td.hide-sm')).toBe('Home & Kitchen');
    expect(text(element, 'td.num')).toBe('R$1,479.90');
    expect(text(element, 'app-status-chip > span')).toBe('Low stock');
    expect(text(element, '.mat-mdc-paginator-range-label')).toBe('1 – 10 of 31');
  });

  it('updates the paginator labels on a live language switch', async () => {
    await render('pt-BR');
    const intl = TestBed.inject(MatPaginatorIntl);
    expect(intl.itemsPerPageLabel).toBe('Itens por página');

    TestBed.inject(TranslocoService).setActiveLang('en');
    expect(intl.itemsPerPageLabel).toBe('Items per page');
    expect(intl.getRangeLabel(1, 10, 31)).toBe('11 – 20 of 31');
  });
});
