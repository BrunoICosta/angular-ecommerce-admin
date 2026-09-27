import { Injectable, Provider } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PtBrPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Itens por página';
  override nextPageLabel = 'Próxima página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primeira página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) return '0 de 0';
    const start = page * pageSize + 1;
    const end = Math.min(length, (page + 1) * pageSize);
    return `${start} – ${end} de ${length}`;
  };
}

/**
 * Provided per list feature (route providers) instead of globally: importing
 * the paginator entry point from app.config pulled MatSelect and MatFormField
 * into the initial bundle.
 */
export function providePtBrPaginatorIntl(): Provider {
  return { provide: MatPaginatorIntl, useClass: PtBrPaginatorIntl };
}
