/**
 * Intl helpers for values formatted in TypeScript (inside `computed()`), using
 * the active locale. Prices are always in BRL; only the formatting changes.
 */
export function formatBrl(value: number, locale: string, compact = false): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
    ...(compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}),
  }).format(value);
}

export function formatInteger(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}
