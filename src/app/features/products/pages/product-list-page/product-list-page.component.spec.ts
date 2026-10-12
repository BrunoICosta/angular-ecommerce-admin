import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { provideI18nTesting } from '@core/i18n/testing/i18n-testing';
import { Page, Product } from '@core/models';

import { ProductsService } from '../../data-access/products.service';
import { ProductListPageComponent } from './product-list-page.component';

const product = (id: number, stock: number): Product => ({
  id,
  sku: `ELE-${1000 + id}`,
  name: `Produto ${id}`,
  description: '',
  category: 'Eletrônicos',
  price: 99.9,
  stock,
  minStock: 5,
  imageUrl: '',
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
});

describe('ProductListPageComponent', () => {
  let fixture: ComponentFixture<ProductListPageComponent>;
  let api: jasmine.SpyObj<ProductsService>;
  const isAdmin = signal(true);

  async function render(page: Page<Product>): Promise<HTMLElement> {
    api.list.and.returnValue(of(page));
    fixture = TestBed.createComponent(ProductListPageComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  beforeEach(async () => {
    api = jasmine.createSpyObj<ProductsService>('ProductsService', ['list', 'deleteMany']);
    isAdmin.set(true);
    await TestBed.configureTestingModule({
      imports: [ProductListPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideI18nTesting(),
        provideRouter([]),
        { provide: ProductsService, useValue: api },
        { provide: AuthService, useValue: { isAdmin } },
      ],
    }).compileComponents();
  });

  it('requests the first page sorted by name by default', async () => {
    await render({ items: [], total: 0, page: 0, pageSize: 10 });
    expect(api.list).toHaveBeenCalledWith({
      page: 0,
      pageSize: 10,
      sort: 'name',
      dir: 'asc',
      q: '',
      category: '',
      stock: '',
    });
  });

  it('maps query params to the API query', async () => {
    api.list.and.returnValue(of({ items: [], total: 0, page: 1, pageSize: 25 }));
    fixture = TestBed.createComponent(ProductListPageComponent);
    fixture.componentRef.setInput('page', '2');
    fixture.componentRef.setInput('size', '25');
    fixture.componentRef.setInput('sort', 'price');
    fixture.componentRef.setInput('dir', 'desc');
    fixture.componentRef.setInput('stock', 'low_stock');
    fixture.componentRef.setInput('category', 'Categoria inválida');
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith(
      jasmine.objectContaining({
        page: 1,
        pageSize: 25,
        sort: 'price',
        dir: 'desc',
        stock: 'low_stock',
        category: '',
      }),
    );
  });

  it('renders rows with stock status chips', async () => {
    const element = await render({
      items: [product(1, 50), product(2, 3), product(3, 0)],
      total: 3,
      page: 0,
      pageSize: 10,
    });
    expect(element.querySelectorAll('tr.mat-mdc-row').length).toBe(3);
    const chips = [...element.querySelectorAll('app-status-chip > span')].map((c) =>
      c.textContent?.trim(),
    );
    expect(chips).toEqual(['Em estoque', 'Estoque baixo', 'Esgotado']);
  });

  it('lets admins select rows for bulk deletion', async () => {
    const element = await render({ items: [product(1, 50)], total: 1, page: 0, pageSize: 10 });
    element.querySelector<HTMLInputElement>('td mat-checkbox input')!.click();
    await fixture.whenStable();
    expect(element.querySelector('.bulk-bar')?.textContent).toContain('1 selecionado(s)');
  });

  it('hides selection and delete actions for managers', async () => {
    isAdmin.set(false);
    const element = await render({ items: [product(1, 50)], total: 1, page: 0, pageSize: 10 });
    expect(element.querySelector('mat-checkbox')).toBeNull();
    expect(element.querySelector('[aria-label^="Excluir"]')).toBeNull();
    expect(element.querySelector('[aria-label^="Editar"]')).not.toBeNull();
  });

  it('shows an empty state', async () => {
    const element = await render({ items: [], total: 0, page: 0, pageSize: 10 });
    expect(element.textContent).toContain('Nenhum produto encontrado');
  });
});
