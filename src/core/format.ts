/**
 * Port of the iOS app's YenFormat.swift / DateFormat.swift. Every yen amount and date shown
 * to the user goes through here, so formatting stays consistent across screens.
 */

/** "¥1,234" — rounds to the nearest whole yen for display (amounts may be fractional
 * internally when a percent split doesn't divide evenly, e.g. 33%). */
export function formatYen(amount: number): string {
  return `¥${Math.round(amount).toLocaleString("ja-JP")}`;
}

/** Rounds to 万 (10,000-yen) units once the value is large enough that the full figure
 * would crowd a small space (history chart axis labels). */
export function formatYenCompact(amount: number): string {
  const value = Math.abs(amount);
  if (value < 10000) return formatYen(amount);
  const sign = amount < 0 ? "-" : "";
  return `${sign}${(value / 10000).toFixed(1)}万`;
}

/** Normalizes user-typed amount text to ASCII digits only: full-width digits （０-９,
 * what a Japanese IME produces） are converted to half-width, everything else is dropped.
 * Runs after IME composition ends, so composing text is never mangled mid-conversion. */
export function normalizeAmountText(raw: string): string {
  return raw
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");
}

/** "7月9日" */
export function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/** "2026年7月" */
export function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

/** "2026年7月9日 10:30" */
export function formatFullDateTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${formatYearMonth(date)}${date.getDate()}日 ${h}:${m}`;
}

/** "2026-07-09" — for <input type="date"> value binding, local timezone. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear().toString().padStart(4, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses an <input type="date"> value ("yyyy-MM-dd") into a local-time Date preserving
 * the time-of-day from `base` (defaults to now), or null if malformed. */
export function fromDateInputValue(value: string, base: Date = new Date()): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const result = new Date(base);
  result.setFullYear(Number(y), Number(m) - 1, Number(d));
  return result;
}
