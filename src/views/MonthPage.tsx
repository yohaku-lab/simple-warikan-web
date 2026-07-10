import { useState } from "react";
import { ExpenseEditModal, type ExpenseFormValues } from "../components/ExpenseEditModal";
import { SettlementSummary } from "../components/SettlementSummary";
import { ChevronLeftIcon, PlusIcon, SealCheckIcon } from "../components/icons";
import type { Expense } from "../core/expense";
import { formatMonthDay, formatYearMonth, formatYen } from "../core/format";
import { monthInterval } from "../core/monthKey";
import { settle } from "../core/settlement";
import { useIsMonthSettled, useMonthExpenses } from "../hooks/useMonthExpenses";
import { useStore } from "../store/StoreContext";

interface Props {
  monthKey: string;
  /** Present only when reached via history drill-in. */
  onBack?: () => void;
}

/** Shared by the "今月" tab (current month) and history drill-in (past months) —
 * mirrors MonthView.swift. Settlement math and the expense list behave identically
 * either way; only the default date for a newly-added expense differs. */
export function MonthPage({ monthKey, onBack }: Props) {
  const { store, addExpense, updateExpense, deleteExpense, setMonthSettled } = useStore();
  const partnerName = store.settings.partnerName;
  const expenses = useMonthExpenses(monthKey);
  const isSettled = useIsMonthSettled(monthKey);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const interval = monthInterval(monthKey);
  const settlement = settle(expenses);

  const now = new Date();
  const defaultDateForNewExpense =
    interval && now >= interval.start && now < interval.end ? now : (interval?.start ?? now);

  function handleSaveNew(values: ExpenseFormValues) {
    addExpense(values);
    setIsAddingNew(false);
  }

  function handleSaveEdit(values: ExpenseFormValues) {
    if (!editingExpense) return;
    updateExpense(editingExpense.id, values);
    setEditingExpense(null);
  }

  function handleDelete() {
    if (!editingExpense) return;
    deleteExpense(editingExpense.id);
    setEditingExpense(null);
  }

  return (
    <div className="app-page">
      <div className="month-header">
        <div className="month-header-left">
          {onBack && (
            <button type="button" className="back-button" onClick={onBack} aria-label="履歴に戻る">
              <ChevronLeftIcon />
            </button>
          )}
          <span className="month-title">{formatYearMonth(interval?.start ?? now)}</span>
        </div>
        <button type="button" className="add-button" onClick={() => setIsAddingNew(true)} aria-label="支出を追加">
          <PlusIcon />
        </button>
      </div>

      <div className="section">
        <SettlementSummary settlement={settlement} partnerName={partnerName} />
        <div className="settle-row">
          {isSettled ? (
            <>
              <span className="settled-badge">
                <SealCheckIcon /> この月は精算済みです
              </span>
              <button type="button" className="text-button" onClick={() => setMonthSettled(monthKey, false)}>
                精算済みを解除
              </button>
            </>
          ) : (
            <button
              type="button"
              className="secondary-button"
              disabled={expenses.length === 0}
              onClick={() => setMonthSettled(monthKey, true)}
            >
              この月を精算済みにする
            </button>
          )}
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">まだ記録がありません</div>
          <div className="empty-state-desc">右上の＋から支出を記録しましょう</div>
        </div>
      ) : (
        <div className="section">
          <p className="section-label">記録</p>
          <ul className="expense-list">
            {expenses.map((expense) => (
              <li key={expense.id}>
                <button type="button" className="expense-row" onClick={() => setEditingExpense(expense)}>
                  <div className="expense-row-main">
                    <div className="expense-row-memo">{expense.memo.trim() === "" ? "支出" : expense.memo}</div>
                    <div className="expense-row-meta">
                      {formatMonthDay(new Date(expense.date))} ・ {expense.payer === "me" ? "自分" : partnerName}が支払い
                    </div>
                  </div>
                  <div className="expense-row-amount">{formatYen(expense.amount)}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="ad-slot" />

      {isAddingNew && (
        <ExpenseEditModal
          defaultDate={defaultDateForNewExpense}
          partnerName={partnerName}
          onClose={() => setIsAddingNew(false)}
          onSave={handleSaveNew}
        />
      )}
      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          defaultDate={new Date(editingExpense.date)}
          partnerName={partnerName}
          onClose={() => setEditingExpense(null)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
