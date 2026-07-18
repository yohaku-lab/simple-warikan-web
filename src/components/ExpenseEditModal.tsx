import { useState } from "react";
import type { Expense, Payer } from "../core/expense";
import { fromDateInputValue, toDateInputValue } from "../core/format";
import { AmountInput } from "./AmountInput";
import { PayerSegment } from "./PayerSegment";
import { ShareSlider } from "./ShareSlider";

export interface ExpenseFormValues {
  amount: number;
  payer: Payer;
  selfSharePercent: number;
  memo: string;
  date: string;
}

interface Props {
  /** undefined = adding a new expense; present = editing this one. */
  expense?: Expense;
  /** Default date for a new expense (ignored when editing). */
  defaultDate: Date;
  partnerName: string;
  onClose: () => void;
  onSave: (values: ExpenseFormValues) => void;
  onDelete?: () => void;
}

/** Shared by "add a new expense" (expense === undefined) and "edit an existing expense",
 * mirroring ExpenseEditView.swift. A brand new expense always defaults to 自分/50% — the
 * "carry forward last payer/ratio" behavior lives only in the 記録 tab (RecordView),
 * matching the iOS app's split between the two entry points. */
export function ExpenseEditModal({ expense, defaultDate, partnerName, onClose, onSave, onDelete }: Props) {
  const baseDate = expense ? new Date(expense.date) : defaultDate;
  const [amountText, setAmountText] = useState(expense ? String(expense.amount) : "");
  const [payer, setPayer] = useState<Payer>(expense?.payer ?? "me");
  const [selfSharePercent, setSelfSharePercent] = useState(expense?.selfSharePercent ?? 50);
  const [memo, setMemo] = useState(expense?.memo ?? "");
  const [dateValue, setDateValue] = useState(toDateInputValue(baseDate));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const amount = /^[0-9]+$/.test(amountText) ? Number(amountText) : null;
  const canSave = amount !== null && amount > 0;

  function handleSave() {
    if (!canSave || amount === null) return;
    const date = fromDateInputValue(dateValue, baseDate) ?? baseDate;
    onSave({ amount, payer, selfSharePercent, memo, date: date.toISOString() });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button type="button" className="text-button" onClick={onClose}>
            キャンセル
          </button>
          <span className="modal-title">{expense ? "支出を編集" : "支出を追加"}</span>
          <button type="button" className="text-button" disabled={!canSave} onClick={handleSave}>
            保存
          </button>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="expense-amount">
            金額
          </label>
          <AmountInput id="expense-amount" value={amountText} onChange={setAmountText} />
        </div>

        <div className="field">
          <span className="field-label">日付</span>
          <input
            type="date"
            className="text-input"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
          />
        </div>

        <div className="field">
          <span className="field-label">支払った人</span>
          <PayerSegment value={payer} onChange={setPayer} partnerName={partnerName} />
        </div>

        <div className="field">
          <span className="field-label">負担割合</span>
          <ShareSlider value={selfSharePercent} onChange={setSelfSharePercent} partnerName={partnerName} amount={amount} />
          <p className="settings-section-footer">
            誰が支払ったかに関わらず、本来どちらがどれだけ負担すべきかの割合です。
          </p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="expense-memo">
            メモ（任意）
          </label>
          <input
            id="expense-memo"
            className="text-input"
            type="text"
            placeholder="例: 家賃、電気代"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        {expense && onDelete && (
          <div className="field">
            {confirmingDelete ? (
              <div className="section">
                <p className="settings-section-footer">本当にこの記録を削除しますか？元に戻せません。</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button type="button" className="secondary-button" onClick={() => setConfirmingDelete(false)}>
                    やめる
                  </button>
                  <button type="button" className="secondary-button" style={{ color: "var(--color-danger)" }} onClick={onDelete}>
                    削除する
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="text-button danger" onClick={() => setConfirmingDelete(true)}>
                この記録を削除
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
