import { useEffect, useState } from "react";
import { formatYen } from "../core/format";

interface Props {
  value: number;
  onChange: (percent: number) => void;
  partnerName: string;
  /** Total expense amount, so the split can be shown/entered in yen. null while empty. */
  amount: number | null;
}

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Self-share picker: a 0-100 slider plus direct numeric entry of either the percentage
 * or one's own yen amount, always showing both sides explicitly so it's never ambiguous
 * which number is "mine". When the amount is known, the split is shown live in yen. */
export function ShareSlider({ value, onChange, partnerName, amount }: Props) {
  const hasAmount = amount !== null && amount > 0;
  const selfAmount = hasAmount ? Math.round((amount * value) / 100) : null;
  const partnerAmount = selfAmount !== null && amount !== null ? amount - selfAmount : null;

  // Local text for the yen field so typing isn't fought by the round-trip through percent.
  // Re-synced from selfAmount whenever the field isn't focused (slider move, amount change).
  const [yenText, setYenText] = useState("");
  const [editingYen, setEditingYen] = useState(false);
  useEffect(() => {
    if (!editingYen) setYenText(selfAmount !== null ? String(selfAmount) : "");
  }, [selfAmount, editingYen]);

  return (
    <div>
      <div className="share-readout">
        自分 {value}%{selfAmount !== null && `（${formatYen(selfAmount)}）`}
        {" / "}
        {partnerName} {100 - value}%{partnerAmount !== null && `（${formatYen(partnerAmount)}）`}
      </div>
      <input
        type="range"
        className="share-slider"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="自分の負担割合"
      />
      <div className="share-inputs">
        <label className="share-input-field">
          <span className="share-input-label">比率</span>
          <input
            type="number"
            inputMode="numeric"
            className="text-input share-number"
            min={0}
            max={100}
            value={String(value)}
            onChange={(e) => onChange(clampPercent(Number(e.target.value)))}
            aria-label="自分の負担割合（％）"
          />
          <span className="share-input-unit">%</span>
        </label>
        <label className="share-input-field">
          <span className="share-input-label">自分の金額</span>
          <input
            type="number"
            inputMode="numeric"
            className="text-input share-number"
            min={0}
            max={amount ?? undefined}
            value={yenText}
            disabled={!hasAmount}
            placeholder={hasAmount ? undefined : "先に金額を入力"}
            onFocus={() => setEditingYen(true)}
            onBlur={() => setEditingYen(false)}
            onChange={(e) => {
              setYenText(e.target.value);
              if (amount === null || amount <= 0) return;
              const yen = Number(e.target.value);
              if (!Number.isFinite(yen)) return;
              onChange(clampPercent((yen / amount) * 100));
            }}
            aria-label="自分の負担額（円）"
          />
          <span className="share-input-unit">円</span>
        </label>
      </div>
    </div>
  );
}
