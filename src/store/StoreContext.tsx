import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Payer } from "../core/expense";
import { createExpense } from "../core/expense";
import type { Settings, Store } from "../storage/schema";
import { requestPersistentStorage } from "../storage/persist";
import { clearStore, defaultStore, loadStore, saveStore } from "../storage/schema";

export interface NewExpenseInput {
  amount: number;
  payer: Payer;
  selfSharePercent: number;
  memo: string;
  date: string;
}

export interface ExpensePatch {
  amount?: number;
  payer?: Payer;
  selfSharePercent?: number;
  memo?: string;
  date?: string;
}

interface StoreContextValue {
  store: Store;
  addExpense: (input: NewExpenseInput) => void;
  updateExpense: (id: string, patch: ExpensePatch) => void;
  deleteExpense: (id: string) => void;
  setMonthSettled: (monthKey: string, settled: boolean) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceStore: (next: Store) => void;
  resetStore: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

/**
 * Single top-level provider holding the whole app's state. There is no server and no
 * account, so this is intentionally a flat client-side store: every mutation immediately
 * re-renders and persists synchronously to localStorage (see the effect below), matching
 * the iOS app's "every save is durable right away" behavior without needing SwiftData's
 * transaction machinery.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => loadStore());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const addExpense = useCallback((input: NewExpenseInput) => {
    // The user just entrusted us with data — the right moment to ask the browser to
    // protect this origin's storage from eviction (Firefox may show a dialog here).
    void requestPersistentStorage();
    setStore((prev) => ({
      ...prev,
      expenses: [...prev.expenses, createExpense(input)],
    }));
  }, []);

  const updateExpense = useCallback((id: string, patch: ExpensePatch) => {
    setStore((prev) => ({
      ...prev,
      expenses: prev.expenses.map((expense) => (expense.id === id ? { ...expense, ...patch } : expense)),
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((expense) => expense.id !== id),
    }));
  }, []);

  const setMonthSettled = useCallback((monthKey: string, settled: boolean) => {
    setStore((prev) => {
      const isCurrentlySettled = prev.settledMonths.includes(monthKey);
      if (settled === isCurrentlySettled) return prev;
      return {
        ...prev,
        settledMonths: settled
          ? [...prev.settledMonths, monthKey]
          : prev.settledMonths.filter((key) => key !== monthKey),
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setStore((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const replaceStore = useCallback((next: Store) => {
    void requestPersistentStorage();
    setStore(next);
  }, []);

  const resetStore = useCallback(() => {
    clearStore();
    setStore(defaultStore());
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      store,
      addExpense,
      updateExpense,
      deleteExpense,
      setMonthSettled,
      updateSettings,
      replaceStore,
      resetStore,
    }),
    [store, addExpense, updateExpense, deleteExpense, setMonthSettled, updateSettings, replaceStore, resetStore],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
