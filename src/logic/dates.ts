export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a: Date, b: Date): number {
  const ms = 1000 * 60 * 60 * 24;
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bb - aa) / ms);
}

export function daysSince(dateISO: string): number {
  return daysBetween(new Date(dateISO), new Date());
}

export function formatShortDate(dateISO: string): string {
  const d = new Date(dateISO);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatLongDate(dateISO: string): string {
  const d = new Date(dateISO);
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
