import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { LanguageService } from '@core/i18n/language.service';

/** Live preview of the product image URL typed in the form. */
@Component({
  selector: 'app-product-image-preview',
  imports: [MatIconModule],
  template: `
    @if (url() && !broken()) {
      <img [src]="url()" [alt]="alt()" (error)="broken.set(true)" />
    } @else {
      <div class="placeholder" role="img" [attr.aria-label]="placeholderLabel()">
        <mat-icon aria-hidden="true">{{ url() ? 'broken_image' : 'image' }}</mat-icon>
        <span>{{ placeholderLabel() }}</span>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      aspect-ratio: 1;
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      overflow: hidden;
      background: var(--mat-sys-surface-container);
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder {
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 8px;
      height: 100%;
      padding: 16px;
      color: var(--app-muted);
      text-align: center;
    }
    mat-icon {
      width: 40px;
      height: 40px;
      font-size: 40px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImagePreviewComponent {
  private readonly i18n = inject(LanguageService);

  readonly url = input('');
  readonly alt = input('');

  /** Resets whenever the URL changes, so a fixed URL gets a new chance to load. */
  protected readonly broken = linkedSignal({ source: this.url, computation: () => false });

  protected readonly placeholderLabel = computed(() =>
    this.i18n.t(this.url() ? 'products.form.previewBroken' : 'products.form.previewEmpty'),
  );
}
