import { useMemo } from "react";
import type { Expense } from "../core/expense";
import { isDateInMonth, type MonthKeyString } from "../core/monthKey";
import { useStore } from "../store/StoreContext";

/** Expenses within the given month, sorted date-descending (newest first). */
export function useMonthExpenses(monthKey: MonthKeyString): Expense[] {
  const { store } = useStore();
  return useMemo(() => {
    return store.expenses
      .filter((expense) => isDateInMonth(new Date(expense.date), monthKey))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [store.expenses, monthKey]);
}

export function useIsMonthSettled(monthKey: MonthKeyString): boolean {
  const { store } = useStore();
  return store.settledMonths.includes(monthKey);
}
