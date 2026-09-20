import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterLink } from '@angular/router';
import { Observable, finalize, startWith } from 'rxjs';

import { PRODUCT_CATEGORIES, Product, ProductCategory, ProductDraft } from '@core/models';
import { NotificationService } from '@core/notifications/notification.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

import { ProductImagePreviewComponent } from '../../components/product-image-preview/product-image-preview.component';
import { ProductsService } from '../../data-access/products.service';

export const SKU_PATTERN = /^[A-Z]{3}-\d{4}$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;

@Component({
  selector: 'app-product-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    PageHeaderComponent,
    ProductImagePreviewComponent,
  ],
  templateUrl: './product-form-page.component.html',
  styleUrl: './product-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPageComponent implements OnInit {
  private readonly productsApi = inject(ProductsService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  /** Resolved by `productResolver` on the edit route; undefined when creating. */
  readonly product = input<Product>();

  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly isEdit = computed(() => this.product() !== undefined);
  protected readonly title = computed(() => (this.isEdit() ? 'Editar produto' : 'Novo produto'));
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    sku: ['', [Validators.required, Validators.pattern(SKU_PATTERN)]],
    category: ['' as ProductCategory | '', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    minStock: [10, [Validators.required, Validators.min(0)]],
    imageUrl: ['', [Validators.pattern(URL_PATTERN)]],
    description: ['', Validators.maxLength(500)],
    active: [true],
  });

  protected readonly imageUrl = toSignal(
    this.form.controls.imageUrl.valueChanges.pipe(startWith(this.form.controls.imageUrl.value)),
    { initialValue: '' },
  );

  ngOnInit(): void {
    // patchValue ignores the keys the form does not have (id, createdAt).
    const product = this.product();
    if (product) this.form.patchValue(product);
  }

  protected skuToUpperCase(): void {
    const control = this.form.controls.sku;
    control.setValue(control.value.toUpperCase().trim());
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const draft: ProductDraft = { ...value, category: value.category as ProductCategory };
    const current = this.product();
    const request$: Observable<Product> = current
      ? this.productsApi.update({ ...current, ...draft })
      : this.productsApi.create(draft);

    this.saving.set(true);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe((saved) => {
      this.form.markAsPristine();
      this.notifications.success(
        current ? 'Produto atualizado.' : `Produto "${saved.name}" criado.`,
      );
      void this.router.navigate(['/products']);
    });
  }
}
