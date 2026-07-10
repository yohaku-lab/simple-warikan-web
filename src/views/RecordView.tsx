import { useRef, useState } from "react";
import { AmountInput } from "../components/AmountInput";
import { PayerSegment } from "../components/PayerSegment";
import { ShareSlider } from "../components/ShareSlider";
import { Toast } from "../components/Toast";
import { formatMonthDay, toDateInputValue } from "../core/format";
import { useStore } from "../store/StoreContext";

/**
 * The app's primary screen: a single always-visible form, no "+"/modal in the way —
 * mirrors RecordExpenseView.swift. Payer and share-ratio are bound directly to
 * `settings.lastPayer`/`lastSharePercent` (not local state) so they behave like the iOS
 * app's `@AppStorage` fields: every change persists immediately, and only amount/memo/date
 * reset after a save.
 */
export function RecordView() {
  const { store, addExpense, updateSettings } = useStore();
  const partnerName = store.settings.partnerName;

  const [amountText, setAmountText] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(() => new Date());
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const payer = store.settings.lastPayer;
  const selfSharePercent = store.settings.lastSharePercent;

  const amount = /^[0-9]+$/.test(amountText) ? Number(amountText) : null;
  const canSave = amount !== null && amount > 0;

  function handleRecord() {
    if (!canSave || amount === null) return;
    addExpense({ amount, payer, selfSharePercent, memo, date: date.toISOString() });

    setAmountText("");
    setMemo("");
    setDate(new Date());
    setIsEditingDate(false);

    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 1200);
  }

  return (
    <div className="app-page">
      <h1 className="page-title">記録する</h1>

      <div className="field">
        <label className="field-label" htmlFor="record-amount">
          金額
        </label>
        <AmountInput id="record-amount" value={amountText} onChange={setAmountText} />
      </div>

      <div className="field">
        <span className="field-label">支払った人</span>
        <PayerSegment value={payer} onChange={(p) => updateSettings({ lastPayer: p })} partnerName={partnerName} />
      </div>

      <div className="field">
        <span className="field-label">負担割合</span>
        <ShareSlider
          value={selfSharePercent}
          onChange={(percent) => updateSettings({ lastSharePercent: percent })}
          partnerName={partnerName}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="record-memo">
          メモ（任意）
        </label>
        <input
          id="record-memo"
          className="text-input"
          type="text"
          placeholder="例: 家賃、電気代"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div className="field">
        {isEditingDate ? (
          <div>
            <input
              type="date"
              className="text-input"
              value={toDateInputValue(date)}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                if (!y || !m || !d) return;
                setDate((prev) => {
                  const next = new Date(prev);
                  next.setFullYear(y, m - 1, d);
                  return next;
                });
              }}
            />
            <button
              type="button"
              className="date-toggle"
              onClick={() => {
                setDate(new Date());
                setIsEditingDate(false);
              }}
            >
              今日にする
            </button>
          </div>
        ) : (
          <button type="button" className="date-toggle" onClick={() => setIsEditingDate(true)}>
            日付を変更（{formatMonthDay(date)}）
          </button>
        )}
      </div>

      <button type="button" className="primary-button" disabled={!canSave} onClick={handleRecord}>
        記録する
      </button>

      <div className="ad-slot" />

      {showToast && <Toast message="記録しました" />}
    </div>
  );
}
