import { formatBrl } from '@shared/utils/format.util';

/** Compact BRL for axis ticks ("R$ 12,5 mil" / "R$12.5K"), full value otherwise. */
export function formatCompactBrl(value: number, locale: string, short = true): string {
  return formatBrl(value, locale, short);
}

/** "2026-03" -> "mar. de 26" (pt-BR) / "Mar 26" (en-US). */
export function monthLabel(month: string, locale: string): string {
  const [year, monthIndex] = month.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' }).format(
    new Date(year, monthIndex - 1, 1),
  );
}
