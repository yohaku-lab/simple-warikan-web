import { describe, expect, test } from "vitest";
import { currentMonthKey, isDateInMonth, monthInterval, monthKeyFor } from "./monthKey";

describe("monthKey", () => {
  test("monthKeyRoundTrips (ported from SimpleWarikanCoreTests.monthKeyRoundTrips)", () => {
    const date = new Date(2026, 6, 15); // 2026-07-15 local time
    const key = monthKeyFor(date);
    expect(key).toBe("2026-07");

    const interval = monthInterval(key);
    expect(interval).not.toBeNull();
    expect(interval!.start.getMonth()).toBe(6); // July, 0-indexed
  });

  test("monthKeyFor pads single-digit months", () => {
    expect(monthKeyFor(new Date(2026, 0, 1))).toBe("2026-01");
  });

  test("monthInterval spans the whole month, exclusive end", () => {
    const interval = monthInterval("2026-02")!;
    expect(interval.start).toEqual(new Date(2026, 1, 1, 0, 0, 0, 0));
    expect(interval.end).toEqual(new Date(2026, 2, 1, 0, 0, 0, 0));
  });

  test("monthInterval returns null for malformed keys", () => {
    expect(monthInterval("not-a-key")).toBeNull();
    expect(monthInterval("2026-13")).toBeNull();
    expect(monthInterval("2026")).toBeNull();
    expect(monthInterval("")).toBeNull();
  });

  test("isDateInMonth respects the exclusive end boundary", () => {
    expect(isDateInMonth(new Date(2026, 6, 1, 0, 0, 0), "2026-07")).toBe(true);
    expect(isDateInMonth(new Date(2026, 6, 31, 23, 59, 59), "2026-07")).toBe(true);
    expect(isDateInMonth(new Date(2026, 7, 1, 0, 0, 0), "2026-07")).toBe(false);
  });

  test("currentMonthKey matches monthKeyFor(new Date())", () => {
    expect(currentMonthKey()).toBe(monthKeyFor(new Date()));
  });
});
