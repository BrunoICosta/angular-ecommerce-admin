import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { LowStockProduct } from '@core/models';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-low-stock-alert',
  imports: [MatButtonModule, MatIconModule, RouterLink, ErrorStateComponent, StatusChipComponent],
  template: `
    @if (products().length === 0) {
      <app-error-state
        icon="inventory"
        title="Estoque em dia"
        message="Nenhum produto ativo abaixo do estoque mínimo."
      />
    } @else {
      <ul>
        @for (product of products(); track product.id) {
          <li>
            <div class="info">
              <a [routerLink]="['/products', product.id, 'edit']">{{ product.name }}</a>
              <small>{{ product.sku }} · mínimo {{ product.minStock }}</small>
            </div>
            @if (product.stock === 0) {
              <app-status-chip tone="danger" icon="block">Esgotado</app-status-chip>
            } @else {
              <app-status-chip tone="warning" icon="warning">
                {{ product.stock }} {{ product.stock === 1 ? 'unidade' : 'unidades' }}
              </app-status-chip>
            }
          </li>
        }
      </ul>
      @if (total() > products().length) {
        <a mat-button routerLink="/products" [queryParams]="{ stock: 'low_stock' }">
          Ver produtos com estoque baixo <mat-icon iconPositionEnd>arrow_forward</mat-icon>
        </a>
      }
    }
  `,
  styles: `
    ul {
      display: grid;
      margin: 0 0 8px;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--app-card-border);
    }
    li:last-child {
      border-bottom: 0;
    }
    .info {
      display: grid;
      min-width: 0;
    }
    .info a {
      overflow: hidden;
      color: inherit;
      font-weight: 500;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-decoration: none;
    }
    .info a:hover {
      color: var(--mat-sys-primary);
      text-decoration: underline;
    }
    small {
      color: var(--app-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LowStockAlertComponent {
  readonly products = input.required<readonly LowStockProduct[]>();
  readonly total = input(0);
}
