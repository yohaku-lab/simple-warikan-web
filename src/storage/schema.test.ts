import { beforeEach, describe, expect, test } from "vitest";
import { createExpense } from "../core/expense";
import {
  CURRENT_VERSION,
  DEFAULT_PARTNER_NAME,
  STORAGE_KEY,
  defaultStore,
  loadStore,
  parseStore,
  saveStore,
} from "./schema";

describe("storage schema", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("loadStore returns a default store when nothing is saved", () => {
    const store = loadStore();
    expect(store).toEqual(defaultStore());
    expect(store.settings.partnerName).toBe(DEFAULT_PARTNER_NAME);
  });

  test("saveStore then loadStore round-trips expenses and settings", () => {
    const store = defaultStore();
    store.expenses.push(createExpense({ amount: 1234, payer: "partner", selfSharePercent: 40, memo: "電気代" }));
    store.settledMonths.push("2026-06");
    store.settings.partnerName = "夫";
    store.settings.lastPayer = "partner";
    store.settings.lastSharePercent = 40;

    saveStore(store);
    const loaded = loadStore();
    expect(loaded).toEqual(store);
  });

  test("loadStore falls back to default on corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(loadStore()).toEqual(defaultStore());
  });

  test("loadStore falls back to default when required fields are missing", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CURRENT_VERSION }));
    expect(loadStore()).toEqual(defaultStore());
  });

  test("parseStore rejects an unsupported version", () => {
    expect(() => parseStore({ ...defaultStore(), version: 999 })).toThrow();
  });

  test("parseStore rejects a non-object payload", () => {
    expect(() => parseStore(null)).toThrow();
    expect(() => parseStore("hello")).toThrow();
    expect(() => parseStore(42)).toThrow();
  });

  test("parseStore rejects an expense with an out-of-range selfSharePercent", () => {
    const store = defaultStore();
    store.expenses.push(createExpense({ amount: 100, payer: "me", selfSharePercent: 150 }));
    expect(() => parseStore(store)).toThrow();
  });

  test("parseStore rejects an expense with a non-numeric amount", () => {
    const bad = {
      ...defaultStore(),
      expenses: [{ id: "x", amount: "100", payer: "me", selfSharePercent: 50, memo: "", date: new Date().toISOString() }],
    };
    expect(() => parseStore(bad)).toThrow();
  });

  test("parseStore rejects an invalid payer value", () => {
    const bad = {
      ...defaultStore(),
      expenses: [{ id: "x", amount: 100, payer: "someone-else", selfSharePercent: 50, memo: "", date: new Date().toISOString() }],
    };
    expect(() => parseStore(bad)).toThrow();
  });

  test("parseStore accepts a well-formed store (import validation happy path)", () => {
    const store = defaultStore();
    store.expenses.push(createExpense({ amount: 500, payer: "me" }));
    const json = JSON.parse(JSON.stringify(store));
    expect(parseStore(json)).toEqual(store);
  });
});
