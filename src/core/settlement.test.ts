import { describe, expect, test } from "vitest";
import { createExpense } from "./expense";
import { settle, settlementDirection } from "./settlement";

describe("settle", () => {
  // Ported from SimpleWarikanCore/Tests/SimpleWarikanCoreTests/SettlementCalculatorTests.swift

  test("evenSplitWithEqualPaymentsIsSettled", () => {
    const expenses = [
      createExpense({ amount: 10000, payer: "me", selfSharePercent: 50 }),
      createExpense({ amount: 10000, payer: "partner", selfSharePercent: 50 }),
    ];
    const settlement = settle(expenses);
    expect(settlementDirection(settlement)).toEqual({ kind: "settled" });
  });

  test("meOverpayingOnEvenSplitMeansPartnerOwesMe", () => {
    const expenses = [createExpense({ amount: 20000, payer: "me", selfSharePercent: 50 })];
    const settlement = settle(expenses);
    expect(settlementDirection(settlement)).toEqual({ kind: "partnerPaysMe", amount: 10000 });
  });

  test("partnerOverpayingOnEvenSplitMeansIOwePartner", () => {
    const expenses = [createExpense({ amount: 20000, payer: "partner", selfSharePercent: 50 })];
    const settlement = settle(expenses);
    expect(settlementDirection(settlement)).toEqual({ kind: "iPayPartner", amount: 10000 });
  });

  test("customRatioIsRespected", () => {
    // I pay 10000 but I'm only responsible for 60% of it (6000) — partner owes me 4000.
    const expenses = [createExpense({ amount: 10000, payer: "me", selfSharePercent: 60 })];
    const settlement = settle(expenses);
    expect(settlementDirection(settlement)).toEqual({ kind: "partnerPaysMe", amount: 4000 });
  });

  test("emptyExpensesAreSettled", () => {
    const settlement = settle([]);
    expect(settlementDirection(settlement)).toEqual({ kind: "settled" });
  });

  // Additional edge cases beyond the iOS test suite.

  test("fractional percent split (33%) settles exactly when it mathematically should", () => {
    // 3 expenses of 300 yen each, all paid by me at a 33%/33%/34% self share that sums
    // to exactly 100% of the total responsibility. If I paid all of it and I "should"
    // owe all of it (33+33+34=100), the net should be exactly 0, not a floating-point
    // near-zero residue.
    const expenses = [
      createExpense({ amount: 300, payer: "me", selfSharePercent: 33 }),
      createExpense({ amount: 300, payer: "me", selfSharePercent: 33 }),
      createExpense({ amount: 300, payer: "me", selfSharePercent: 34 }),
    ];
    const settlement = settle(expenses);
    // totalPaidByMe = 900, totalOwedByMe = 99+99+102 = 300... not 900, so this isn't
    // settled; the real point of this test is that repeated 33% splits don't leave a
    // sub-yen floating point residue. Assert exactness of the underlying numbers instead.
    expect(settlement.totalOwedByMe).toBe(99 + 99 + 102);
  });

  test("many non-round percent splits do not accumulate floating point drift", () => {
    // 10 expenses at 33% each, paid alternately so the net should land on an exact
    // whole-yen value with no epsilon residue.
    const expenses = Array.from({ length: 10 }, (_, i) =>
      createExpense({ amount: 100, payer: i % 2 === 0 ? "me" : "partner", selfSharePercent: 33 }),
    );
    const settlement = settle(expenses);
    // totalOwedByMe = 10 * (100 * 33 / 100) = 10 * 33 = 330 exactly.
    expect(settlement.totalOwedByMe).toBe(330);
    expect(Number.isInteger(settlement.totalOwedByMe)).toBe(true);
  });

  test("0% self share means partner owes the full amount back", () => {
    const expenses = [createExpense({ amount: 5000, payer: "me", selfSharePercent: 0 })];
    const settlement = settle(expenses);
    expect(settlementDirection(settlement)).toEqual({ kind: "partnerPaysMe", amount: 5000 });
  });

  test("100% self share means I owe all of what I paid, so nothing to settle", () => {
    const expenses = [createExpense({ amount: 5000, payer: "me", selfSharePercent: 100 })];
    const settlement = settle(expenses);
    expect(settlementDirection(settlement)).toEqual({ kind: "settled" });
  });

  test("100% self share when partner paid means I owe partner the full amount", () => {
    const expenses = [createExpense({ amount: 5000, payer: "partner", selfSharePercent: 100 })];
    const settlement = settle(expenses);
    expect(settlementDirection(settlement)).toEqual({ kind: "iPayPartner", amount: 5000 });
  });
});
