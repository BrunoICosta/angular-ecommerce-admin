import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideI18nTesting } from '../../i18n/testing/i18n-testing';
import { BreadcrumbComponent } from './breadcrumb.component';

@Component({
  selector: 'app-host',
  imports: [BreadcrumbComponent],
  template: '<app-breadcrumb />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {}

describe('BreadcrumbComponent', () => {
  it('builds crumbs from static and resolved route data', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideI18nTesting(),
        provideRouter([
          {
            path: 'products',
            data: { breadcrumb: 'nav.products' },
            children: [
              { path: '', component: HostComponent },
              {
                path: ':id/edit',
                component: HostComponent,
                resolve: { product: () => ({ name: 'Air Fryer 5L' }) },
                data: { breadcrumb: (data: { product: { name: string } }) => data.product.name },
              },
            ],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/products/7/edit');
    harness.detectChanges();

    const links = [...harness.routeNativeElement!.querySelectorAll('a')];
    expect(links.map((a) => [a.textContent?.trim(), a.getAttribute('href')])).toEqual([
      ['Produtos', '/products'],
    ]);
    expect(harness.routeNativeElement!.querySelector('[aria-current="page"]')?.textContent).toBe(
      'Air Fryer 5L',
    );
  });
});
