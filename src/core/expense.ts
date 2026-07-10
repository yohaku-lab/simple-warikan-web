/**
 * Domain model port of SimpleWarikanCore (Swift). See the iOS repository at
 * ../simple-warikan/SimpleWarikanCore/Sources/SimpleWarikanCore/Models/Expense.swift
 * for the source of truth this was ported from — no code is shared between the two.
 *
 * `selfSharePercent` is the percentage of this expense that "me" is responsible for
 * (0...100, integer); the partner is responsible for the remainder. Kept as a plain
 * integer (not a ratio) so UI controls (slider, presets) and settlement math both work
 * against a 0...100 range without floating point surprises creeping into user input.
 */

export type Payer = "me" | "partner";

export interface Expense {
  id: string;
  /** Whole yen. Always an integer — yen has no subunit in practice. */
  amount: number;
  payer: Payer;
  /** 0-100 integer. Default 50. */
  selfSharePercent: number;
  memo: string;
  /** ISO 8601 string (includes time), e.g. "2026-07-09T10:30:00.000Z". */
  date: string;
}

export const DEFAULT_SELF_SHARE_PERCENT = 50;

/**
 * Amount "me" is responsible for, regardless of who actually paid.
 * amount is an integer yen value, but selfSharePercent may not divide it evenly
 * (e.g. 33%), so this can be fractional — callers round only at display time,
 * mirroring the iOS version's use of `Decimal` all the way through the settlement
 * math and rounding only when formatting.
 */
export function selfOwedAmount(expense: Pick<Expense, "amount" | "selfSharePercent">): number {
  return (expense.amount * expense.selfSharePercent) / 100;
}

export function partnerOwedAmount(expense: Pick<Expense, "amount" | "selfSharePercent">): number {
  return expense.amount - selfOwedAmount(expense);
}

export function createExpense(input: {
  amount: number;
  payer: Payer;
  selfSharePercent?: number;
  memo?: string;
  date?: string;
}): Expense {
  return {
    id: crypto.randomUUID(),
    amount: input.amount,
    payer: input.payer,
    selfSharePercent: input.selfSharePercent ?? DEFAULT_SELF_SHARE_PERCENT,
    memo: input.memo ?? "",
    date: input.date ?? new Date().toISOString(),
  };
}
