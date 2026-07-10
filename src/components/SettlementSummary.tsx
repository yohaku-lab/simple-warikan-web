import type { Settlement } from "../core/settlement";
import { settlementDirection } from "../core/settlement";
import { formatYen } from "../core/format";
import { CheckCircleIcon } from "./icons";

interface Props {
  settlement: Settlement;
  partnerName: string;
}

/** Turns a `Settlement` into the "who pays whom" headline — the single place both the
 * "今月" tab and history drill-in render this, so the wording never drifts between them. */
export function SettlementSummary({ settlement, partnerName }: Props) {
  const direction = settlementDirection(settlement);

  return (
    <div className="card settlement-card">
      {direction.kind === "partnerPaysMe" && (
        <>
          <div className="settlement-direction">
            {partnerName} → 自分
          </div>
          <div className="settlement-amount positive">{formatYen(direction.amount)}</div>
          <div className="settlement-sub">{partnerName}が自分に払う</div>
        </>
      )}
      {direction.kind === "iPayPartner" && (
        <>
          <div className="settlement-direction">
            自分 → {partnerName}
          </div>
          <div className="settlement-amount negative">{formatYen(direction.amount)}</div>
          <div className="settlement-sub">自分が{partnerName}に払う</div>
        </>
      )}
      {direction.kind === "settled" && (
        <>
          <CheckCircleIcon className="settlement-settled-icon" />
          <div className="settlement-amount settled">差額なし</div>
        </>
      )}

      <div className="settlement-breakdown">
        <div className="settlement-breakdown-item">
          <span className="settlement-breakdown-label">自分が支払った額</span>
          <span className="settlement-breakdown-value">{formatYen(settlement.totalPaidByMe)}</span>
        </div>
        <div className="settlement-breakdown-item">
          <span className="settlement-breakdown-label">{partnerName}が支払った額</span>
          <span className="settlement-breakdown-value">{formatYen(settlement.totalPaidByPartner)}</span>
        </div>
      </div>
    </div>
  );
}
