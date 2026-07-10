/**
 * localStorage-backed persistence. Single versioned JSON blob under one key — simplest
 * possible schema for a single-device, no-account app. `version` exists purely so a future
 * shape change has somewhere to branch; there is only one version today.
 */

import type { Expense, Payer } from "../core/expense";
import { DEFAULT_SELF_SHARE_PERCENT } from "../core/expense";

export const STORAGE_KEY = "simple-warikan:store";
export const CURRENT_VERSION = 1;

export interface Settings {
  partnerName: string;
  lastPayer: Payer;
  lastSharePercent: number;
}

export interface Store {
  version: 1;
  expenses: Expense[];
  settledMonths: string[];
  settings: Settings;
}

export const DEFAULT_PARTNER_NAME = "相手";

export function defaultStore(): Store {
  return {
    version: CURRENT_VERSION,
    expenses: [],
    settledMonths: [],
    settings: {
      partnerName: DEFAULT_PARTNER_NAME,
      lastPayer: "me",
      lastSharePercent: DEFAULT_SELF_SHARE_PERCENT,
    },
  };
}

class StoreValidationError extends Error {}

function isPayer(value: unknown): value is Payer {
  return value === "me" || value === "partner";
}

function isExpense(value: unknown): value is Expense {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.amount === "number" &&
    Number.isFinite(v.amount) &&
    isPayer(v.payer) &&
    typeof v.selfSharePercent === "number" &&
    Number.isInteger(v.selfSharePercent) &&
    v.selfSharePercent >= 0 &&
    v.selfSharePercent <= 100 &&
    typeof v.memo === "string" &&
    typeof v.date === "string" &&
    !Number.isNaN(Date.parse(v.date))
  );
}

function isSettings(value: unknown): value is Settings {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.partnerName === "string" &&
    isPayer(v.lastPayer) &&
    typeof v.lastSharePercent === "number" &&
    Number.isInteger(v.lastSharePercent) &&
    v.lastSharePercent >= 0 &&
    v.lastSharePercent <= 100
  );
}

/** Validates and normalizes an arbitrary JSON value into a `Store`. Throws with a
 * human-readable Japanese message if the shape doesn't match — used both for the initial
 * localStorage load (corrupt data falls back to default, see `loadStore`) and for
 * user-provided import files (where the caller should surface the message). */
export function parseStore(value: unknown): Store {
  if (typeof value !== "object" || value === null) {
    throw new StoreValidationError("データの形式が正しくありません。");
  }
  const v = value as Record<string, unknown>;
  if (v.version !== CURRENT_VERSION) {
    throw new StoreValidationError(`未対応のデータバージョンです（version: ${String(v.version)}）。`);
  }
  if (!Array.isArray(v.expenses) || !v.expenses.every(isExpense)) {
    throw new StoreValidationError("支出データの形式が正しくありません。");
  }
  if (!Array.isArray(v.settledMonths) || !v.settledMonths.every((m) => typeof m === "string")) {
    throw new StoreValidationError("精算済み月のデータ形式が正しくありません。");
  }
  if (!isSettings(v.settings)) {
    throw new StoreValidationError("設定データの形式が正しくありません。");
  }
  return {
    version: CURRENT_VERSION,
    expenses: v.expenses,
    settledMonths: v.settledMonths,
    settings: v.settings,
  };
}

export function loadStore(): Store {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStore();
  try {
    const parsed: unknown = JSON.parse(raw);
    return parseStore(parsed);
  } catch {
    // Corrupt or foreign data — don't crash the app, start fresh instead.
    return defaultStore();
  }
}

export function saveStore(store: Store): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function clearStore(): void {
  localStorage.removeItem(STORAGE_KEY);
}
