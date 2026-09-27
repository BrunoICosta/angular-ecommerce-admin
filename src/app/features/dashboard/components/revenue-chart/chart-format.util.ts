const compact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const full = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' });

/** "R$ 12,5 mil" for axis ticks, or the full value ("R$ 12.480,90") for tooltips. */
export function formatCompactBrl(value: number, short = true): string {
  return (short ? compact : full).format(value);
}

/** "2026-03" -> "mar. de 26" (pt-BR short month + 2-digit year). */
export function monthLabel(month: string): string {
  const [year, monthIndex] = month.split('-').map(Number);
  return monthFormat.format(new Date(year, monthIndex - 1, 1));
}
