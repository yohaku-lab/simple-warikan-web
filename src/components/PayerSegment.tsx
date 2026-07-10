import type { Payer } from "../core/expense";

interface Props {
  value: Payer;
  onChange: (payer: Payer) => void;
  partnerName: string;
}

export function PayerSegment({ value, onChange, partnerName }: Props) {
  return (
    <div className="segmented" role="radiogroup" aria-label="支払った人">
      <button
        type="button"
        role="radio"
        aria-checked={value === "me"}
        className={`segmented-option${value === "me" ? " active" : ""}`}
        onClick={() => onChange("me")}
      >
        自分
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "partner"}
        className={`segmented-option${value === "partner" ? " active" : ""}`}
        onClick={() => onChange("partner")}
      >
        {partnerName}
      </button>
    </div>
  );
}
