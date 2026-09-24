import { Pipe, PipeTransform } from '@angular/core';

/**
 * Maps an enum-like value to its display label:
 * `{{ order.paymentMethod | label: paymentLabels }}`.
 */
@Pipe({ name: 'label' })
export class LabelPipe implements PipeTransform {
  transform<K extends string>(value: K | null | undefined, labels: Record<K, string>): string {
    return value ? (labels[value] ?? value) : '';
  }
}
