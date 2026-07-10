import { useState } from "react";
import { normalizeAmountText } from "../core/format";

interface Props {
  id: string;
  value: string;
  onChange: (text: string) => void;
}

/** The yen-amount text field shared by RecordView and ExpenseEditModal.
 *
 * Digits must pass through a Japanese IME unharmed: while the IME is composing, characters
 * arrive as full-width （"１２３"） and are not yet committed. Sanitizing inside onChange at
 * that point deletes the composing text, which made the field impossible to type into with
 * the IME on. So while composing we store the raw text untouched, and normalize （full-width
 * → half-width, strip non-digits） only when composition ends or for direct non-IME input. */
export function AmountInput({ id, value, onChange }: Props) {
  const [isComposing, setIsComposing] = useState(false);

  return (
    <input
      id={id}
      className="amount-input"
      type="text"
      inputMode="numeric"
      placeholder="0"
      value={value}
      onChange={(e) => {
        onChange(isComposing ? e.target.value : normalizeAmountText(e.target.value));
      }}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={(e) => {
        setIsComposing(false);
        onChange(normalizeAmountText(e.currentTarget.value));
      }}
    />
  );
}
