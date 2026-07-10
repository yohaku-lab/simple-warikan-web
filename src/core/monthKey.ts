/**
 * Port of SimpleWarikanCore's MonthKey.swift. Plain "yyyy-MM" identifier for a calendar
 * month, built from local date components (not UTC) — used as a storage/grouping key for
 * settlement records and history lookups.
 */

export type MonthKeyString = string;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** "yyyy-MM" for the given date, using the local timezone. */
export function monthKeyFor(date: Date): MonthKeyString {
  return `${date.getFullYear().toString().padStart(4, "0")}-${pad2(date.getMonth() + 1)}`;
}

export function currentMonthKey(): MonthKeyString {
  return monthKeyFor(new Date());
}

export interface MonthInterval {
  /** Inclusive start of the month, local time. */
  start: Date;
  /** Exclusive end of the month (start of the next month), local time. */
  end: Date;
}

/** Parses a "yyyy-MM" key into the local-time interval it spans, or null if malformed. */
export function monthInterval(monthKey: MonthKeyString): MonthInterval | null {
  const parts = monthKey.split("-");
  if (parts.length !== 2) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
}

export function isDateInMonth(date: Date, monthKey: MonthKeyString): boolean {
  const interval = monthInterval(monthKey);
  if (!interval) return false;
  return date >= interval.start && date < interval.end;
}
