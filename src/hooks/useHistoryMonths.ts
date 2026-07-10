import { useMemo } from "react";
import type { Settlement } from "../core/settlement";
import { settle } from "../core/settlement";
import { currentMonthKey, monthInterval, monthKeyFor } from "../core/monthKey";
import { useStore } from "../store/StoreContext";

export interface MonthSummary {
  monthKey: string;
  monthStart: Date;
  settlement: Settlement;
  isSettled: boolean;
}

/** Every past month (excludes the current month) that has at least one expense, newest
 * first, each with its settlement pre-computed — mirrors HistoryView.swift's
 * `pastMonthSummaries`. */
export function useHistoryMonths(): MonthSummary[] {
  const { store } = useStore();
  return useMemo(() => {
    const nowKey = currentMonthKey();
    const settledKeys = new Set(store.settledMonths);
    const grouped = new Map<string, typeof store.expenses>();
    for (const expense of store.expenses) {
      const key = monthKeyFor(new Date(expense.date));
      if (key === nowKey) continue;
      const bucket = grouped.get(key);
      if (bucket) bucket.push(expense);
      else grouped.set(key, [expense]);
    }
    const summaries: MonthSummary[] = [];
    for (const [monthKey, expenses] of grouped) {
      const interval = monthInterval(monthKey);
      if (!interval) continue;
      summaries.push({
        monthKey,
        monthStart: interval.start,
        settlement: settle(expenses),
        isSettled: settledKeys.has(monthKey),
      });
    }
    return summaries.sort((a, b) => (a.monthKey < b.monthKey ? 1 : a.monthKey > b.monthKey ? -1 : 0));
  }, [store.expenses, store.settledMonths]);
}
