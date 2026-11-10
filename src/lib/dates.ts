const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM' -> { year, month } where month is 0-11. Throws on bad input. */
export function parseYm(ym: string): { year: number; month: number } {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) throw new Error(`Invalid YYYY-MM date: "${ym}"`);
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) throw new Error(`Invalid month in "${ym}"`);
  return { year, month };
}

/** 'YYYY-MM' -> absolute month index (year * 12 + month). */
export function monthIndex(ym: string): number {
  const { year, month } = parseYm(ym);
  return year * 12 + month;
}

/** Month index of a Date (defaults to now). */
export function monthIndexOfDate(d: Date = new Date()): number {
  return d.getFullYear() * 12 + d.getMonth();
}

/** Fractional month index for a Date, e.g. mid-month = +0.5. Used for the TODAY line. */
export function fractionalMonthIndex(d: Date = new Date()): number {
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return monthIndexOfDate(d) + (d.getDate() - 1) / daysInMonth;
}

export function formatYm(ym: string): string {
  const { year, month } = parseYm(ym);
  return `${MONTHS[month]} ${year}`;
}

/**
 * Format a date range.
 *  ('2026-01','2026-06') -> 'Jan – Jun 2026'
 *  ('2025-09','2026-02') -> 'Sep 2025 – Feb 2026'
 *  ('2026-08', null)     -> 'Aug 2026 – present'
 *  ('2026-06','2026-06') -> 'Jun 2026'
 */
export function formatRange(start: string, end: string | null, ongoing = 'present'): string {
  const s = parseYm(start);
  if (end === null) return `${formatYm(start)} – ${ongoing}`;
  const e = parseYm(end);
  if (s.year === e.year && s.month === e.month) return formatYm(start);
  if (s.year === e.year) return `${MONTHS[s.month]} – ${MONTHS[e.month]} ${e.year}`;
  return `${formatYm(start)} – ${formatYm(end)}`;
}

/** Compact mono format used in the About list: 'Apr 2026–now', 'Jul–Dec 2025'. */
export function formatRangeCompact(start: string, end: string | null): string {
  const s = parseYm(start);
  if (end === null) return `${MONTHS[s.month]} ${s.year}–now`;
  const e = parseYm(end);
  if (s.year === e.year) return `${MONTHS[s.month]}–${MONTHS[e.month]} ${e.year}`;
  return `${MONTHS[s.month]} ${s.year}–${MONTHS[e.month]} ${e.year}`;
}
