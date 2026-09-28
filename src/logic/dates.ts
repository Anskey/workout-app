export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Parses a plain "YYYY-MM-DD" string as a LOCAL calendar date. `new Date(dateISO)`
 * would parse it as UTC midnight instead, which then displays as the day before in
 * any timezone behind UTC (all of North America) once formatted with local getters
 * — every date in the app was showing one day early because of this. */
export function parseLocalISODate(dateISO: string): Date {
  const [y, m, d] = dateISO.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a: Date, b: Date): number {
  const ms = 1000 * 60 * 60 * 24;
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bb - aa) / ms);
}

export function daysSince(dateISO: string): number {
  return daysBetween(parseLocalISODate(dateISO), new Date());
}

export function formatShortDate(dateISO: string): string {
  const d = parseLocalISODate(dateISO);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatLongDate(dateISO: string): string {
  const d = parseLocalISODate(dateISO);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function lastNDates(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
