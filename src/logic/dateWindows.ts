import { parseLocalISODate } from './dates';

export type DateWindow = '3m' | '6m' | '1y' | 'all';

export const DATE_WINDOWS: { key: DateWindow; label: string; days: number | null }[] = [
  { key: '3m', label: '3M', days: 90 },
  { key: '6m', label: '6M', days: 182 },
  { key: '1y', label: '1Y', days: 365 },
  { key: 'all', label: 'All', days: null },
];

/** Keeps only items dated within the given window (e.g. "last 90 days"), or everything
 * for 'all' — so a chart can go back as far as the user wants instead of a fixed cutoff. */
export function filterByWindow<T extends { date: string }>(items: T[], window: DateWindow): T[] {
  const days = DATE_WINDOWS.find((w) => w.key === window)?.days;
  if (days == null) return items;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter((item) => parseLocalISODate(item.date) >= cutoff);
}
