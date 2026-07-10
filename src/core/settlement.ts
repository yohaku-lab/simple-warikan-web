/**
 * Port of SimpleWarikanCore's Settlement.swift + SettlementCalculator.swift. `settle()` is
 * the single source of truth for "who owes whom" — every screen that needs a settlement
 * figure calls this instead of re-deriving it, so the math can never drift between views.
 */

import type { Expense } from "./expense";

export interface Settlement {
  totalPaidByMe: number;
  totalPaidByPartner: number;
  totalOwedByMe: number;
  totalOwedByPartner: number;
}

export type SettlementDirection =
  | { kind: "partnerPaysMe"; amount: number }
  | { kind: "iPayPartner"; amount: number }
  | { kind: "settled" };

/**
 * Positive: partner should pay this amount to me. Negative: I should pay -netAmount to
 * partner. Derived rather than stored so it can never drift out of sync with the totals.
 */
export function netAmount(settlement: Settlement): number {
  return settlement.totalPaidByMe - settlement.totalOwedByMe;
}

export function settlementDirection(settlement: Settlement): SettlementDirection {
  const net = netAmount(settlement);
  if (net > 0) return { kind: "partnerPaysMe", amount: net };
  if (net < 0) return { kind: "iPayPartner", amount: -net };
  return { kind: "settled" };
}

export function settle(expenses: Expense[]): Settlement {
  let totalPaidByMe = 0;
  let totalPaidByPartner = 0;
  let totalAmount = 0;
  // Accumulate amount * selfSharePercent as an integer (both operands are integers,
  // so this never loses precision) and divide by 100 exactly once at the end. Dividing
  // per-expense and summing the fractional results first — as a naive port of
  // `selfOwedAmount` would do — can accumulate binary floating-point drift across many
  // non-round percent splits (e.g. repeated 33% shares) and make a month that should
  // net to exactly 0 register as a fraction of a yen off, which would silently break
  // the "settled" direction check below.
  let totalOwedByMeScaled = 0;

  for (const expense of expenses) {
    if (expense.payer === "me") {
      totalPaidByMe += expense.amount;
    } else {
      totalPaidByPartner += expense.amount;
    }
    totalAmount += expense.amount;
    totalOwedByMeScaled += expense.amount * expense.selfSharePercent;
  }

  const totalOwedByMe = totalOwedByMeScaled / 100;
  const totalOwedByPartner = totalAmount - totalOwedByMe;

  return { totalPaidByMe, totalPaidByPartner, totalOwedByMe, totalOwedByPartner };
}
